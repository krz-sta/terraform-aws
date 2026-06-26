data "archive_file" "CancelSessionLambdaZip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/cancel-session"
  output_path = "${path.module}/dist/zip/cancel-session.zip"
}

resource "aws_iam_role" "CancelSessionLambdaRole" {
  name = "cancel-session-lambda-role"
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

resource "aws_iam_policy" "CancelSessionLambdaPolicy" {
  name        = "cancel-session-lambda-policy"
  description = "Allows cancel-session-lambda to write CloudWatch logs, and delete items in DynamoDB."
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
          "dynamodb:DeleteItem"
        ]
        Effect   = "Allow"
        Resource = "${aws_dynamodb_table.DBActiveSessions.arn}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "CancelSessionLambdaPolicyAttachment" {
  role       = aws_iam_role.CancelSessionLambdaRole.name
  policy_arn = aws_iam_policy.CancelSessionLambdaPolicy.arn
}

resource "aws_lambda_function" "CancelSessionLambda" {
  function_name = "cancel-session-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.CancelSessionLambdaZip.output_path
  code_sha256   = data.archive_file.CancelSessionLambdaZip.output_base64sha256
  role          = aws_iam_role.CancelSessionLambdaRole.arn

  layers = [
    aws_lambda_layer_version.SharedLibsLayer.arn
  ]

  environment {
    variables = {
      ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
    }
  }
}

resource "aws_lambda_permission" "CancelSessionLambdaPermission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.CancelSessionLambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "CancelSessionResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_resource.ActiveSessionResource.id
  path_part   = "cancel-session"
}

resource "aws_api_gateway_method" "CancelSessionMethod" {
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id   = aws_api_gateway_resource.CancelSessionResource.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "CancelSessionIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id             = aws_api_gateway_resource.CancelSessionResource.id
  http_method             = aws_api_gateway_method.CancelSessionMethod.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.CancelSessionLambda.invoke_arn
}
