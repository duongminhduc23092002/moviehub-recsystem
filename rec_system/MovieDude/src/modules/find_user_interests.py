# find_user_interests.py
try:
    import pandas as pd
    from sklearn.preprocessing import MinMaxScaler
    from collections import Counter
    from itertools import chain
    from db_mysql import get_conn
except ImportError as error:
    print("\033[1;33m""⚠️  Failed to import modules: ""\033[0m", error)

def find_user_interests(user_id):
    top_n_genres = 6
    top_n_keywords = 10

    col1 = "user_rate"
    col2 = "liked"
    w1 = 0.75
    w2 = 0.25

    conn = get_conn()
    query = """
    SELECT ud.user_id, ud.movie_id, ud.user_rate, ud.liked, ms.genres, ms.keywords
    FROM users_data ud
    JOIN movies_sorted ms ON ud.movie_id = ms.movie_id
    WHERE ud.user_id = %s
    """
    df = pd.read_sql_query(query, conn, params=(user_id,))
    conn.close()

    if df.empty:
        print(f"No activity found for user '{user_id}' in Users_data.")
        return [], []

    scaler = MinMaxScaler()
    df["normalized_rate"] = scaler.fit_transform(df[[col1]])
    df["like_weight"] = df[col2].astype(int)

    df["final_score"] = w1 * df["normalized_rate"] + w2 * df["like_weight"]
    df = df.sort_values(by="final_score", ascending=False)

    top_list = max(1, len(df) // 3)
    df = df.head(top_list)

    # split robust cho cả "," và ", "
    df["genres"] = df["genres"].fillna("").str.lower().str.split(",")
    df["keywords"] = df["keywords"].fillna("").str.lower().str.split(",")
    df["genres"] = df["genres"].apply(lambda xs: [x.strip() for x in xs if x.strip()])
    df["keywords"] = df["keywords"].apply(lambda xs: [x.strip() for x in xs if x.strip()])

    top_genres = Counter(chain.from_iterable(df["genres"].dropna())).most_common(top_n_genres)
    top_keywords = Counter(chain.from_iterable(df["keywords"].dropna())).most_common(top_n_keywords)

    return [g[0] for g in top_genres], [k[0] for k in top_keywords]
