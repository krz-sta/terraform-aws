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

module "api_iam" {
  source   = "../iam"
  for_each = local.api_endpoints

  name                 = "${local.prefix}-${each.key}"
  custom_policy_json   = each.value.policy
  create_custom_policy = each.value.create_custom_policy
}

module "api_lambda" {
  source   = "../lambda"
  for_each = local.api_endpoints

  name          = "${local.prefix}-${each.key}"
  zip_path      = "${path.root}/../dist/zip/${each.key}.zip"
  role_arn      = module.api_iam[each.key].role_arn
  layers        = each.value.layers
  env_variables = each.value.env
}

module "api" {
  source = "../api"
  prefix = local.prefix

  endpoints = {
    for name, config in local.api_endpoints : name => {
      path                 = config.path
      method               = config.method
      lambda_invoke_arn    = module.api_lambda[name].invoke_arn
      lambda_function_name = module.api_lambda[name].function_name
      secured              = try(config.secured, true)
    }
  }

  cognito_user_pool_arn = module.auth.user_pool_arn
}

module "workers" {
  source = "../workers"
  prefix = local.prefix

  ddb_session_history_stream_arn  = module.storage.ddb_session_history_stream_arn
  s3_workouts_archive_bucket_name = module.storage.s3_workouts_archive_bucket_name
  s3_workouts_archive_bucket_arn  = module.storage.s3_workouts_archive_bucket_arn
  ddb_user_stats_table_name       = module.storage.ddb_user_stats_table_name
  ddb_user_stats_table_arn        = module.storage.ddb_user_stats_table_arn
}
