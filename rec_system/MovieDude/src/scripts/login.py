# login.py
try:
    from rich.console import Console
    import pymysql
    from db_mysql import get_conn
    console = Console()
except ImportError as error:
    print("\033[1;33m""⚠️  Failed to import modules ""\033[0m", error)

def login():
    """
    Login from Users table in MySQL.
    Returns user_id (INT) instead of email (STRING).
    """
    conn = get_conn()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    while True:
        email = input("Enter email: ").strip()
        password = input("Enter password: ").strip()

        # ⭐ SELECT id (INT) instead of email (STRING)
        cursor.execute(
            "SELECT id, email, name, password FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            console.print("[red]❌ Email not found. Please try again.[/red]\n")
        elif user["password"] != password:
            console.print("❌ [red]Incorrect password. Please try again.[/red]\n")
        else:
            console.print(f"\n✅ Welcome, [yellow]{user['name']}[/yellow]")
            cursor.close()
            conn.close()
            
            # ⭐ Return user ID (INT) instead of email
            return user["id"]  # Changed from user["email"]
