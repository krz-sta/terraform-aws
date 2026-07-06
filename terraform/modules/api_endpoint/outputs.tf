output "trigger_hash" {
  value = sha1(jsonencode([
    aws_api_gateway_method.method.id,
    aws_api_gateway_integration.integration.id,
  ]))
}
