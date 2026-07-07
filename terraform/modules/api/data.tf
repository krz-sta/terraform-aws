data "aws_iam_policy_document" "start_session" {
  statement {
    actions   = ["dynamodb:Query", "dynamodb:PutItem"]
    resources = [var.active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "get_session" {
  statement {
    actions   = ["dynamodb:GetItem"]
    resources = [var.active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "cancel_session" {
  statement {
    actions   = ["dynamodb:DeleteItem"]
    resources = [var.active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "save_session" {
  statement {
    actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [var.session_history_table_arn]
  }
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:DeleteItem"]
    resources = [var.active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "active_session_update" {
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:UpdateItem"]
    resources = [var.active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "get_stats" {
  statement {
    actions   = ["dynamodb:Query"]
    resources = [var.user_stats_table_arn]
  }
}
