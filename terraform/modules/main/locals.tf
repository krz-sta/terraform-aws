locals {
  api_endpoints = {
    "get-status" = {
      path                 = "/"
      method               = "GET"
      layers               = []
      env                  = {}
      policy               = ""
      create_custom_policy = false
      secured              = false
    }
    "start-session" = {
      path   = "/active-session"
      method = "POST"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.start_session.json
      create_custom_policy = true
    }
    "get-session" = {
      path   = "/active-session"
      method = "GET"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.get_session.json
      create_custom_policy = true
    }
    "cancel-session" = {
      path   = "/active-session"
      method = "DELETE"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.cancel_session.json
      create_custom_policy = true
    }
    "save-session" = {
      path   = "/active-session/save"
      method = "POST"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
        SESSION_HISTORY_TABLE_NAME = module.storage.ddb_session_history_table_name
      }
      policy               = data.aws_iam_policy_document.save_session.json
      create_custom_policy = true
    }
    "add-exercise" = {
      path   = "/active-session/exercise"
      method = "POST"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
    }
    "delete-exercise" = {
      path   = "/active-session/exercise"
      method = "DELETE"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
    }
    "add-set" = {
      path   = "/active-session/set"
      method = "POST"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
    }
    "update-set" = {
      path   = "/active-session/set"
      method = "PUT"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
    }
    "delete-set" = {
      path   = "/active-session/set"
      method = "DELETE"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        ACTIVE_SESSIONS_TABLE_NAME = module.storage.ddb_active_sessions_table_name
      }
      policy               = data.aws_iam_policy_document.active_session_update.json
      create_custom_policy = true
    }
    "get-stats" = {
      path   = "/stats"
      method = "GET"
      layers = [aws_lambda_layer_version.shared_libs.arn]
      env = {
        USER_STATS_TABLE_NAME = module.storage.ddb_user_stats_table_name
      }
      policy               = data.aws_iam_policy_document.get_stats.json
      create_custom_policy = true
    }
  }
}
