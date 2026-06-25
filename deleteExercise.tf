data "archive_file" "DeleteExerciseLambdaZip" {
    type = "zip"
    source_dir = "${path.module}/dist/delete-exercise"
    output_path = "${path.module}/dist/zip/delete-exercise.zip"
}

resource "aws_iam_role" "DeleteExerciseLambdaRole" {
    name = "delete-exercise-lambda-role"
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

resource "aws_iam_policy" "DeleteExerciseLambdaPolicy" {
    name = "delete-exercise-lambda-policy"
    description = "Allows delete-exercise-lambda to write CloudWatch logs, Get and Update items in DynamoDB."
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
                    "dynamodb:UpdateItem"
                ]
                Effect = "Allow"
                Resource = aws_dynamodb_table.DBActiveSessions.arn
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "DeleteExerciseLambdaPolicyAttachment" {
    role = aws_iam_role.DeleteExerciseLambdaRole.name
    policy_arn = aws_iam_policy.DeleteExerciseLambdaPolicy.arn
}

resource "aws_lambda_function" "DeleteExerciseLambda" {
    function_name = "delete-exercise-lambda"
    runtime = "nodejs24.x"
    handler = "index.handler"
    filename = data.archive_file.DeleteExerciseLambdaZip.output_path
    code_sha256 = data.archive_file.DeleteExerciseLambdaZip.output_base64sha256
    role = aws_iam_role.DeleteExerciseLambdaRole.arn
}

resource "aws_lambda_permission" "DeleteExerciseLambdaPermission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.DeleteExerciseLambda.function_name
    principal = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "DeleteExerciseResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_resource.ActiveSessionResource.id
    path_part = "delete-exercise"
}

resource "aws_api_gateway_method" "DeleteExerciseMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.DeleteExerciseResource.id
    http_method = "PATCH"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "DeleteExerciseIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.DeleteExerciseResource.id
    http_method = aws_api_gateway_method.DeleteExerciseMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.DeleteExerciseLambda.invoke_arn
}