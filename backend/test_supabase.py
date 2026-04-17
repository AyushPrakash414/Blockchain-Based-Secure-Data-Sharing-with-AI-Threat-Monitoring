import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # We query the alerts table just to test the connection.
    # It might throw a PostgrestAPIError if table doesn't exist yet, 
    # but the network request itself proves connectivity.
    response = supabase.table("alerts").select("id").limit(1).execute()
    print(f"✅ Supabase Connection Successful! Data: {response.data}")
except Exception as e:
    print(f"⚠️ Supabase Connected, but encountered an error (likely tables not created yet): {e}")
