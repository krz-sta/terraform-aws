data "archive_file" "SaveSessionLambdaZip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/save-session"
  output_path = "${path.module}/dist/zip/save-session.zip"
}

resource "aws_iam_role" "SaveSessionLambdaRole" {
  name = "save-session-lambda-role"
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

resource "aws_iam_policy" "SaveSessionLambdaPolicy" {
  name        = "save-session-lambda-policy"
  description = "Allows save-session-lambda to write CloudWatch logs, Get and TransactWrite items in DynamoDB."
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:eu-central-1:*:*"
      },
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:DeleteItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      },
      {
        Action = [
          "dynamodb:PutItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.DBSessionHistory.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "SaveSessionLambdaPolicyAttachment" {
  role       = aws_iam_role.SaveSessionLambdaRole.name
  policy_arn = aws_iam_policy.SaveSessionLambdaPolicy.arn
}

resource "aws_lambda_function" "SaveSessionLambda" {
  function_name = "save-session-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.SaveSessionLambdaZip.output_path
  code_sha256   = data.archive_file.SaveSessionLambdaZip.output_base64sha256
  role          = aws_iam_role.SaveSessionLambdaRole.arn

  layers = [
    aws_lambda_layer_version.SharedLibsLayer.arn
  ]

  environment {
    variables = {
      ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
      SESSION_HISTORY_TABLE_NAME = var.SessionHistoryDBTableName
    }
  }
}

resource "aws_lambda_permission" "SaveSessionLambdaPermission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.SaveSessionLambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "SaveSessionResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
  path_part   = "save-session"
}

resource "aws_api_gateway_method" "SaveSessionMethod" {
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id   = aws_api_gateway_resource.SaveSessionResource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "SaveSessionIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id             = aws_api_gateway_resource.SaveSessionResource.id
  http_method             = aws_api_gateway_method.SaveSessionMethod.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.SaveSessionLambda.invoke_arn
}
