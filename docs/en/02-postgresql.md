# 2. Connect with psql and use PostgreSQL

[Contents](../../README.en.md) | [日本語](../ja/02-postgresql.md)

**Allow 8 minutes.** Use the writer's read/write endpoint and administrator created with the cluster.

## Connect

Run from the workshop root. The helper uses the selected azd environment's service-generated writer endpoint and administrator credentials without printing passwords or putting them in process arguments. Certificate and hostname validation stay enabled.

```bash
cd "$WORKSHOP_ROOT"
node zava/scripts/psql.mjs
```

Run the following **inside psql**, not Bash:

```sql
\conninfo
SHOW transaction_read_only;
\i sql/01-postgresql.sql
```

Confirm TLS in `\conninfo` and `off` for `transaction_read_only`. The script creates a new `workshop` schema and imports the [included CSV](../../data/products.csv). `\copy` reads files in the psql execution environment (local PC or Cloud Shell); uploading them to the database server is unnecessary.

## Observe standard SQL behavior

| Operation | Expected observation |
| --- | --- |
| `SELECT version()` | PostgreSQL version and HorizonDB build information |
| Counts / `GROUP BY` | 18 products; three per category |
| `WHERE` / `ORDER BY` | Chairs costing at most 200 USD, sorted by rating |
| `jsonb_build_object` | Japanese product name and price in JSONB |
| `JOIN` | Two order lines; subtotals of 360.00 and 120.00 USD |
| `BEGIN` / `UPDATE` / `DELETE` / `ROLLBACK` | Price temporarily becomes 190.00, then returns to 180.00 |

Standard PostgreSQL clients, SQL, types and transactions work unchanged. These queries do not prove identical behavior for every extension or administrative operation. Managed services restrict superuser privileges and available extensions.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Timeout | Check source IP firewall rules, VPN, TCP 5432 and cluster/pool status |
| Password failure | Check the actual username/password; do not append the host to the username |
| Certificate failure | Check official endpoint and CA path/content; do not bypass verification with `sslmode=require` |
| Read-only error | Reconnect through the read/write endpoint |
| CSV not found | Use `\! pwd` to confirm the workshop root; `\copy` uses the client's working directory |
| Schema already exists | Setup already ran. Continue without rerunning; do not delete an unknown existing schema |
| Incorrect characters | Use a UTF-8 terminal; the script explicitly imports UTF-8 |

Next: [3. AI capabilities](03-ai.md). Keep the psql connection open.
