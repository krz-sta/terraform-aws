resource "aws_lambda_function" "function" {
  function_name    = "${var.name}-lambda"
  runtime          = var.runtime
  handler          = var.handler
  filename         = var.zip_path
  source_code_hash = filebase64sha256(var.zip_path)
  role             = var.role_arn
  layers           = var.layers

  dynamic "environment" {
    for_each = length(var.env_variables) > 0 ? [1] : []
    content {
      variables = var.env_variables
    }
  }
}
