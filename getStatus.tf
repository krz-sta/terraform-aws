data "archive_file" "GetStatusLambdaZip" {
    type = "zip"
    source_dir = "${path.module}/dist/get-status"
    output_path = "${path.module}/dist/zip/get-status.zip"
}

resource "aws_iam_role" "GetStatusLambdaRole" {
    name = "get-status-lambda-role"
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

resource "aws_iam_policy" "GetStatusLambdaPolicy" {
    name = "get-status-lambda-policy"
    description = "Allows get-status-lambda to write CloudWatch logs."
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
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "GetStatusLambdaPolicyAttachment" {
    role = aws_iam_role.GetStatusLambdaRole.name
    policy_arn = aws_iam_policy.GetStatusLambdaPolicy.arn
}

resource "aws_lambda_function" "GetStatusLambda" {
    function_name = "get-status-lambda"
    runtime = "nodejs24.x"
    handler = "index.handler"
    filename = data.archive_file.GetStatusLambdaZip.output_path
    code_sha256 = data.archive_file.GetStatusLambdaZip.output_base64sha256
    role = aws_iam_role.GetStatusLambdaRole.arn
}

resource "aws_lambda_permission" "GetStatusLambdaPermission" {
    statement_id = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.GetStatusLambda.function_name
    principal = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_resource" "GetStatusResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
    path_part = "get-status"
}

resource "aws_api_gateway_method" "GetStatusMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.GetStatusResource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "GetStatusStatusIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.GetStatusResource.id
    http_method = aws_api_gateway_method.GetStatusMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri =  aws_lambda_function.GetStatusLambda.invoke_arn
}
