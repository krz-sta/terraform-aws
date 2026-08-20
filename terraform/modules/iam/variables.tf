variable "name" {
  type = string
}

variable "service_principal" {
  type    = string
  default = "lambda.amazonaws.com"
}

variable "attach_basic_execution" {
  type    = bool
  default = true
}

variable "attach_xray_daemon_write" {
  type    = bool
  default = false
}

variable "custom_policy_json" {
  type    = string
  default = ""
}

variable "create_custom_policy" {
  type    = bool
  default = true
}
