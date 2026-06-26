data "archive_file" "AddExerciseLambdaZip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/add-exercise"
  output_path = "${path.module}/dist/zip/add-exercise.zip"
}

resource "aws_iam_role" "AddExerciseLambdaRole" {
  name = "add-exercise-lambda-role"
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

resource "aws_iam_policy" "AddExerciseLambdaPolicy" {
  name        = "add-exercise-lambda-policy"
  description = "Allows add-exercise-lambda to write CloudWatch logs, Get and Update items in DynamoDB."
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

resource "aws_iam_role_policy_attachment" "AddExerciseLambdaPolicyAttachment" {
  role       = aws_iam_role.AddExerciseLambdaRole.name
  policy_arn = aws_iam_policy.AddExerciseLambdaPolicy.arn
}

resource "aws_lambda_function" "AddExerciseLambda" {
  function_name = "add-exercise-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.AddExerciseLambdaZip.output_path
  code_sha256   = data.archive_file.AddExerciseLambdaZip.output_base64sha256
  role          = aws_iam_role.AddExerciseLambdaRole.arn

  layers = [
    aws_lambda_layer_version.SharedLibsLayer.arn
  ]

  environment {
    variables = {
      ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
    }
  }
}

resource "aws_lambda_permission" "AddExerciseLambdaPermission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.AddExerciseLambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "AddExerciseResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_resource.ActiveSessionResource.id
  path_part   = "add-exercise"
}

resource "aws_api_gateway_method" "AddExerciseMethod" {
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id   = aws_api_gateway_resource.AddExerciseResource.id
  http_method   = "PATCH"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "AddExerciseIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  resource_id             = aws_api_gateway_resource.AddExerciseResource.id
  http_method             = aws_api_gateway_method.AddExerciseMethod.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.AddExerciseLambda.invoke_arn
}
