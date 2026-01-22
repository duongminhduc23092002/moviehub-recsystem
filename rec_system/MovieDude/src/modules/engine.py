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
    print("\033[1;33m""⚠️  Failed to import modules ""\033[0m", error)

def movie_recommender(user_id: str, recommendation_input, filter_watched: bool, filter_top_rank: bool) -> list[str]:
    conn = get_conn()
    df = pd.read_sql(
        "SELECT movie_id, title, genres, keywords, final_score FROM movies_sorted",
        conn
    )
    conn.close()

    if filter_watched:
        watched = catch_watched_movies(user_id)
        df = df[~df["movie_id"].isin(watched)]

    features = ["genres", "keywords"]
    for col in features:
        df[col] = df[col].fillna("").str.lower().str.strip().str.split(",")
        df[col] = df[col].apply(lambda x: [item.strip() for item in x if item.strip()])

    encoders = {}
    encoded_features = []
    for col in features:
        mlb = MultiLabelBinarizer()
        encoded = mlb.fit_transform(df[col])
        encoded_features.append(encoded)
        encoders[col] = mlb

    encoded_matrix = np.hstack(encoded_features).astype(bool)

    user_vector = np.hstack([
        encoders[col].transform([val]) for col, val in zip(features, recommendation_input)
    ]).astype(bool)

    distances = pairwise_distances(
        encoded_matrix,
        user_vector.reshape(1, -1),
        metric="jaccard"
    )
    df["similarity"] = (1 - distances.flatten())

    if filter_top_rank:
        top_list = df.sort_values(by=["similarity", "final_score"], ascending=[False, False]).head(10)
    else:
        top_list = df.sort_values(by="similarity", ascending=False).head(10)

    return top_list["title"].tolist()
