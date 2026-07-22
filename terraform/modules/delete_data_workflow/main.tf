module "delete_data_state_machine_iam" {
  source = "../iam"

  name                   = "${var.prefix}-delete-data-state-machine"
  service_principal      = "states.amazonaws.com"
  attach_basic_execution = false
  custom_policy_json     = data.aws_iam_policy_document.delete_data_state_machine_iam.json
  create_custom_policy   = true
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

  definition = templatefile("${path.module}/delete-data-workflow.asl.json", {
    check_active_session_lambda_arn = module.check_active_session_lambda.function_arn
    delete_user_data_lambda_arn     = module.delete_user_data_lambda.function_arn
    cleanup_delete_data_lambda_arn  = module.cleanup_delete_data_lambda.function_arn
  })
}
