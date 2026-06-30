resource "aws_s3_bucket" "s3_workouts_archive" {
  bucket_prefix = "s3-workouts-archive"
}

resource "aws_dynamodb_table" "ddb_active_sessions" {
  name         = "db-active-sessions"
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

resource "aws_dynamodb_table" "ddb_session_history" {
  name         = "db-session-history"
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

resource "aws_dynamodb_table" "ddb_user_stats" {
  name         = "db-user-stats"
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
