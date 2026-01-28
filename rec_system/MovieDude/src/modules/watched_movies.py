# watched_movies.py
try:
    import pandas as pd
    from db_mysql import get_conn
except ImportError as error:
    import sys
    print(f"Failed to import modules: {error}", file=sys.stderr)

def catch_watched_movies(user_id):
    """
    Lấy danh sách movie_id user đã xem/liked.
    
    Args:
        user_id: INT (user ID)
    
    Returns:
        List of movie IDs (integers)
    """
    try:
        # ⭐ Ensure user_id is INTEGER
        user_id = int(user_id)
        
        conn = get_conn()
        
        # ⭐ Query with INT user_id
        query = """
        SELECT DISTINCT movie_id 
        FROM users_data 
        WHERE user_id = %s AND (liked = 1 OR user_rate IS NOT NULL)
        """
        
        # ❌ REMOVE all debug prints
        # print(f"🔍 Fetching watched movies for user_id: {user_id}")
        
        df = pd.read_sql(query, conn, params=(user_id,))
        conn.close()
        
        watched_list = df["movie_id"].tolist()
        
        # ❌ REMOVE
        # print(f"📋 Found {len(watched_list)} watched movies for user {user_id}")
        
        return watched_list
        
    except Exception as error:
        import sys
        print(f"Error in catch_watched_movies: {error}", file=sys.stderr)
        return []
