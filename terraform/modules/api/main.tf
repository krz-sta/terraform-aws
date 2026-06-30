resource "aws_api_gateway_rest_api" "workout_stats_api" {
  name = "workout-stats-api"
}

resource "aws_api_gateway_resource" "resource_active_session" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id
  parent_id   = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
  path_part   = "active-session"
}

locals {
  patch_session_endpoints = [
    "add-exercise",
    "delete-exercise",
    "add-set",
    "delete-set",
    "update-set"
  ]

  patch_defaults = {
    parent_id = aws_api_gateway_resource.resource_active_session.id
    method    = "PATCH"
    layers    = [var.shared_libs_layer_arn]
    env = {
      ACTIVE_SESSIONS_TABLE_NAME = var.ddb_active_sessions_table_name
    }
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Action = [
            "dynamodb:GetItem",
            "dynamodb:UpdateItem"
          ]
          Resource = var.ddb_active_sessions_table_arn
        }
      ]
    })
  }

  explicit_endpoints = {
    "get-status" = {
      parent_id = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
      method    = "GET"
      layers    = []
      env       = {}
      policy    = ""
    }
    "start-session" = {
      parent_id = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
      method    = "POST"
      layers    = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.ddb_active_sessions_table_name
      }
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "dynamodb:Query",
              "dynamodb:PutItem"
            ]
            Resource = var.ddb_active_sessions_table_arn
          }
        ]
      })
    }
    "get-session" = {
      parent_id = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
      method    = "GET"
      layers    = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.ddb_active_sessions_table_name
      }
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "dynamodb:GetItem"
            ]
            Resource = var.ddb_active_sessions_table_arn
          }
        ]
      })
    }
    "cancel-session" = {
      parent_id = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
      method    = "DELETE"
      layers    = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.ddb_active_sessions_table_name
      }
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "dynamodb:DeleteItem"
            ]
            Resource = var.ddb_active_sessions_table_arn
          }
        ]
      })
    }
    "save-session" = {
      parent_id = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
      method    = "POST"
      layers    = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.ddb_active_sessions_table_name
        SESSION_HISTORY_TABLE_NAME = var.ddb_session_history_table_name
      }
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "dynamodb:PutItem"
            ]
            Resource = var.ddb_session_history_table_arn
          },
          {
            Effect = "Allow"
            Action = [
              "dynamodb:DeleteItem"
            ]
            Resource = var.ddb_active_sessions_table_arn
          }
        ]
      })
    }
  }

  api_endpoints = merge(
    local.explicit_endpoints,
    { for endpoint in local.patch_session_endpoints : endpoint => local.patch_defaults }
  )
}

module "api_endpoints" {
  source = "./modules/api_endpoint"

  for_each = local.api_endpoints

  name               = each.key
  api_id             = aws_api_gateway_rest_api.workout_stats_api.id
  api_parent_id      = each.value.parent_id
  http_method        = each.value.method
  layers             = each.value.layers
  env_variables      = each.value.env
  custom_policy_json = each.value.policy
}

resource "aws_api_gateway_deployment" "workout_stats_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id

  triggers = {
    redeployment = sha1(jsonencode(local.api_endpoints))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "workout_stats_api_stage" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.workout_stats_api.id
  deployment_id = aws_api_gateway_deployment.workout_stats_api_deployment.id
}
