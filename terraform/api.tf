resource "aws_api_gateway_rest_api" "WorkoutStatsAPI" {
  name = "WorkoutStatsAPI"
}

resource "aws_api_gateway_resource" "ActiveSessionResource" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  parent_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
  path_part   = "active-session"
}

resource "aws_api_gateway_deployment" "WorkoutStatsAPIDeployment" {
  rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id

  triggers = {
    redeployment = sha1(jsonencode([
      module.GetStatus.trigger_hash,
      module.StartSession.trigger_hash,
      module.GetSession.trigger_hash,
      module.CancelSession.trigger_hash,
      module.SaveSession.trigger_hash,
      module.AddExercise.trigger_hash,
      module.DeleteExercise.trigger_hash,
      module.AddSet.trigger_hash,
      module.DeleteSet.trigger_hash,
      module.UpdateSet.trigger_hash
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "WorkoutStatsAPIStage" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.WorkoutStatsAPI.id
  deployment_id = aws_api_gateway_deployment.WorkoutStatsAPIDeployment.id
}
