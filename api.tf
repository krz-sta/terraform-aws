resource "aws_api_gateway_rest_api" "WorkoutStatsAPI" {
    name = "WorkoutStatsAPI"
}

resource "aws_api_gateway_resource" "ActiveSessionResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
    path_part = "active-session"
}

resource "aws_api_gateway_method" "UpdateActiveSessionMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionResource.id
    http_method = "PATCH"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "UpdateActiveSessionIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionResource.id
    http_method = aws_api_gateway_method.UpdateActiveSessionMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.active_session_lambda.invoke_arn
}

resource "aws_api_gateway_resource" "SaveSessionResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_resource.ActiveSessionResource.id
    path_part = "save"
}

resource "aws_api_gateway_method" "SaveSessionMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.SaveSessionResource.id
    http_method = "POST"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "SaveSessionIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.SaveSessionResource.id
    http_method = aws_api_gateway_method.SaveSessionMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.active_session_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "WorkoutStatsAPIDeployment" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id

    depends_on = [
        aws_api_gateway_integration.GetStatusStatusIntegration,
        aws_api_gateway_integration.StartSessionIntegration,
        aws_api_gateway_integration.GetSessionIntegration,
        aws_api_gateway_integration.CancelSessionIntegration
    ]

    triggers = {
      redeployment = sha1(jsonencode([
        aws_api_gateway_resource.GetStatusResource.id,
        aws_api_gateway_method.GetStatusMethod.id,
        aws_api_gateway_integration.GetStatusStatusIntegration,
        aws_api_gateway_resource.StartSessionResource.id,
        aws_api_gateway_method.StartSessionMethod.id,
        aws_api_gateway_integration.StartSessionIntegration,
        aws_api_gateway_resource.GetSessionResource.id,
        aws_api_gateway_method.GetSessionMethod.id,
        aws_api_gateway_integration.GetSessionIntegration,
        aws_api_gateway_resource.CancelSessionResource.id,
        aws_api_gateway_method.CancelSessionMethod.id,
        aws_api_gateway_integration.CancelSessionIntegration
      ]))
    }

    lifecycle {
      create_before_destroy = true
    }
}

resource "aws_api_gateway_stage" "WorkoutStatsAPIStage" {
    stage_name = "prod"
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    deployment_id = aws_api_gateway_deployment.WorkoutStatsAPIDeployment.id
}