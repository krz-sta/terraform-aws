resource "aws_sns_topic" "session_events_topic" {
  name = "session-events-topic"
}

resource "aws_sqs_queue" "archive_queue" {
  name = "archive-queue"
}

resource "aws_sqs_queue" "stats_queue" {
  name = "stats-queue"
}

resource "aws_sns_topic_subscription" "archive_subscription" {
  topic_arn = aws_sns_topic.session_events_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.archive_queue.arn
}

resource "aws_sns_topic_subscription" "stats_subscription" {
  topic_arn = aws_sns_topic.session_events_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.stats_queue.arn
}

resource "aws_sqs_queue_policy" "sns_to_archive_sqs_policy" {
  queue_url = aws_sqs_queue.archive_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.archive_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.session_events_topic.arn
          }
        }
      }
    ]
  })
}

resource "aws_sqs_queue_policy" "sns_to_stats_sqs_policy" {
  queue_url = aws_sqs_queue.stats_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.stats_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.session_events_topic.arn
          }
        }
      }
    ]
  })
}

resource "aws_iam_role" "pipe_role" {
  name = "pipe-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "pipes.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "pipe_policy" {
  name = "pipe-policy"
  role = aws_iam_role.pipe_role.id
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
        Resource = var.ddb_session_history_stream_arn
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.session_events_topic.arn
      }
    ]
  })
}

resource "aws_pipes_pipe" "ddb_to_sns_pipe" {
  name     = "session-history-to-sns-pipe"
  role_arn = aws_iam_role.pipe_role.arn
  source   = var.ddb_session_history_stream_arn
  target   = aws_sns_topic.session_events_topic.arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position = "LATEST"
      batch_size        = 10
    }
  }
}
