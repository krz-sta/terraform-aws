variable "endpoints" {
  type = map(object({
    path                 = string
    method               = string
    lambda_invoke_arn    = string
    lambda_function_name = string
    secured              = bool
  }))
}

variable "prefix" {
  type = string
}

variable "cognito_user_pool_arn" {
  type = string
}
