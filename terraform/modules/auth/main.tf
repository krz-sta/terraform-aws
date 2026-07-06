resource "aws_cognito_user_pool" "this" {
  name = "${var.prefix}-user-pool"
}


resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.prefix}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}
