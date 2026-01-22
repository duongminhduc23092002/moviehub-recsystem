# db_mysql.py
from __future__ import annotations
import os
import pymysql

def get_conn():
    """
    Trả về 1 kết nối MySQL (PyMySQL).
    Có thể override bằng biến môi trường nếu muốn.
    """
    host = os.getenv("MYSQL_HOST", "127.0.0.1")
    port = int(os.getenv("MYSQL_PORT", "3308"))
    user = os.getenv("MYSQL_USER", "duongminhduc")
    password = os.getenv("MYSQL_PASSWORD", "123456")
    db = os.getenv("MYSQL_DB", "moviehub")
    charset = os.getenv("MYSQL_CHARSET", "utf8mb4")

    return pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=db,
        charset=charset,
    )
