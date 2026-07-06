data "aws_iam_policy_document" "start_session" {
  statement {
    actions   = ["dynamodb:Query", "dynamodb:PutItem"]
    resources = [module.storage.ddb_active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "get_session" {
  statement {
    actions   = ["dynamodb:GetItem"]
    resources = [module.storage.ddb_active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "cancel_session" {
  statement {
    actions   = ["dynamodb:DeleteItem"]
    resources = [module.storage.ddb_active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "save_session" {
  statement {
    actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [module.storage.ddb_session_history_table_arn]
  }
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:DeleteItem"]
    resources = [module.storage.ddb_active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "active_session_update" {
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:UpdateItem"]
    resources = [module.storage.ddb_active_sessions_table_arn]
  }
}

data "aws_iam_policy_document" "get_stats" {
  statement {
    actions   = ["dynamodb:Query"]
    resources = [module.storage.ddb_user_stats_table_arn]
  }
}
