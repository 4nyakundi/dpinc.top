"""Export a legacy SQLite database read-only; never print credentials."""
import json
import sqlite3
import sys
from pathlib import Path
source = Path(sys.argv[1]).resolve()
if not source.is_file():
    raise SystemExit("Legacy database does not exist")
connection = sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)
connection.row_factory = sqlite3.Row
tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
if not {"Quote", "LineItem", "Admin"}.issubset(tables):
    raise SystemExit("Unexpected legacy schema; export and review it separately")
result = {}
for table in ["Quote", "LineItem", "Admin"]:
    result[table] = [dict(row) for row in connection.execute('SELECT * FROM "' + table + '"')]
if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
    raise SystemExit("Legacy database failed integrity check")
if list(connection.execute("PRAGMA foreign_key_check")):
    raise SystemExit("Legacy database has broken relationships")
connection.close()
print(json.dumps(result))
