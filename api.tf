resource "aws_api_gateway_rest_api" "WorkoutStatsAPI" {
    name = "WorkoutStatsAPI"
}

resource "aws_api_gateway_resource" "StatusResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
    path_part = "status"
}

resource "aws_api_gateway_method" "GetStatusMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.StatusResource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "GetStatusIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.StatusResource.id
    http_method = aws_api_gateway_method.GetStatusMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.status_lambda.invoke_arn
}

resource "aws_api_gateway_resource" "ActiveSessionResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_rest_api.WorkoutStatsAPI.root_resource_id
    path_part = "active-session"
}

resource "aws_api_gateway_method" "StartActiveSessionMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionResource.id
    http_method = "POST"
    authorization = "NONE"
}

resource "aws_api_gateway_method" "GetActiveSessionMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionResource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "StartActiveSessionIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionResource.id
    http_method = aws_api_gateway_method.StartActiveSessionMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.active_session_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "GetActiveSessionIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionResource.id
    http_method = aws_api_gateway_method.GetActiveSessionMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.active_session_lambda.invoke_arn
}

resource "aws_api_gateway_resource" "ActiveSessionCancelResource" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    parent_id = aws_api_gateway_resource.ActiveSessionResource.id
    path_part = "cancel"
}

resource "aws_api_gateway_method" "ActiveSessionCancelMethod" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionCancelResource.id
    http_method = "POST"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "ActiveSessionCancelIntegration" {
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    resource_id = aws_api_gateway_resource.ActiveSessionCancelResource.id
    http_method = aws_api_gateway_method.ActiveSessionCancelMethod.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.active_session_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "WorkoutStatsAPIDeployment" {
    depends_on = [aws_api_gateway_integration.GetStatusIntegration, aws_api_gateway_integration.StartActiveSessionIntegration, aws_api_gateway_integration.ActiveSessionCancelIntegration, aws_api_gateway_integration.GetActiveSessionIntegration]
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id

    triggers = {
        redeployment = sha1(jsonencode([
            aws_api_gateway_resource.StatusResource.id,
            aws_api_gateway_method.GetStatusMethod.id,
            aws_api_gateway_integration.GetStatusIntegration.id,
            aws_api_gateway_resource.ActiveSessionResource.id,
            aws_api_gateway_method.StartActiveSessionMethod.id,
            aws_api_gateway_integration.StartActiveSessionIntegration.id,
            aws_api_gateway_method.GetActiveSessionMethod.id,
            aws_api_gateway_integration.GetActiveSessionIntegration.id,
            aws_api_gateway_resource.ActiveSessionCancelResource.id,
            aws_api_gateway_method.ActiveSessionCancelMethod.id,
            aws_api_gateway_integration.ActiveSessionCancelIntegration.id
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