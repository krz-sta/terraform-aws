data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../dist/${var.name}"
  output_path = "${path.root}/../dist/zip/${var.name}.zip"
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.name}-lambda-role"
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

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "custom_policy" {
  count  = var.custom_policy_json != "" ? 1 : 0
  name   = "${var.name}-custom-policy"
  policy = var.custom_policy_json
}

resource "aws_iam_role_policy_attachment" "custom_policy_attachment" {
  count      = var.custom_policy_json != "" ? 1 : 0
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.custom_policy[0].arn
}

resource "aws_lambda_function" "lambda" {
  function_name = "${var.name}-lambda"
  runtime       = "nodejs24.x"
  handler       = "handler.handler"
  filename      = data.archive_file.lambda_zip.output_path
  code_sha256   = data.archive_file.lambda_zip.output_base64sha256
  role          = aws_iam_role.lambda_role.arn
  layers        = var.layers

  dynamic "environment" {
    for_each = length(var.env_variables) > 0 ? [1] : []
    content {
      variables = var.env_variables
    }
  }
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = var.api_id
  resource_id   = var.resource_id
  http_method   = var.http_method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = var.api_id
  resource_id             = var.resource_id
  http_method             = var.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda.invoke_arn
}
