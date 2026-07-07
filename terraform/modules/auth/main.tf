resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.prefix}-user-pool"
}


resource "aws_cognito_user_pool_client" "client" {
  name         = "${var.prefix}-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}
