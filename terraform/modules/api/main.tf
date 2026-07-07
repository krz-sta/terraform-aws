resource "aws_api_gateway_rest_api" "api" {
  name = "${var.prefix}-api"
}

resource "aws_api_gateway_resource" "active_session" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "active-session"
}

resource "aws_api_gateway_resource" "exercise" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.active_session.id
  path_part   = "exercise"
}

resource "aws_api_gateway_resource" "set" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.active_session.id
  path_part   = "set"
}

resource "aws_api_gateway_resource" "save" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.active_session.id
  path_part   = "save"
}

resource "aws_api_gateway_resource" "stats" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "stats"
}

module "api_iam" {
  source   = "../iam"
  for_each = local.api_endpoints

  name                 = "${var.prefix}-${each.key}"
  custom_policy_json   = each.value.policy
  create_custom_policy = each.value.create_custom_policy
}

module "api_lambda" {
  source   = "../lambda"
  for_each = local.api_endpoints

  name          = "${var.prefix}-${each.key}"
  zip_path      = "${path.root}/../dist/zip/${each.key}.zip"
  role_arn      = module.api_iam[each.key].role_arn
  layers        = each.value.layers
  env_variables = each.value.env
}

module "api_endpoints" {
  source   = "../api_endpoint"
  for_each = local.api_endpoints

  api_id               = aws_api_gateway_rest_api.api.id
  resource_id          = each.value.resource_id
  http_method          = each.value.method
  lambda_invoke_arn    = module.api_lambda[each.key].invoke_arn
  lambda_function_name = module.api_lambda[each.key].function_name
  authorizer_id        = each.value.secured ? aws_api_gateway_authorizer.api.id : null
}

resource "aws_api_gateway_authorizer" "api" {
  name          = "${var.prefix}-cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  provider_arns = [var.cognito_user_pool_arn]
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode(local.api_endpoints))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [module.api_endpoints]
}

resource "aws_api_gateway_stage" "api" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.api.id
}
