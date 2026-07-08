resource "aws_glue_catalog_database" "workout_analytics" {
  name = replace("${var.prefix}-analytics-db", "-", "_")
}

module "glue_iam" {
  source                 = "../iam"
  name                   = "${var.prefix}-glue-crawler"
  service_principal      = "glue.amazonaws.com"
  attach_basic_execution = false
  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject",
          "s3:PutObject"
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.workouts_archive.arn, "${aws_s3_bucket.workouts_archive.arn}/*",
          aws_s3_bucket.analytics_csv.arn, "${aws_s3_bucket.analytics_csv.arn}/*",
          aws_s3_bucket.athena_results.arn, "${aws_s3_bucket.athena_results.arn}/*",
          aws_s3_bucket.glue_scripts.arn, "${aws_s3_bucket.glue_scripts.arn}/*"
        ]
      }
    ]
  })
  create_custom_policy = true
}

resource "aws_iam_role_policy_attachment" "glue_service" {
  role       = module.glue_iam.role_name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

resource "aws_glue_crawler" "workout_analytics_crawler" {
  name          = "${var.prefix}-analytics-crawler"
  database_name = aws_glue_catalog_database.workout_analytics.name
  role          = module.glue_iam.role_arn
  table_prefix  = "workout_"

  s3_target {
    path = "s3://${aws_s3_bucket.analytics_csv.bucket}/parquet-to-csv/"
  }

  schema_change_policy {
    delete_behavior = "LOG"
    update_behavior = "UPDATE_IN_DATABASE"
  }

  configuration = jsonencode({
    Version = 1.0
    Grouping = {
      TableGroupingPolicy = "CombineCompatibleSchemas"
    }
    CrawlerOutput = {
      Partitions = {
        AddOrUpdateBehavior = "InheritFromTable"
      }
      Tables = {
        AddOrUpdateBehavior = "MergeNewColumns"
      }
    }
  })
}

resource "aws_s3_bucket" "athena_results" {
  bucket_prefix = "${var.prefix}-athena-"
}

resource "aws_s3_bucket" "analytics_csv" {
  bucket_prefix = "${var.prefix}-analytics-csv-"
  force_destroy = true
}

resource "aws_athena_workgroup" "workout_analytics_workgroup" {
  name          = "${var.prefix}-analytics-wg"
  force_destroy = true

  configuration {
    result_configuration {
      output_location = "s3://${aws_s3_bucket.athena_results.bucket}/"
    }
  }
}

resource "aws_s3_object" "glue_script" {
  bucket = aws_s3_bucket.glue_scripts.bucket
  key    = "scripts/parquet-to-csv.py"
  source = "${path.root}/../src/glue-jobs/parquet-to-csv.py"
  etag   = filemd5("${path.root}/../src/glue-jobs/parquet-to-csv.py")
}

resource "aws_glue_job" "parquet_to_csv" {
  name     = "convert-parquet-to-csv"
  role_arn = module.glue_iam.role_arn

  command {
    script_location = "s3://${aws_s3_object.glue_script.bucket}/${aws_s3_object.glue_script.key}"
    python_version  = "3"
  }

  glue_version      = "4.0"
  worker_type       = "G.1X"
  number_of_workers = 2

  default_arguments = {
    "--S3_INPUT_PATH"    = "s3://${aws_s3_bucket.workouts_archive.bucket}/"
    "--S3_OUTPUT_PATH"   = "s3://${aws_s3_bucket.analytics_csv.bucket}/"
    "--S3_OUTPUT_PREFIX" = "parquet-to-csv"
  }
}
