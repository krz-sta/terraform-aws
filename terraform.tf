terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 6.0"
        }
    }
}

provider "aws" {
    region = "eu-central-1"
    profile = "default"
}

module "lambda_functions" {
    source = "./lambda"
}