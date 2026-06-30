resource "aws_sqs_queue" "SQSSessionData" {
  name = "sqs-session-data"
}

resource "aws_iam_role" "SessionPipeRole" {
  name = "session-pipe-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "pipes.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "SessionPipePolicy" {
  name = "session-pipe-policy"
  role = aws_iam_role.SessionPipeRole.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams"
        ]
        Resource = aws_dynamodb_table.DBSessionHistory.stream_arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.SQSSessionData.arn
      }
    ]
  })
}

resource "aws_pipes_pipe" "SessionPipe" {
  name     = "session-pipe"
  role_arn = aws_iam_role.SessionPipeRole.arn
  source   = aws_dynamodb_table.DBSessionHistory.stream_arn
  target   = aws_sqs_queue.SQSSessionData.arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position = "LATEST"
    }
  }
}
