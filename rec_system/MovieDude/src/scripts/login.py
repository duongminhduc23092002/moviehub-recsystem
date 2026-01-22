# login.py
try:
    from rich.console import Console
    import pymysql
    from db_mysql import get_conn
    console = Console()
except ImportError as error:
    print("\033[1;33m""⚠️  Failed to import modules ""\033[0m", error)

def login():
    """Login từ bảng Users trong MySQL."""
    conn = get_conn()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    while True:
        user_id = input("Enter email: ").strip()
        password = input("Enter password: ").strip()

        cursor.execute(
            "SELECT email, name, password FROM users WHERE email = %s",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            console.print("[red]❌ Username not found. Please try again.[/red]\n")
        elif user["password"] != password:
            console.print("❌ [red]Incorrect password. Please try again.[/red]\n")
        else:
            console.print(f"\n✅ Welcome, [yellow]{user['name']}[/yellow]")
            cursor.close()
            conn.close()
            return user_id
