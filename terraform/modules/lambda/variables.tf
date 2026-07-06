variable "name" {
  type = string
}

variable "zip_path" {
  type = string
}

variable "runtime" {
  type    = string
  default = "nodejs24.x"
}

variable "handler" {
  type    = string
  default = "handler.handler"
}

variable "role_arn" {
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
