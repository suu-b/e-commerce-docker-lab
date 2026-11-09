import os
import sys
import logging
from pathlib import Path
from typing import cast, LiteralString

import psycopg
from psycopg import sql

BASE_DIR = Path(__file__).resolve().parent
MIGRATIONS_DIR = BASE_DIR / "migrations"

DATABASE_URL = os.environ.get("SHOP_DB_URL")
SHOP_DB_USER_PASSWORD = os.environ.get("SHOP_DB_USER_PASSWORD")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

if __name__ == '__main__':
    if not DATABASE_URL:
        raise RuntimeError("SHOP_DB_URL is missing")

    if not SHOP_DB_USER_PASSWORD:
        raise RuntimeError("SHOP_DB_USER_PASSWORD is missing")

    if not MIGRATIONS_DIR.exists():
        raise RuntimeError(f"Migration directory not found: {MIGRATIONS_DIR}")

    migrations = sorted(MIGRATIONS_DIR.glob("*.sql"))

    if not migrations:
        logger.warning("No migration files found.")
        sys.exit(0)

    try:
        with psycopg.connect(DATABASE_URL, autocommit=True) as conn:

            conn.execute("""
                create table if not exists public.schema_migrations (
                    version text primary key,
                    applied_at timestamptz not null default now()
                )
            """)

            for migration in migrations:
                version = migration.name

                result = conn.execute(
                    """
                    select 1
                    from public.schema_migrations
                    where version = %s
                    """,
                    (version,)
                ).fetchone()

                if result:
                    logger.info("Skipping migration: %s", version)
                    continue

                logger.info("Applying migration: %s", version)
                sql_text = migration.read_text(encoding="utf-8")



                if "SHOP_DB_USER_PASSWORD_PLACEHOLDER" in sql_text:
                    password = sql.Literal(SHOP_DB_USER_PASSWORD)
                    sql_text = sql_text.replace(
                        "'SHOP_DB_USER_PASSWORD_PLACEHOLDER'",
                        password.as_string(conn)
                    )

                with conn.transaction():
                    conn.execute(sql.SQL(cast(LiteralString, sql_text)), {"shop_db_user_pwd": SHOP_DB_USER_PASSWORD})
                    conn.execute(
                        """
                        insert into public.schema_migrations (version)
                        values (%s)
                        """,
                        (version,)
                    )

                logger.info("Migration applied: %s", version)

            logger.info("Migration complete")

    except Exception:
        logger.exception("Migration failed")
        sys.exit(1)
