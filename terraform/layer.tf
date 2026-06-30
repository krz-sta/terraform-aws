data "archive_file" "SharedLibsLayerZip" {
  type        = "zip"
  source_dir  = "${path.module}/layers/shared-libs-layer"
  output_path = "${path.module}/dist/zip/shared-libs-layer.zip"
}

resource "aws_lambda_layer_version" "SharedLibsLayer" {
  layer_name          = "shared-libs-layer"
  description         = "Lambda layer containing ajv library"
  filename            = data.archive_file.SharedLibsLayerZip.output_path
  source_code_hash    = data.archive_file.SharedLibsLayerZip.output_base64sha256
  compatible_runtimes = ["nodejs24.x"]
}
