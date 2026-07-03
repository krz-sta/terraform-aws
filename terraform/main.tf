data "archive_file" "shared_libs_layer_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../src/layers/shared-libs-layer"
  output_path = "${path.root}/../dist/zip/shared-libs-layer.zip"
}

resource "aws_lambda_layer_version" "shared_libs_layer" {
  layer_name          = "shared-libs-layer"
  filename            = data.archive_file.shared_libs_layer_zip.output_path
  source_code_hash    = data.archive_file.shared_libs_layer_zip.output_base64sha256
  compatible_runtimes = ["nodejs24.x"]
}

module "storage" {
  source = "./modules/storage"
}

module "api" {
  source = "./modules/api"

  shared_libs_layer_arn = aws_lambda_layer_version.shared_libs_layer.arn

  ddb_active_sessions_table_name = module.storage.ddb_active_sessions_table_name
  ddb_active_sessions_table_arn  = module.storage.ddb_active_sessions_table_arn
  ddb_session_history_table_name = module.storage.ddb_session_history_table_name
  ddb_session_history_table_arn  = module.storage.ddb_session_history_table_arn
  ddb_session_history_stream_arn = module.storage.ddb_session_history_stream_arn
  ddb_user_stats_table_name      = module.storage.ddb_user_stats_table_name
  ddb_user_stats_table_arn       = module.storage.ddb_user_stats_table_arn

  cognito_user_pool_arn = module.auth.user_pool_arn
}

module "workers" {
  source = "./modules/workers"

  ddb_session_history_stream_arn  = module.storage.ddb_session_history_stream_arn
  s3_workouts_archive_bucket_name = module.storage.s3_workouts_archive_bucket_name
  s3_workouts_archive_bucket_arn  = module.storage.s3_workouts_archive_bucket_arn
  ddb_user_stats_table_name       = module.storage.ddb_user_stats_table_name
  ddb_user_stats_table_arn        = module.storage.ddb_user_stats_table_arn
}


module "auth" {
  source = "./modules/auth"
}
