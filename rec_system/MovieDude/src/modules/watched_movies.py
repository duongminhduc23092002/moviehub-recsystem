# watched_movies.py
try:
    import pandas as pd
    from db_mysql import get_conn
except ImportError as error:
    print("\033[1;33m""⚠️  Failed to import modules ""\033[0m", error)

def catch_watched_movies(user_id):
    """Lấy danh sách movie_id user đã xem."""
    try:
        conn = get_conn()
        df = pd.read_sql("SELECT movie_id FROM users_data WHERE user_id = %s", conn, params=(user_id,))
        conn.close()
        return df["movie_id"].tolist()
    except Exception as error:
        print("Error:", error)
        return []
