variable "name" {
  type = string
}

variable "api_id" {
  type = string
}

variable "api_parent_id" {
  type = string
}

variable "http_method" {
  type = string
}

variable "layers" {
  type    = list(string)
  default = []
}

variable "env_variables" {
  type    = map(string)
  default = {}
}

variable "custom_policy_json" {
  type    = string
  default = ""
}
