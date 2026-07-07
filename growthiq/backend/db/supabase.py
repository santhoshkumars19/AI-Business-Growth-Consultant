from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client: Client | None = None


def get_supabase() -> Client:
    """Lazy Supabase client — created on first use."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY or "your-project" in SUPABASE_URL:
            raise RuntimeError(
                "⚠️  Supabase not configured. "
                "Open backend/.env and fill in SUPABASE_URL and SUPABASE_KEY"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client
