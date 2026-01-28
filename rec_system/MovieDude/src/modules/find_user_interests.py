# find_user_interests.py
try:
    import pandas as pd
    from sklearn.preprocessing import MinMaxScaler
    from collections import Counter
    from itertools import chain
    from db_mysql import get_conn
except ImportError as error:
    import sys
    print(f"Failed to import modules: {error}", file=sys.stderr)

def find_user_interests(user_id):
    """
    Extract user interests from users_data table.
    
    Args:
        user_id: INT (user ID from backend)
    
    Returns:
        [genres_list, keywords_list] or None
    """
    top_n_genres = 6
    top_n_keywords = 10

    col1 = "user_rate"
    col2 = "liked"
    w1 = 0.75
    w2 = 0.25

    # ⭐ Ensure user_id is INTEGER
    user_id = int(user_id)
    
    conn = get_conn()
    
    # ⭐ Query with INT user_id
    query = """
    SELECT ud.user_id, ud.movie_id, ud.user_rate, ud.liked, ms.genres, ms.keywords
    FROM users_data ud
    JOIN movies_sorted ms ON ud.movie_id = ms.movie_id
    WHERE ud.user_id = %s
    """
    
    # ❌ REMOVE all print() with emojis
    # print(f"🔍 Querying user_id: {user_id} (type: {type(user_id)})")
    
    df = pd.read_sql_query(query, conn, params=(user_id,))
    conn.close()

    # ❌ REMOVE
    # print(f"📊 Found {len(df)} activities for user {user_id}")

    if df.empty:
        # ❌ REMOVE emoji print
        # Use stderr for errors, no emojis
        import sys
        print(f"No activity found for user {user_id}", file=sys.stderr)
        return None

    # Min-Max normalization
    scaler = MinMaxScaler()
    df["normalized_rate"] = scaler.fit_transform(df[[col1]])
    df["like_weight"] = df[col2].astype(int)

    # Calculate final_score
    df["final_score"] = w1 * df["normalized_rate"] + w2 * df["like_weight"]
    df = df.sort_values(by="final_score", ascending=False)

    # Get top 1/3 movies
    top_list = max(1, len(df) // 3)
    df = df.head(top_list)

    # Extract genres and keywords
    df["genres"] = df["genres"].fillna("").str.lower().str.split(",")
    df["keywords"] = df["keywords"].fillna("").str.lower().str.split(",")
    df["genres"] = df["genres"].apply(lambda xs: [x.strip() for x in xs if x.strip()])
    df["keywords"] = df["keywords"].apply(lambda xs: [x.strip() for x in xs if x.strip()])

    # Count top genres and keywords
    top_genres = Counter(chain.from_iterable(df["genres"].dropna())).most_common(top_n_genres)
    top_keywords = Counter(chain.from_iterable(df["keywords"].dropna())).most_common(top_n_keywords)

    # ❌ REMOVE all debug prints
    # print(f"✅ Top {len(top_genres)} genres: {[g[0] for g in top_genres[:3]]}")
    # print(f"✅ Top {len(top_keywords)} keywords: {[k[0] for k in top_keywords[:3]]}")

    return [g[0] for g in top_genres], [k[0] for k in top_keywords]
