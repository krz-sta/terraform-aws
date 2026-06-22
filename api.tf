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

resource "aws_api_gateway_deployment" "WorkoutStatsAPIDeployment" {
    depends_on = [aws_api_gateway_integration.GetStatusIntegration]
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
}

resource "aws_api_gateway_stage" "WorkoutStatsAPIStage" {
    stage_name = "prod"
    rest_api_id = aws_api_gateway_rest_api.WorkoutStatsAPI.id
    deployment_id = aws_api_gateway_deployment.WorkoutStatsAPIDeployment.id
}