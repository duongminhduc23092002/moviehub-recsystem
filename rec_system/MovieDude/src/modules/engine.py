# engine.py
try:
    import pandas as pd
    import numpy as np
    from sklearn.preprocessing import MultiLabelBinarizer
    from sklearn.metrics import pairwise_distances
    from db_mysql import get_conn

    try:    
        from modules.watched_movies import catch_watched_movies
    except Exception:
        from watched_movies import catch_watched_movies

except ImportError as error:
    import sys
    print(f"Failed to import modules: {error}", file=sys.stderr)

def movie_recommender(user_id: str, recommendation_input, filter_watched: bool, filter_top_rank: bool) -> list[str]:
    """
    Movie recommendation engine.
    
    Args:
        user_id: INT or STR (will be converted to INT)
        recommendation_input: [genres_list, keywords_list]
        filter_watched: bool
        filter_top_rank: bool
    
    Returns:
        List of movie titles
    """
    # ⭐ Ensure user_id is INTEGER
    user_id = int(user_id)
    
    # ⭐ Validate recommendation_input
    if not recommendation_input or recommendation_input is None:
        import sys
        print(f"No recommendation input for user {user_id}", file=sys.stderr)
        return []
    
    # ❌ REMOVE all debug prints
    # print(f"🎯 Running recommendation for user_id: {user_id}")
    
    # Load movies from movies_sorted
    conn = get_conn()
    df = pd.read_sql(
        "SELECT movie_id, title, genres, keywords, final_score FROM movies_sorted",
        conn
    )
    conn.close()

    # ❌ REMOVE
    # print(f"📊 Loaded {len(df)} movies from movies_sorted")

    # Filter watched movies
    if filter_watched:
        watched = catch_watched_movies(user_id)
        df = df[~df["movie_id"].isin(watched)]
        # ❌ REMOVE
        # print(f"🚫 Filtered out {len(watched)} watched movies, {len(df)} remaining")

    # Pre-process features
    features = ["genres", "keywords"]
    for col in features:
        df[col] = df[col].fillna("").str.lower().str.strip().str.split(",")
        df[col] = df[col].apply(lambda x: [item.strip() for item in x if item.strip()])

    # Multi-label encoding
    encoders = {}
    encoded_features = []
    for col in features:
        mlb = MultiLabelBinarizer()
        encoded = mlb.fit_transform(df[col])
        encoded_features.append(encoded)
        encoders[col] = mlb

    encoded_matrix = np.hstack(encoded_features).astype(bool)

    # Create user vector
    user_vector = np.hstack([
        encoders[col].transform([val]) for col, val in zip(features, recommendation_input)
    ]).astype(bool)

    # Calculate similarity
    distances = pairwise_distances(
        encoded_matrix,
        user_vector.reshape(1, -1),
        metric="jaccard"
    )
    df["similarity"] = (1 - distances.flatten())

    # Sort and get top results
    if filter_top_rank:
        top_list = df.sort_values(by=["similarity", "final_score"], ascending=[False, False]).head(50)
    else:
        top_list = df.sort_values(by="similarity", ascending=False).head(50)

    result_titles = top_list["title"].tolist()
    
    # ❌ REMOVE
    # print(f"✅ Returning {len(result_titles)} recommendations")
    
    return result_titles
