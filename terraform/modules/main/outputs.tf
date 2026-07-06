output "api_url" {
  value = module.api.api_url
}

output "cognito_user_pool_arn" {
  value = module.auth.user_pool_arn
}
