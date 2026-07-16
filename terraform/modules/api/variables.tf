variable "prefix" {
  type = string
}

variable "cognito_user_pool_arn" {
  type = string
}

variable "active_sessions_table_arn" {
  type = string
}

variable "session_history_table_arn" {
  type = string
}

variable "user_stats_table_arn" {
  type = string
}

variable "shared_libs_layer_arn" {
  type = string
}

variable "active_sessions_table_name" {
  type = string
}

variable "session_history_table_name" {
  type = string
}

variable "user_stats_table_name" {
  type = string
}

variable "delete_data_state_machine_arn" {
  type = string
}
