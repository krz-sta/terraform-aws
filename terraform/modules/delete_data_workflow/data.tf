data "aws_iam_policy_document" "check_active_session_iam" {
  statement {
    actions   = ["dynamodb:Query"]
    resources = [var.active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "delete_user_data_iam" {
  statement {
    actions   = ["dynamodb:Query"]
    resources = [var.active_sessions_table_arn]
  }

  statement {
    actions = [
      "dynamodb:Query",
      "dynamodb:DeleteItem"
    ]
    resources = [
      var.session_history_table_arn,
      var.user_stats_table_arn
    ]
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = [var.workouts_archive_bucket_arn]
  }

  statement {
    actions   = ["s3:DeleteObject"]
    resources = ["${var.workouts_archive_bucket_arn}/*"]
  }
}

data "aws_iam_policy_document" "delete_data_state_machine_iam" {
  statement {
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.check_active_session_lambda.function_arn,
      module.delete_user_data_lambda.function_arn,
      module.cleanup_delete_data_lambda.function_arn
    ]
  }

  statement {
    actions = [
      "logs:CreateLogDelivery",
      "logs:GetLogDelivery",
      "logs:UpdateLogDelivery",
      "logs:DeleteLogDelivery",
      "logs:ListLogDeliveries",
      "logs:PutResourcePolicy",
      "logs:DescribeResourcePolicies",
      "logs:DescribeLogGroups"
    ]
    resources = ["*"]
  }
}
