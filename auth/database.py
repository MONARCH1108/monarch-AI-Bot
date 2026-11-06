import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """
    Establish a connection to Neon PostgreSQL.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is not configured")
    try:
        connection = psycopg.connect(database_url)
        return connection
    except psycopg.Error as e:
        raise ConnectionError(
            f"Failed to connect to Neon PostgreSQL: {e}"
        ) from e
    
if __name__ == "__main__":
    try:
        conn = get_db_connection()
        print("Successfully connected to Neon PostgreSQL!")
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")