resource "aws_api_gateway_rest_api" "this" {
  name = "${var.prefix}-api"
}

resource "aws_api_gateway_resource" "active_session" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "active-session"
}

resource "aws_api_gateway_resource" "exercise" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.active_session.id
  path_part   = "exercise"
}

resource "aws_api_gateway_resource" "set" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.active_session.id
  path_part   = "set"
}

resource "aws_api_gateway_resource" "save" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.active_session.id
  path_part   = "save"
}

resource "aws_api_gateway_resource" "stats" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "stats"
}

module "api_endpoints" {
  source   = "../api_endpoint"
  for_each = var.endpoints

  api_id = aws_api_gateway_rest_api.this.id
  resource_id = (
    each.value.path == "/" ? aws_api_gateway_rest_api.this.root_resource_id :
    each.value.path == "/active-session" ? aws_api_gateway_resource.active_session.id :
    each.value.path == "/active-session/exercise" ? aws_api_gateway_resource.exercise.id :
    each.value.path == "/active-session/set" ? aws_api_gateway_resource.set.id :
    each.value.path == "/active-session/save" ? aws_api_gateway_resource.save.id :
    each.value.path == "/stats" ? aws_api_gateway_resource.stats.id :
    aws_api_gateway_rest_api.this.root_resource_id
  )
  http_method          = each.value.method
  lambda_invoke_arn    = each.value.lambda_invoke_arn
  lambda_function_name = each.value.lambda_function_name
  authorizer_id        = each.value.secured ? aws_api_gateway_authorizer.this.id : null
}

resource "aws_api_gateway_authorizer" "this" {
  name          = "${var.prefix}-cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  provider_arns = [var.cognito_user_pool_arn]
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode(var.endpoints))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [module.api_endpoints]
}

resource "aws_api_gateway_stage" "this" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  deployment_id = aws_api_gateway_deployment.this.id
}
