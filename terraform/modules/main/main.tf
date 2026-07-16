locals {
  prefix = var.project_name
}

resource "aws_lambda_layer_version" "shared_libs" {
  layer_name          = "${local.prefix}-shared-libs-layer"
  filename            = "${path.root}/../dist/zip/shared-libs-layer.zip"
  source_code_hash    = filebase64sha256("${path.root}/../dist/zip/shared-libs-layer.zip")
  compatible_runtimes = ["nodejs24.x"]
}

module "storage" {
  source = "../storage"
  prefix = local.prefix
}

module "auth" {
  source = "../auth"
  prefix = local.prefix
}

module "delete_data_workflow" {
  source = "../delete_data_workflow"
  prefix = local.prefix

  shared_libs_layer_arn = aws_lambda_layer_version.shared_libs.arn

  active_sessions_table_name   = module.storage.ddb_active_sessions_table_name
  active_sessions_table_arn    = module.storage.ddb_active_sessions_table_arn
  session_history_table_name   = module.storage.ddb_session_history_table_name
  session_history_table_arn    = module.storage.ddb_session_history_table_arn
  user_stats_table_name        = module.storage.ddb_user_stats_table_name
  user_stats_table_arn         = module.storage.ddb_user_stats_table_arn
  workouts_archive_bucket_name = module.storage.s3_workouts_archive_bucket_name
  workouts_archive_bucket_arn  = module.storage.s3_workouts_archive_bucket_arn
}

module "api" {
  source                = "../api"
  prefix                = local.prefix
  cognito_user_pool_arn = module.auth.user_pool_arn

  shared_libs_layer_arn = aws_lambda_layer_version.shared_libs.arn

  active_sessions_table_arn     = module.storage.ddb_active_sessions_table_arn
  active_sessions_table_name    = module.storage.ddb_active_sessions_table_name
  session_history_table_arn     = module.storage.ddb_session_history_table_arn
  session_history_table_name    = module.storage.ddb_session_history_table_name
  user_stats_table_arn          = module.storage.ddb_user_stats_table_arn
  user_stats_table_name         = module.storage.ddb_user_stats_table_name
  delete_data_state_machine_arn = module.delete_data_workflow.state_machine_arn
}

module "workers" {
  source = "../workers"
  prefix = local.prefix

  shared_libs_layer_arn = aws_lambda_layer_version.shared_libs.arn

  ddb_session_history_stream_arn  = module.storage.ddb_session_history_stream_arn
  s3_workouts_archive_bucket_name = module.storage.s3_workouts_archive_bucket_name
  s3_workouts_archive_bucket_arn  = module.storage.s3_workouts_archive_bucket_arn
  ddb_user_stats_table_name       = module.storage.ddb_user_stats_table_name
  ddb_user_stats_table_arn        = module.storage.ddb_user_stats_table_arn
}
