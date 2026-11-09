import os
import psycopg
from contextlib import contextmanager

DATABASE_URL = os.environ.get("SHOP_DB_URL")


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = psycopg.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
