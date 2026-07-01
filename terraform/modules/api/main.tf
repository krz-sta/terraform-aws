resource "aws_api_gateway_rest_api" "workout_stats_api" {
  name = "workout-stats-api"
}

resource "aws_api_gateway_resource" "resource_active_session" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id
  parent_id   = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
  path_part   = "active-session"
}

resource "aws_api_gateway_resource" "resource_exercise" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id
  parent_id   = aws_api_gateway_resource.resource_active_session.id
  path_part   = "exercise"
}

resource "aws_api_gateway_resource" "resource_set" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id
  parent_id   = aws_api_gateway_resource.resource_active_session.id
  path_part   = "set"
}

resource "aws_api_gateway_resource" "resource_save" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id
  parent_id   = aws_api_gateway_resource.resource_active_session.id
  path_part   = "save"
}

resource "aws_api_gateway_resource" "resource_stats" {
  rest_api_id = aws_api_gateway_rest_api.workout_stats_api.id
  parent_id   = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
  path_part   = "stats"
}

locals {
  api_endpoints = {
    "get-status" = {
      resource_id = aws_api_gateway_rest_api.workout_stats_api.root_resource_id
      method      = "GET"
      layers      = []
      env         = {}
      policy      = ""
    }
    "start-session" = {
      resource_id = aws_api_gateway_resource.resource_active_session.id
      method      = "POST"
      layers      = [var.shared_libs_layer_arn]
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
      resource_id = aws_api_gateway_resource.resource_active_session.id
      method      = "GET"
      layers      = [var.shared_libs_layer_arn]
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
      resource_id = aws_api_gateway_resource.resource_active_session.id
      method      = "DELETE"
      layers      = [var.shared_libs_layer_arn]
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
      resource_id = aws_api_gateway_resource.resource_save.id
      method      = "POST"
      layers      = [var.shared_libs_layer_arn]
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
              "dynamodb:PutItem",
              "dynamodb:UpdateItem"
            ]
            Resource = var.ddb_session_history_table_arn
          },
          {
            Effect = "Allow"
            Action = [
              "dynamodb:GetItem",
              "dynamodb:DeleteItem"
            ]
            Resource = var.ddb_active_sessions_table_arn
          }
        ]
      })
    }
    "add-exercise" = {
      resource_id = aws_api_gateway_resource.resource_exercise.id
      method      = "POST"
      layers      = [var.shared_libs_layer_arn]
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
    "delete-exercise" = {
      resource_id = aws_api_gateway_resource.resource_exercise.id
      method      = "DELETE"
      layers      = [var.shared_libs_layer_arn]
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
    "add-set" = {
      resource_id = aws_api_gateway_resource.resource_set.id
      method      = "POST"
      layers      = [var.shared_libs_layer_arn]
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
    "update-set" = {
      resource_id = aws_api_gateway_resource.resource_set.id
      method      = "PUT"
      layers      = [var.shared_libs_layer_arn]
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
    "delete-set" = {
      resource_id = aws_api_gateway_resource.resource_set.id
      method      = "DELETE"
      layers      = [var.shared_libs_layer_arn]
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
    "get-stats" = {
      resource_id = aws_api_gateway_resource.resource_stats.id
      method      = "GET"
      layers      = [var.shared_libs_layer_arn]
      env = {
        USER_STATS_TABLE_NAME = var.ddb_user_stats_table_name
      }
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "dynamodb:Query"
            ]
            Resource = var.ddb_user_stats_table_arn
          }
        ]
      })
    }
  }
}

module "api_endpoints" {
  source = "./modules/api_endpoint"

  for_each = local.api_endpoints

  name               = each.key
  api_id             = aws_api_gateway_rest_api.workout_stats_api.id
  resource_id        = each.value.resource_id
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

  depends_on = [module.api_endpoints]
}

resource "aws_api_gateway_stage" "workout_stats_api_stage" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.workout_stats_api.id
  deployment_id = aws_api_gateway_deployment.workout_stats_api_deployment.id
}
