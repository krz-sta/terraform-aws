data "archive_file" "status_lambda_zip" {
    type = "zip"
    source_dir = "${path.module}/src/status"
    output_path = "${path.module}/src/status.zip"
}

resource "aws_iam_role" "status_lambda_role" {
    name = "status_lambda_role"

    assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
        {
            Action = "sts:AssumeRole"
            Effect = "Allow"
            Principal = {
                Service = "lambda.amazonaws.com"
            }
        },
    ]
    })
}

resource "aws_lambda_permission" "status_lambda_permission" {
    statement_id = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.status_lambda.function_name
    principal = "apigateway.amazonaws.com"
    source_arn = "${aws_api_gateway_rest_api.WorkoutStatsAPI.execution_arn}/*"
}

resource "aws_lambda_function" "status_lambda" {
    function_name = "status_lambda"
    runtime = "nodejs20.x"
    handler = "index.handler"
    filename = data.archive_file.status_lambda_zip.output_path
    code_sha256 = data.archive_file.status_lambda_zip.output_base64sha256
    role = aws_iam_role.status_lambda_role.arn
}