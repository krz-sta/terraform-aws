data "archive_file" "active_session_lambda_zip" {
    type = "zip"
    source_dir = "${path.module}/src/active_session_handler"
    output_path = "${path.module}/src/active_session_handler.zip"
}

resource "aws_iam_role" "active_session_lambda_role" {
    name = "active_session_lambda_role"

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

resource "aws_iam_policy" "active_session_lambda_policy" {
    name = "active_session_lambda_policy"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = [
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Query",
                ]
                Effect = "Allow"
                Resource = [
                    aws_dynamodb_table.DBActiveSessions.arn,
                    aws_dynamodb_table.DBSessionHistory.arn,
                ]
            },
            {
                Action = [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                ]
                Effect = "Allow"
                Resource = "arn:aws:logs:*:*:*"
            }
        ]
    })
    
}

resource "aws_iam_role_policy_attachment" "active_session_lambda_policy_attachment" {
    role = aws_iam_role.active_session_lambda_role.name
    policy_arn = aws_iam_policy.active_session_lambda_policy.arn
}

resource "aws_lambda_permission" "active_session_lambda_permission" {
    statement_id = "AllowExecutionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.active_session_lambda.function_name
    principal = "apigateway.amazonaws.com"
    source_arn = "${aws_api_gateway_rest_api.WorkoutStatsAPI.execution_arn}/*"
}

resource "aws_lambda_function" "active_session_lambda" {
    function_name = "active_session_lambda"
    runtime = "nodejs20.x"
    handler = "index.handler"
    filename = data.archive_file.active_session_lambda_zip.output_path
    code_sha256 = data.archive_file.active_session_lambda_zip.output_base64sha256
    role = aws_iam_role.active_session_lambda_role.arn
}