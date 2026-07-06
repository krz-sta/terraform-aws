output "ddb_active_sessions_table_name" {
  value = aws_dynamodb_table.active_sessions.name
}

output "ddb_active_sessions_table_arn" {
  value = aws_dynamodb_table.active_sessions.arn
}

output "ddb_session_history_table_name" {
  value = aws_dynamodb_table.session_history.name
}

output "ddb_session_history_table_arn" {
  value = aws_dynamodb_table.session_history.arn
}

output "ddb_session_history_stream_arn" {
  value = aws_dynamodb_table.session_history.stream_arn
}

output "ddb_user_stats_table_name" {
  value = aws_dynamodb_table.user_stats.name
}

output "ddb_user_stats_table_arn" {
  value = aws_dynamodb_table.user_stats.arn
}

output "s3_workouts_archive_bucket_name" {
  value = aws_s3_bucket.workouts_archive.bucket
}

output "s3_workouts_archive_bucket_arn" {
  value = aws_s3_bucket.workouts_archive.arn
}
