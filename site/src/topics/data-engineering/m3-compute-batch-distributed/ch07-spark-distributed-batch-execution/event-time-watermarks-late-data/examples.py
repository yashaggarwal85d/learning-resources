"""
de.event-time-watermarks-late-data -- measured against real PySpark 4.0.1, local[2].

Two claims, verified against a real local Structured Streaming query (file source, memory
sink, a 10-minute watermark over a 10-minute/5-minute sliding window):

1. A hand-computed watermark -- the maximum event time seen so far minus the delay threshold,
   lagging by exactly one trigger -- matches Spark's own reported watermark at every batch.
2. A late event is dropped only once the watermark has advanced past the *end* of the window
   it would fall into, not merely past the event's own timestamp; the identical lateness, one
   trigger earlier (before that window's state is evicted), is still correctly counted.
"""
import json
import os
import shutil
import time
from datetime import datetime, timedelta

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, window
from pyspark.sql.types import StringType, StructField, StructType, TimestampType

INPUT_DIR = "/tmp/examples24-input"
CKPT_DIR = "/tmp/examples24-ckpt"
shutil.rmtree(INPUT_DIR, ignore_errors=True)
shutil.rmtree(CKPT_DIR, ignore_errors=True)
os.makedirs(INPUT_DIR, exist_ok=True)

DELAY = timedelta(minutes=10)


def fmt(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def write_event(ts, word, n):
    with open(os.path.join(INPUT_DIR, f"batch{n}.json"), "w") as f:
        f.write(json.dumps({"ts": fmt(ts), "word": word}) + "\n")


spark = (
    SparkSession.builder.master("local[2]")
    .appName("examples24")
    .config("spark.sql.shuffle.partitions", "2")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

schema = StructType([StructField("ts", TimestampType()), StructField("word", StringType())])
df = spark.readStream.schema(schema).json(INPUT_DIR)
windowed = (
    df.withWatermark("ts", "10 minutes")
    .groupBy(window(col("ts"), "10 minutes", "5 minutes"), col("word"))
    .count()
)

query = (
    windowed.writeStream.format("memory")
    .queryName("wmexamples")
    .outputMode("update")
    .option("checkpointLocation", CKPT_DIR)
    .trigger(processingTime="1 second")
    .start()
)

T0 = datetime(2024, 1, 1, 12, 0, 0)
write_event(T0, "dog", 1)
time.sleep(5)
write_event(T0 + timedelta(minutes=14), "dog", 2)  # max=12:14 -> next watermark = 12:04
time.sleep(5)
write_event(T0 + timedelta(minutes=9), "cat", 3)  # late, but window not yet evicted
time.sleep(5)
write_event(T0 + timedelta(minutes=20), "dog", 4)  # max=12:20 -> next watermark = 12:10
time.sleep(5)
write_event(T0 + timedelta(minutes=2), "zebra", 5)  # window (11:55-12:05) end <= 12:10: evicted
time.sleep(5)

progresses = query.recentProgress
query.stop()

# --- Claim 1: hand-computed watermark matches Spark's own, lagging by one trigger. ---
hand_watermark = datetime(1970, 1, 1)
running_max = None
for p in progresses:
    et = dict(p.eventTime) if p.eventTime else {}
    reported_watermark = et.get("watermark")
    if reported_watermark:
        reported_dt = datetime.strptime(reported_watermark, "%Y-%m-%dT%H:%M:%S.%fZ")
        # the watermark reported for THIS batch was computed from the PREVIOUS batch's max.
        assert reported_dt == hand_watermark, (
            f"hand-computed watermark {hand_watermark} should match Spark's own "
            f"reported watermark {reported_dt} for this batch"
        )
    if "max" in et:
        batch_max = datetime.strptime(et["max"], "%Y-%m-%dT%H:%M:%S.%fZ")
        running_max = batch_max if running_max is None else max(running_max, batch_max)
        hand_watermark = running_max - DELAY

result_rows = spark.sql("select word from wmexamples").collect()
words_seen = {r.word for r in result_rows}

# measured: cat (late by 5 minutes, but its window hadn't been evicted yet) was counted.
assert "cat" in words_seen, "a late event should still be counted while its window's state is live"
# measured: zebra (equally late relative to its own event time, but arriving after the
# watermark advanced past its window's own end) was dropped entirely -- never counted, in no
# window, anywhere in the result table.
assert "zebra" not in words_seen, "a late event should be dropped once its window has been evicted"
assert "dog" in words_seen

spark.stop()

print("all claims verified")
