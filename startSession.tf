data "archive_file" "StartSessionLambdaZip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/start-session"
  output_path = "${path.module}/dist/zip/start-session.zip"
}

resource "aws_iam_role" "StartSessionLambdaRole" {
  name = "start-session-lambda-role"
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

resource "aws_iam_policy" "StartSessionLambdaPolicy" {
  name        = "start-session-lambda-policy"
  description = "Allows start-session-lambda to write CloudWatch logs, Query and Put items in DynamoDB."
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
          "dynamodb:Query",
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "StartSessionLambdaPolicyAttachment" {
  role       = aws_iam_role.StartSessionLambdaRole.name
  policy_arn = aws_iam_policy.StartSessionLambdaPolicy.arn
}

resource "aws_lambda_function" "StartSessionLambda" {
  function_name = "start-session-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.StartSessionLambdaZip.output_path
  code_sha256   = data.archive_file.StartSessionLambdaZip.output_base64sha256
  role          = aws_iam_role.StartSessionLambdaRole.arn

  layers = [
    aws_lambda_layer_version.SharedLibsLayer.arn
  ]
}

resource "aws_lambda_permission" "StartSessionLambdaPermission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.StartSessionLambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "StartSessionResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_resource.ActiveSessionResource.id
  path_part   = "start-session"
}

resource "aws_api_gateway_method" "StartSessionMethod" {
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id   = aws_api_gateway_resource.StartSessionResource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "StartSessionIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id             = aws_api_gateway_resource.StartSessionResource.id
  http_method             = aws_api_gateway_method.StartSessionMethod.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.StartSessionLambda.invoke_arn
}
