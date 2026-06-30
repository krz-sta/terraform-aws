variable "ddb_active_sessions_table_name" {
  type = string
}

variable "ddb_active_sessions_table_arn" {
  type = string
}

variable "ddb_session_history_table_name" {
  type = string
}

variable "ddb_session_history_table_arn" {
  type = string
}

variable "ddb_session_history_stream_arn" {
  type = string
}

variable "ddb_user_stats_table_name" {
  type = string
}

variable "ddb_user_stats_table_arn" {
  type = string
}

variable "shared_libs_layer_arn" {
  type = string
}
