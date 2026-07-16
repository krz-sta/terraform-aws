module "delete_data_state_machine_iam" {
  source = "../iam"

  name                   = "${var.prefix}-delete-data-state-machine"
  service_principal      = "states.amazonaws.com"
  attach_basic_execution = false
  custom_policy_json     = data.aws_iam_policy_document.delete_data_state_machine_iam.json
  create_custom_policy   = true
}

locals {
  workflow_failure_catch = [
    {
      ErrorEquals = ["States.ALL"]
      ResultPath  = "$.workflowError"
      Next        = "WorkflowFailed"
    }
  ]
  partial_deletion_catch = [
    {
      ErrorEquals = ["States.ALL"]
      ResultPath  = "$.workflowError"
      Next        = "CleanupPartialDeletion"
    }
  ]
  lambda_service_retry = [
    {
      ErrorEquals = [
        "Lambda.ServiceException",
        "Lambda.AWSLambdaException",
        "Lambda.SdkClientException",
        "Lambda.TooManyRequestsException"
      ]
      IntervalSeconds = 1
      MaxAttempts     = 2
      BackoffRate     = 2
    }
  ]
}

resource "aws_cloudwatch_log_group" "delete_data" {
  name              = "/aws/vendedlogs/states/${var.prefix}-delete-data"
  retention_in_days = 14
}

resource "aws_sfn_state_machine" "delete_data" {
  name     = "${var.prefix}-delete-data-fn"
  role_arn = module.delete_data_state_machine_iam.role_arn
  type     = "EXPRESS"

  logging_configuration {
    level                  = "ALL"
    include_execution_data = false
    log_destination        = "${aws_cloudwatch_log_group.delete_data.arn}:*"
  }

  definition = jsonencode({
    Comment = "Delete user data when no active session exists"
    StartAt = "CheckActiveSession"
    States = {
      CheckActiveSession = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = module.check_active_session_lambda.function_arn
          Payload = {
            "userId.$" = "$.userId"
          }
        }
        ResultSelector = {
          "hasActiveSession.$" = "$.Payload.hasActiveSession"
        }
        ResultPath = "$.sessionCheck"
        Next       = "HasActiveSession"
        Catch      = local.workflow_failure_catch
      }
      HasActiveSession = {
        Type = "Choice"
        Choices = [
          {
            Variable      = "$.sessionCheck.hasActiveSession"
            BooleanEquals = true
            Next          = "ActiveSessionExists"
          }
        ]
        Default = "DeleteUserData"
      }
      ActiveSessionExists = {
        Type = "Pass"
        Parameters = {
          status  = "BLOCKED"
          message = "Data cannot be deleted while an active session exists."
        }
        End = true
      }
      DeleteUserData = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = module.delete_user_data_lambda.function_arn
          Payload = {
            "userId.$" = "$.userId"
          }
        }
        ResultSelector = {
          status  = "DELETED"
          message = "User data deleted successfully."
        }
        End   = true
        Retry = local.lambda_service_retry
        Catch = local.partial_deletion_catch
      }
      CleanupPartialDeletion = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = module.cleanup_delete_data_lambda.function_arn
          Payload = {
            "userId.$" = "$.userId"
          }
        }
        ResultSelector = {
          status  = "DELETED"
          message = "User data deleted successfully."
        }
        End   = true
        Retry = local.lambda_service_retry
        Catch = local.workflow_failure_catch
      }
      WorkflowFailed = {
        Type      = "Fail"
        ErrorPath = "$.workflowError.Error"
        CausePath = "$.workflowError.Cause"
      }
    }
  })
}
