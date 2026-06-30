module "GetStatus" {
  source        = "./modules/api_endpoint"
  name          = "get-status"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
  http_method   = "GET"
}

module "StartSession" {
  source        = "./modules/api_endpoint"
  name          = "start-session"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "POST"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "GetSession" {
  source        = "./modules/api_endpoint"
  name          = "get-session"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "GET"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "CancelSession" {
  source        = "./modules/api_endpoint"
  name          = "cancel-session"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "DELETE"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "SaveSession" {
  source        = "./modules/api_endpoint"
  name          = "save-session"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "POST"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName,
    SESSION_HISTORY_TABLE_NAME = var.SessionHistoryDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.DBSessionHistory.arn
      }
    ]
  })
}

module "AddExercise" {
  source        = "./modules/api_endpoint"
  name          = "add-exercise"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "PATCH"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "DeleteExercise" {
  source        = "./modules/api_endpoint"
  name          = "delete-exercise"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "PATCH"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "AddSet" {
  source        = "./modules/api_endpoint"
  name          = "add-set"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "PATCH"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "DeleteSet" {
  source        = "./modules/api_endpoint"
  name          = "delete-set"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "PATCH"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}

module "UpdateSet" {
  source        = "./modules/api_endpoint"
  name          = "update-set"
  api_id        = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  api_parent_id = aws_api_gateway_resource.ActiveSessionResource.id
  http_method   = "PATCH"
  layers        = [aws_lambda_layer_version.SharedLibsLayer.arn]

  env_variables = {
    ACTIVE_SESSIONS_TABLE_NAME = var.ActiveSessionsDBTableName
  }

  custom_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.DBActiveSessions.arn
      }
    ]
  })
}
