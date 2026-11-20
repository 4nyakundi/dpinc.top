import { test } from "node:test";
import assert from "node:assert/strict";
import { money, email, date, object, billingDue, billingPeriod, apiRecord } from "../lib/database.ts";

test("money uses exact integer cents and rejects malformed or unbounded values", () => {
  assert.equal(money("0.10") + money("0.20"), 30);
  assert.equal(money(12500), 1250000);
  for (const value of [-1, NaN, Infinity, "12abc", "1.234", "", " ", null, true, 20000001]) assert.throws(() => money(value));
});
test("email normalization preserves nullable unique addresses", () => {
  assert.equal(email("  Client@Example.com "), "client@example.com");
  assert.equal(email(""), null);
  assert.equal(email(undefined), null);
  assert.throws(() => email("invalid"));
  assert.throws(() => object([]));
});
test("billing uses Nairobi's calendar and clamps end-of-month due days", () => {
  assert.equal(billingPeriod(new Date("2026-12-31T22:00:00Z")), "2027-01");
  assert.equal(billingDue("2028-02", 31).toISOString().slice(0,10), "2028-02-29");
  assert.equal(billingDue("2027-02", 31).toISOString().slice(0,10), "2027-02-28");
  assert.throws(() => billingDue("2027-13", 1));
  assert.throws(() => billingDue("2027-01", 0));
  assert.throws(() => date("2026-02-30"));
});
test("API serialization converts amounts recursively without exposing raw invoice snapshots", () => {
  assert.deepEqual(apiRecord({ totalMinor: 125005, lineItems: [{ unitPriceMinor: 10 }], snapshot: '{"billedTo":"Original customer"}' }), {
    total: 1250.05, lineItems: [{ unitPrice: 0.1 }], billingSnapshot: { billedTo: "Original customer" },
  });
});
