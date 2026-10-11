/** Read-only production privacy smoke check. No rows or credentials are logged. */
const projectHost = "igiuifkvunrnmgamyzqw.supabase.co";
const origin = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!origin || new URL(origin).hostname !== projectHost || !key) {
  throw new Error("Expected the Hutchrok project URL and anon key.");
}
const tables = ["intake_submissions","filing_cases","case_documents","audit_log",
  "client_profiles","premium_members","member_businesses","member_business_submissions",
  "agent_definitions","agent_tasks"];
let failed = false;
for (const table of tables) {
  const response = await fetch(origin + "/rest/v1/" + table + "?select=*&limit=0", {
    method: "HEAD", headers: { apikey: key, Authorization: "Bearer " + key },
    signal: AbortSignal.timeout(15000),
  });
  const denied = response.status === 401 || response.status === 403;
  failed ||= !denied;
  console.log(JSON.stringify({ table, status: response.status, denied }));
}
const health = await fetch("https://www.hutchrok.com/api/health", {
  signal: AbortSignal.timeout(15000),
});
const healthBody = await health.json();
const serverHealthy = health.status === 200 && healthBody.ok === true &&
  healthBody.db?.reachable === true;
failed ||= !serverHealthy;
console.log(JSON.stringify({ serverHealth: health.status, serverHealthy }));
if (failed) process.exitCode = 1;
