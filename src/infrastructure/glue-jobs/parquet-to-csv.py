import sys
from datetime import datetime
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame
from pyspark.sql.functions import col, lit, to_json
from pyspark.sql.types import ArrayType, MapType, StructType

args = getResolvedOptions(sys.argv, ["JOB_NAME", "S3_INPUT_PATH", "S3_OUTPUT_PATH", "S3_OUTPUT_PREFIX"])
sc = SparkContext()
glueContext = GlueContext(sc)
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

source_path = args["S3_INPUT_PATH"]
output_base_path = args["S3_OUTPUT_PATH"].rstrip("/")
output_prefix = args["S3_OUTPUT_PREFIX"].strip("/")
output_path = f"{output_base_path}/{output_prefix}" if output_prefix else output_base_path

dynamic_frame = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [source_path]},
    format="parquet"
)

df = dynamic_frame.toDF()

for field in df.schema.fields:
    if isinstance(field.dataType, (ArrayType, MapType, StructType)):
        df = df.withColumn(field.name, to_json(col(field.name)))

run_timestamp = datetime.utcnow()
df = df.withColumn("run_datetime", lit(run_timestamp.strftime("%Y-%m-%d-%H-%M")))

dynamic_frame_flat = DynamicFrame.fromDF(df, glueContext, "dynamic_frame_flat")

glueContext.write_dynamic_frame.from_options(
    frame=dynamic_frame_flat,
    connection_type="s3",
    connection_options={"path": output_path, "partitionKeys": ["run_datetime"]},
    format="csv",
    format_options={"withHeader": True, "separator": ","}
)

job.commit()