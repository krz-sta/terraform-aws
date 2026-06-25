data "archive_file" "AddSetLambdaZip" {
    type = "zip"
    source_dir = "${path.module}/dist/add-set"
    output_path = "${path.module}/dist/zip/add-set.zip"
}

resource "aws_iam_role" "AddSetLambdaRole" {
    name = "add-set-lambda-role"
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

resource "aws_iam_policy" "AddSetLambdaPolicy" {
    name = "add-set-lambda-policy"
    description = "Allows add-set-lambda to write CloudWatch logs, Get and Update items in DynamoDB."
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

resource "aws_iam_role_policy_attachment" "AddSetLambdaPolicyAttachment" {
    role = aws_iam_role.AddSetLambdaRole.name
    policy_arn = aws_iam_policy.AddSetLambdaPolicy.arn
}

resource "aws_lambda_function" "AddSetLambda" {
    function_name = "add-set-lambda"
    runtime = "nodejs24.x"
    handler = "index.handler"
    filename = data.archive_file.AddSetLambdaZip.output_path
    code_sha256 = data.archive_file.AddSetLambdaZip.output_base64sha256
    role = aws_iam_role.AddSetLambdaRole.arn
}

resource "aws_lambda_permission" "AddSetLambdaPermission" {
    statement_id = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.AddSetLambda.function_name
    principal = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "AddSetResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_resource.ActiveSessionResource.id
    path_part = "add-set"
}

resource "aws_api_gateway_method" "AddSetMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.AddSetResource.id
    http_method = "PATCH"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "AddSetIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.AddSetResource.id
    http_method = aws_api_gateway_method.AddSetMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.AddSetLambda.invoke_arn
}