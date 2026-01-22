import sys
try:
    from scripts.login import login
    from modules import *
except Exception:
    from login import login
    from __init__ import *

from rich.console import Console
console = Console()
sep_line = "[cyan]-[/cyan]" * 50

def main():
    # ⭐ Check if called from Node.js with args
    if len(sys.argv) >= 3:
        user_email = sys.argv[1]
        mode = sys.argv[2]
        
        console.print(f"[green]Running recommendation for: {user_email}[/green]")
        
        if mode == "1":
            # Discover based on user activities
            rec = movie_recommender(
                user_email, 
                find_user_interests(user_email),
                filter_watched=False,
                filter_top_rank=False
            )
            print_titles(rec)
        else:
            console.print("[red]Invalid mode[/red]")
        return
    
    # ⭐ Original interactive mode
    user_id = login()
    filter_watched = False
    filter_top_rank = False

    console.print(sep_line)
    console.print(
        "[bold]1[/bold] : Discover Movies Based on Your Activities\n"
        "[bold]2[/bold] : Find Similar Movies by Given Movie Title"
    )

    while True:
        choice = input("\nEnter your choice: ")
        if choice == "1":
            console.print(sep_line)
            with console.status("Working..."):
                rec = movie_recommender(user_id, find_user_interests(user_id), filter_watched, filter_top_rank)
                print_titles(rec)
            break
        elif choice == "2":
            console.print(sep_line)
            while True:
                title_query = input("Enter a movie title to find similar recommendations: ").strip()
                recommendation_input = find_by_title(title_query)
                if recommendation_input:
                    with console.status("Working..."):
                        rec = movie_recommender(user_id, recommendation_input, filter_watched, filter_top_rank)
                        print_titles(rec)
                    break
            break
        else:
            console.print("[red]❌ Invalid choice. Please try again.[/red]")

def print_titles(recommend_titles):
    # Use plain print() instead of console.print() for Node.js compatibility
    print("\nTop 10 Recommended Similar Movies:")
    for i, title in enumerate(recommend_titles, 1):
        print(f"{i}. {title}")

if __name__ == "__main__":
    main()