resource "aws_sns_topic" "session_events" {
  name = "${var.prefix}-session-events"
}

resource "aws_sqs_queue" "archive" {
  name = "${var.prefix}-archive-queue"
}

resource "aws_sqs_queue" "stats" {
  name = "${var.prefix}-stats-queue"
}

resource "aws_sns_topic_subscription" "archive" {
  topic_arn = aws_sns_topic.session_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.archive.arn
}

resource "aws_sns_topic_subscription" "stats" {
  topic_arn = aws_sns_topic.session_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.stats.arn
}

resource "aws_sqs_queue_policy" "archive" {
  queue_url = aws_sqs_queue.archive.id
  policy    = data.aws_iam_policy_document.sns_to_archive_sqs_policy.json
}

resource "aws_sqs_queue_policy" "stats" {
  queue_url = aws_sqs_queue.stats.id
  policy    = data.aws_iam_policy_document.sns_to_stats_sqs_policy.json
}

module "pipe_iam" {
  source                 = "../iam"
  name                   = "${var.prefix}-pipe"
  service_principal      = "pipes.amazonaws.com"
  attach_basic_execution = false
  custom_policy_json     = data.aws_iam_policy_document.pipe_iam.json
  create_custom_policy   = true
}

resource "aws_pipes_pipe" "ddb_to_sns" {
  name     = "${var.prefix}-history-to-sns"
  role_arn = module.pipe_iam.role_arn
  source   = var.ddb_session_history_stream_arn
  target   = aws_sns_topic.session_events.arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position = "LATEST"
      batch_size        = 10
    }
  }
}
