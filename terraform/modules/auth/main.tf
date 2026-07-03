resource "aws_cognito_user_pool" "pool" {
  name = "wsapi-user-pool"
}


resource "aws_cognito_user_pool_client" "client" {
  name         = "wsapi-client"
  user_pool_id = aws_cognito_user_pool.pool.id
}
