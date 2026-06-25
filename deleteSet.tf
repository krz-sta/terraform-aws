data "archive_file" "DeleteSetLambdaZip" {
    type = "zip"
    source_dir = "${path.module}/dist/delete-set"
    output_path = "${path.module}/dist/zip/delete-set.zip"
}

resource "aws_iam_role" "DeleteSetLambdaRole" {
    name = "delete-set-lambda-role"
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

resource "aws_iam_policy" "DeleteSetLambdaPolicy" {
    name = "delete-set-lambda-policy"
    description = "Allows delete-set-lambda to write CloudWatch logs, Get and Update items in DynamoDB."
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
                Effect = "Allow"
                Resource = aws_dynamodb_table.DBActiveSessions.arn
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "DeleteSetLambdaPolicyAttachment" {
    role = aws_iam_role.DeleteSetLambdaRole.name
    policy_arn = aws_iam_policy.DeleteSetLambdaPolicy.arn
}

resource "aws_lambda_function" "DeleteSetLambda" {
    function_name = "delete-set-lambda"
    runtime = "nodejs24.x"
    handler = "index.handler"
    filename = data.archive_file.DeleteSetLambdaZip.output_path
    code_sha256 = data.archive_file.DeleteSetLambdaZip.output_base64sha256
    role = aws_iam_role.DeleteSetLambdaRole.arn
}

resource "aws_lambda_permission" "DeleteSetLambdaPermission" {
    statement_id = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.DeleteSetLambda.function_name
    principal = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "DeleteSetResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_resource.ActiveSessionResource.id
    path_part = "delete-set"
}

resource "aws_api_gateway_method" "DeleteSetMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.DeleteSetResource.id
    http_method = "PATCH"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "DeleteSetIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.DeleteSetResource.id
    http_method = aws_api_gateway_method.DeleteSetMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.DeleteSetLambda.invoke_arn
}