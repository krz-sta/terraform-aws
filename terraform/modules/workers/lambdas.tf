module "archive_iam" {
  source = "../iam"

  name                 = "${var.prefix}-archive-workout"
  custom_policy_json   = data.aws_iam_policy_document.archive_iam.json
  create_custom_policy = true
}

module "archive_lambda" {
  source = "../lambda"

  name     = "${var.prefix}-archive-workout"
  zip_path = "${path.root}/../dist/zip/archive-workout.zip"
  role_arn = module.archive_iam.role_arn
  env_variables = {
    WORKOUTS_ARCHIVE_BUCKET_NAME = var.s3_workouts_archive_bucket_name
  }
}

resource "aws_lambda_event_source_mapping" "archive_lambda_sqs_trigger" {
  event_source_arn = aws_sqs_queue.archive.arn
  function_name    = module.archive_lambda.function_arn
  batch_size       = 10
}

module "stats_iam" {
  source = "../iam"

  name                 = "${var.prefix}-update-stats"
  custom_policy_json   = data.aws_iam_policy_document.stats_iam.json
  create_custom_policy = true
}

module "stats_lambda" {
  source = "../lambda"

  name     = "${var.prefix}-update-stats"
  zip_path = "${path.root}/../dist/zip/update-stats.zip"
  role_arn = module.stats_iam.role_arn
  env_variables = {
    USER_STATS_TABLE_NAME = var.ddb_user_stats_table_name
  }
}

resource "aws_lambda_event_source_mapping" "stats_lambda_sqs_trigger" {
  event_source_arn = aws_sqs_queue.stats.arn
  function_name    = module.stats_lambda.function_arn
  batch_size       = 10
}
