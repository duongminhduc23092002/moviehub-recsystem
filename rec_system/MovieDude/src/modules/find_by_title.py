# find_by_title.py
from db_mysql import get_conn

def find_by_title(title: str):
    """Trả về [genres, keywords] theo title."""
    try:
        conn = get_conn()
        cursor = conn.cursor()

        query = """
            SELECT genres, keywords
            FROM movies_sorted
            WHERE LOWER(title) LIKE LOWER(%s)
            LIMIT 1
        """
        cursor.execute(query, (f"%{title}%",))
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if not result:
            print("No matching movie found.\n")
            return None

        genres_raw, keywords_raw = result
        genres_raw = genres_raw or ""
        keywords_raw = keywords_raw or ""

        genres = [g.strip().lower() for g in genres_raw.split(",") if g.strip()]
        keywords = [k.strip().lower() for k in keywords_raw.split(",") if k.strip()]
        return [genres, keywords]

    except Exception as error:
        print("❌ MySQL error:", error)
        return None
