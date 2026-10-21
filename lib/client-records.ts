export async function loadRecords<T>(path: string, key: string, token: string): Promise<T[]> {
  const records: T[] = [];
  let cursor: string | null = null;
  const seen = new Set<string>();
  do {
    const url = new URL(path, window.location.origin);
    url.searchParams.set("limit", "200");
    if (cursor) url.searchParams.set("cursor", cursor);
    const response = await fetch(url, { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { localStorage.removeItem("adminToken"); window.location.assign("/admin/login"); }
      throw new Error(data.error || "Unable to load database records");
    }
    const data = await response.json();
    if (!Array.isArray(data[key])) throw new Error("Invalid database response");
    records.push(...data[key]);
    cursor = data.nextCursor ?? null;
    if (cursor && seen.has(cursor)) throw new Error("Invalid pagination response");
    if (cursor) seen.add(cursor);
  } while (cursor);
  return records;
}
