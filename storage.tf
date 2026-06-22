resource "aws_s3_bucket" "S3WorkoutsArchive" {
    bucket_prefix = "s3-workouts-archive"
}

resource "aws_dynamodb_table" "DBActiveSessions" {
    name = "DBActiveSessions"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "UserId"
    range_key = "SessionId"

    attribute {
        name = "UserId"
        type = "S"
    }

    attribute {
        name = "SessionId"
        type = "S"
    }
}

resource "aws_dynamodb_table" "DBSessionHistory" {
    name = "DBSessionHistory"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "UserId"
    range_key = "SessionId"

    attribute {
        name = "UserId"
        type = "S"
    }

    attribute {
        name = "SessionId"
        type = "S"
    }
}

