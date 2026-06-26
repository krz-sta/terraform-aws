data "archive_file" "UpdateSetLambdaZip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/update-set"
  output_path = "${path.module}/dist/zip/update-set.zip"
}

resource "aws_iam_role" "UpdateSetLambdaRole" {
  name = "update-set-lambda-role"
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

resource "aws_iam_policy" "UpdateSetLambdaPolicy" {
  name        = "update-set-lambda-policy"
  description = "Allows update-set-lambda to write CloudWatch logs, Get and Update items in DynamoDB."
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
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "UpdateSetLambdaPolicyAttachment" {
  role       = aws_iam_role.UpdateSetLambdaRole.name
  policy_arn = aws_iam_policy.UpdateSetLambdaPolicy.arn
}

resource "aws_lambda_function" "UpdateSetLambda" {
  function_name = "update-set-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.UpdateSetLambdaZip.output_path
  code_sha256   = data.archive_file.UpdateSetLambdaZip.output_base64sha256
  role          = aws_iam_role.UpdateSetLambdaRole.arn

  layers = [
    aws_lambda_layer_version.SharedLibsLayer.arn
  ]

  environment {
    variables = {
      ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
    }
  }
}

resource "aws_lambda_permission" "UpdateSetLambdaPermission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.UpdateSetLambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "UpdateSetResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_resource.ActiveSessionResource.id
  path_part   = "update-set"
}

resource "aws_api_gateway_method" "UpdateSetMethod" {
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id   = aws_api_gateway_resource.UpdateSetResource.id
  http_method   = "PATCH"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "UpdateSetIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id             = aws_api_gateway_resource.UpdateSetResource.id
  http_method             = aws_api_gateway_method.UpdateSetMethod.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.UpdateSetLambda.invoke_arn
}
