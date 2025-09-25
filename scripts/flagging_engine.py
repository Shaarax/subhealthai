# scripts/flagging_engine.py
import os
from datetime import date
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # backend only

if not SUPABASE_URL or not SERVICE_ROLE:
    raise SystemExit("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

sb: Client = create_client(SUPABASE_URL, SERVICE_ROLE)

def rules(row: dict):
    """Return list of (flag_type, severity, rationale) for a metrics row."""
    out = []
    sleep = row.get("sleep_minutes")
    hrv   = row.get("hrv_avg")
    rhr   = row.get("rhr")

    if sleep is not None and sleep < 300:
        out.append(("sleep_debt", 2, "Sleep under 5 hours"))
    if hrv is not None and hrv < 40:
        out.append(("low_hrv", 3, "7-day HRV below healthy baseline proxy (<40)"))
    if rhr is not None and rhr > 80:
        out.append(("elevated_rhr", 2, "Resting HR > 80 bpm"))

    return out

def run_for_day(target_day: str):
    metrics_resp = sb.table("metrics").select(
        "id,user_id,day,steps,sleep_minutes,hr_avg,hrv_avg,rhr"
    ).eq("day", target_day).execute()

    rows = metrics_resp.data or []
    to_insert = []
    for m in rows:
        for flag_type, severity, rationale in rules(m):
            to_insert.append({
                "user_id": m["user_id"],
                "day": m["day"],
                "flag_type": flag_type,
                "severity": severity,
                "rationale": rationale
            })

    if to_insert:
        sb.table("flags").insert(to_insert).execute()
        print(f"[flags] inserted {len(to_insert)} flags for {target_day}")
    else:
        print(f"[flags] none for {target_day}")

if __name__ == "__main__":
    run_for_day(str(date.today()))
