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