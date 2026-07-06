resource "aws_s3_bucket" "workouts_archive" {
  bucket_prefix = "${var.prefix}-workouts-archive"
  force_destroy = true
}

resource "aws_dynamodb_table" "active_sessions" {
  name         = "${var.prefix}-active-sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"
  range_key    = "SessionId"

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "SessionId"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "session_history" {
  name         = "${var.prefix}-session-history"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"
  range_key    = "SessionId"

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "SessionId"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"
}

resource "aws_dynamodb_table" "user_stats" {
  name         = "${var.prefix}-user-stats"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"
  range_key    = "SK"

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }
}
