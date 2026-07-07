output "api_id" {
  value = aws_api_gateway_rest_api.api.id
}

output "api_url" {
  value = aws_api_gateway_stage.api.invoke_url
}

output "stage_name" {
  value = aws_api_gateway_stage.api.stage_name
}
