data "archive_file" "archive_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../dist/archive-workout"
  output_path = "${path.root}/../dist/zip/archive-workout.zip"
}

resource "aws_iam_role" "archive_lambda_role" {
  name = "archive-workout-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "archive_lambda_basic_execution" {
  role       = aws_iam_role.archive_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "archive_lambda_custom_policy" {
  name = "archive-workout-lambda-custom-policy"
  role = aws_iam_role.archive_lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = [
          "${var.s3_workouts_archive_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [
          aws_sqs_queue.archive_queue.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "archive_lambda" {
  function_name = "archive-workout-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.archive_lambda_zip.output_path
  code_sha256   = data.archive_file.archive_lambda_zip.output_base64sha256
  role          = aws_iam_role.archive_lambda_role.arn

  environment {
    variables = {
      WORKOUTS_ARCHIVE_BUCKET_NAME = var.s3_workouts_archive_bucket_name
    }
  }
}

resource "aws_lambda_event_source_mapping" "archive_lambda_sqs_trigger" {
  event_source_arn = aws_sqs_queue.archive_queue.arn
  function_name    = aws_lambda_function.archive_lambda.arn
  batch_size       = 10
}

data "archive_file" "stats_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../dist/update-stats"
  output_path = "${path.root}/../dist/zip/update-stats.zip"
}

resource "aws_iam_role" "stats_lambda_role" {
  name = "update-stats-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "stats_lambda_basic_execution" {
  role       = aws_iam_role.stats_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "stats_lambda_custom_policy" {
  name = "update-stats-lambda-custom-policy"
  role = aws_iam_role.stats_lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
        ]
        Resource = [
          var.ddb_user_stats_table_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [
          aws_sqs_queue.stats_queue.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "stats_lambda" {
  function_name = "update-stats-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.stats_lambda_zip.output_path
  code_sha256   = data.archive_file.stats_lambda_zip.output_base64sha256
  role          = aws_iam_role.stats_lambda_role.arn

  environment {
    variables = {
      USER_STATS_TABLE_NAME = var.ddb_user_stats_table_name
    }
  }
}

resource "aws_lambda_event_source_mapping" "stats_lambda_sqs_trigger" {
  event_source_arn = aws_sqs_queue.stats_queue.arn
  function_name    = aws_lambda_function.stats_lambda.arn
  batch_size       = 10
}
