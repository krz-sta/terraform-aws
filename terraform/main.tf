module "main" {
  source       = "./modules/main"
  project_name = var.project_name
  env          = var.env
}
