data "archive_file" "GetSessionLambdaZip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/get-session"
  output_path = "${path.module}/dist/zip/get-session.zip"
}

resource "aws_iam_role" "GetSessionLambdaRole" {
  name = "get-session-lambda-role"
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

resource "aws_iam_policy" "GetSessionLambdaPolicy" {
  name        = "get-session-lambda-policy"
  description = "Allows get-session-lambda to write CloudWatch logs and get items from DynamoDB."
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
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "GetSessionLambdaPolicyAttachment" {
  role       = aws_iam_role.GetSessionLambdaRole.name
  policy_arn = aws_iam_policy.GetSessionLambdaPolicy.arn
}

resource "aws_lambda_function" "GetSessionLambda" {
  function_name = "get-session-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.GetSessionLambdaZip.output_path
  code_sha256   = data.archive_file.GetSessionLambdaZip.output_base64sha256
  role          = aws_iam_role.GetSessionLambdaRole.arn

  layers = [
    aws_lambda_layer_version.SharedLibsLayer.arn
  ]

  environment {
    variables = {
      ACTIVE_SESSIONS_TABLE_NAME = aws_dynamodb_table.DBActiveSessions.name
    }
  }
}

resource "aws_lambda_permission" "GetSessionLambdaPermission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.GetSessionLambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "GetSessionResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_resource.ActiveSessionResource.id
  path_part   = "get-session"
}

resource "aws_api_gateway_method" "GetSessionMethod" {
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id   = aws_api_gateway_resource.GetSessionResource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "GetSessionIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id             = aws_api_gateway_resource.GetSessionResource.id
  http_method             = aws_api_gateway_method.GetSessionMethod.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.GetSessionLambda.invoke_arn
}
