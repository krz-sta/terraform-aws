import sys
from datetime import datetime
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
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

df = glueContext.spark_session.read.parquet(source_path)

for field in df.schema.fields:
    if isinstance(field.dataType, (ArrayType, MapType, StructType)):
        df = df.withColumn(field.name, to_json(col(field.name)))

run_timestamp = datetime.utcnow()
df = df.withColumn("run_datetime", lit(run_timestamp.strftime("%Y-%m-%d-%H-%M")))

df.write.partitionBy("run_datetime").mode("append").option("header", True).csv(output_path)

job.commit()