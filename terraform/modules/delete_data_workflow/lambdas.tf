module "check_active_session_iam" {
  source = "../iam"

  name                 = "${var.prefix}-check-active-session"
  custom_policy_json   = data.aws_iam_policy_document.check_active_session_iam.json
  create_custom_policy = true
}

module "check_active_session_lambda" {
  source = "../lambda"

  name     = "${var.prefix}-check-active-session"
  zip_path = "${path.root}/../dist/zip/check-active-session.zip"
  role_arn = module.check_active_session_iam.role_arn
  layers   = [var.shared_libs_layer_arn]
  timeout  = 5
  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
  }
}

module "delete_user_data_iam" {
  source = "../iam"

  name                 = "${var.prefix}-delete-user-data"
  custom_policy_json   = data.aws_iam_policy_document.delete_user_data_iam.json
  create_custom_policy = true
}

module "delete_user_data_lambda" {
  source = "../lambda"

  name     = "${var.prefix}-delete-user-data"
  zip_path = "${path.root}/../dist/zip/delete-user-data.zip"
  role_arn = module.delete_user_data_iam.role_arn
  layers   = [var.shared_libs_layer_arn]
  timeout  = 20
  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME   = var.active_sessions_table_name
    SESSION_HISTORY_TABLE_NAME   = var.session_history_table_name
    USER_STATS_TABLE_NAME        = var.user_stats_table_name
    WORKOUTS_ARCHIVE_BUCKET_NAME = var.workouts_archive_bucket_name
  }
}

module "cleanup_delete_data_iam" {
  source = "../iam"

  name                 = "${var.prefix}-cleanup-delete-data"
  custom_policy_json   = data.aws_iam_policy_document.delete_user_data_iam.json
  create_custom_policy = true
}

module "cleanup_delete_data_lambda" {
  source = "../lambda"

  name     = "${var.prefix}-cleanup-delete-data"
  zip_path = "${path.root}/../dist/zip/cleanup-delete-data.zip"
  role_arn = module.cleanup_delete_data_iam.role_arn
  layers   = [var.shared_libs_layer_arn]
  timeout  = 20
  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME   = var.active_sessions_table_name
    SESSION_HISTORY_TABLE_NAME   = var.session_history_table_name
    USER_STATS_TABLE_NAME        = var.user_stats_table_name
    WORKOUTS_ARCHIVE_BUCKET_NAME = var.workouts_archive_bucket_name
  }
}
