locals {
  api_endpoints = {
    "get-status" = {
      method               = "GET"
      layers               = []
      env                  = {}
      policy               = ""
      create_custom_policy = false
      secured              = false
      resource_id          = aws_api_gateway_rest_api.api.root_resource_id
    }
    "start-session" = {
      method = "POST"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.start_session.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.active_session.id
    }
    "get-session" = {
      method = "GET"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.get_session.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.active_session.id
    }
    "cancel-session" = {
      method = "DELETE"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.cancel_session.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.active_session.id
    }
    "save-session" = {
      method = "POST"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
        SESSION_HISTORY_TABLE_NAME = var.session_history_table_name
      }
      policy               = data.aws_iam_policy_document.save_session.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.save.id
    }
    "add-exercise" = {
      method = "POST"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.exercise.id
    }
    "delete-exercise" = {
      method = "DELETE"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.exercise.id
    }
    "add-set" = {
      method = "POST"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.set.id
    }
    "update-set" = {
      method = "PUT"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.set.id
    }
    "delete-set" = {
      method = "DELETE"
      layers = [var.shared_libs_layer_arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = var.active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.set.id
    }
    "get-stats" = {
      method = "GET"
      layers = [var.shared_libs_layer_arn]
      env = {
        USER_STATS_TABLE_NAME = var.user_stats_table_name
      }
      policy               = data.aws_iam_policy_document.get_stats.json
      create_custom_policy = true
      secured              = true
      resource_id          = aws_api_gateway_resource.stats.id
    }
  }
}
