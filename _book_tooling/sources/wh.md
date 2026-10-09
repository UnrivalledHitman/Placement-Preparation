# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| W1.1 | Where must data be transformed before it leaves your control? Who changes logic often? |
| W1.2 | A row group must be read if its maximum is above 40 |
| W1.3 | Every file has its own footer and must be listed, opened and planned |
| W1.4 | Files per year = partitions per year × files per partition; size = daily volume / files per day |
| W1.5 | Concurrent writes, partial failures, row-level deletes in immutable files |

## Part 2 hints

| Exercise | Hint |
|---|---|
| W2.1 | One fact table per business process and grain: orders, order lines, deliveries |
| W2.2 | Compare the incoming row with the current version on all tracked attributes before closing it |
| W2.3 | Test that the dimension key is unique; aggregate or de-duplicate before joining |
| W2.4 | `QUALIFY row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC) = 1` |
| W2.5 | Bytes scanned = table size × column share × partition share |

## Part 3 hints

| Exercise | Hint |
|---|---|
| W3.1 | 600 GB / 200 MB; waves = partitions / cores, rounded up |
| W3.2 | Only the hot key is salted on the fact side; its dimension row is copied once per salt |
| W3.3 | A run exists only for complete intervals; weekly intervals run Monday to Monday |
| W3.4 | `CURRENT_DATE` is the same for every run of the backfill |
| W3.5 | ExternalTaskSensor or dataset/asset triggers; downstream should depend on data, not on schedules |

## Part 4 hints

| Exercise | Hint |
|---|---|
| W4.1 | Compare each day with the median of the same weekday in the previous four weeks |
| W4.2 | Sort by user and time; a new session starts when the gap exceeds 30 minutes |
| W4.3 | Remove IDs older than the watermark (max event time − 2 minutes) from the set |
| W4.4 | Debezium to Kafka, keyed by primary key; MERGE into Iceberg/Delta; tombstones for deletes |
| W4.5 | Trips, payments, locations, driver states; real-time pricing needs streaming |
