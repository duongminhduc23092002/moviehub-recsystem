import sys
import io
import argparse  # ⭐ THÊM: Import argparse

# ⭐ FIX: Set UTF-8 encoding for stdout/stderr on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from scripts.login import login
    from modules import *
except Exception:
    from login import login
    from __init__ import *

from rich.console import Console
console = Console()
sep_line = "[cyan]-[/cyan]" * 50

def print_titles(recommend_titles):
    """Print movie titles to stdout"""
    for i, title in enumerate(recommend_titles, 1):
        try:
            print(f"{i}. {title}")
        except UnicodeEncodeError:
            print(f"{i}. {title.encode('ascii', errors='replace').decode('ascii')}")

def main():
    # ⭐ THÊM: Parse command-line arguments
    parser = argparse.ArgumentParser(description='Movie Recommendation System')
    parser.add_argument('--mode', type=str, choices=['1', '2'], 
                        help='1: User-based, 2: Title-based')
    parser.add_argument('--user-id', type=int, help='User ID (mode 1)')
    parser.add_argument('--title', type=str, help='Movie title (mode 2)')
    parser.add_argument('--limit', type=int, default=10, help='Number of results')
    parser.add_argument('--filter-watched', action='store_true', help='Filter watched (mode 1)')
    
    args = parser.parse_args()

    # ⭐ THÊM: NON-INTERACTIVE MODE (called from Node.js)
    if args.mode:
        try:
            # MODE 1: User-based recommendations
            if args.mode == '1' and args.user_id:
                user_id = args.user_id
                filter_watched = args.filter_watched
                
                recommendation_input = find_user_interests(user_id)
                
                if not recommendation_input:
                    print("Error: No user interests found", file=sys.stderr)
                    return
                
                rec = movie_recommender(
                    user_id, 
                    recommendation_input,
                    filter_watched=filter_watched,
                    filter_top_rank=True
                )
                
                limited_rec = rec[:args.limit]
                print_titles(limited_rec)
            
            # MODE 2: Title-based similar movies (⭐ MỚI)
            elif args.mode == '2' and args.title:
                title_query = args.title.strip()
                
                recommendation_input = find_by_title(title_query)
                
                if not recommendation_input:
                    print(f"Error: Movie '{title_query}' not found", file=sys.stderr)
                    return
                
                # Use None for user_id, disable all filters for similarity
                rec = movie_recommender(
                    None,  # No user context
                    recommendation_input,
                    filter_watched=False,
                    filter_top_rank=False
                )
                
                limited_rec = rec[:args.limit]
                print_titles(limited_rec)
            
            else:
                print("Error: Invalid arguments", file=sys.stderr)
                parser.print_help(sys.stderr)
                return
                
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
        
        return
    # ⭐ KẾT THÚC PHẦN THÊM MỚI

    # ========== CODE CŨ (GIỮ NGUYÊN 100%) ==========
    # ⭐ Check if called from Node.js with args
    if len(sys.argv) >= 3:
        user_id_str = sys.argv[1]
        limit_str = sys.argv[2]
        filter_watched_str = sys.argv[3] if len(sys.argv) > 3 else "false"
        debug_mode = sys.argv[4] if len(sys.argv) > 4 else "false"  # ⭐ NEW: debug flag
        
        try:
            user_id = int(user_id_str)
            limit = int(limit_str)
        except ValueError as e:
            print(f"Error: Invalid parameters: {e}", file=sys.stderr)
            return
        
        filter_watched = filter_watched_str.lower() == "true"
        
        try:
            recommendation_input = find_user_interests(user_id)
            
            if not recommendation_input:
                print("Error: No user interests found", file=sys.stderr)
                return
            
            # ⭐ NEW: Print debug info if debug mode enabled
            if debug_mode.lower() == "true":
                genres, keywords = recommendation_input
                print(f"DEBUG:USER_GENRES:{','.join(genres)}", file=sys.stderr)
                print(f"DEBUG:USER_KEYWORDS:{','.join(keywords)}", file=sys.stderr)
            
            # Get recommendations
            rec = movie_recommender(
                user_id, 
                recommendation_input,
                filter_watched=filter_watched,
                filter_top_rank=True
            )
            
            limited_rec = rec[:limit]
            
            # ⭐ FIX: Print titles with proper encoding handling
            for title in limited_rec:
                try:
                    print(title)
                except UnicodeEncodeError:
                    # Fallback: replace problematic characters
                    print(title.encode('ascii', errors='replace').decode('ascii'))
                
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
        
        return
    
    # ⭐ Original interactive mode (when run directly)
    user_id = login()
    filter_watched = False
    filter_top_rank = False

    console.print(sep_line)
    console.print(
        "[bold cyan]Choose Recommendation Mode:[/bold cyan]\n"
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

if __name__ == "__main__":
    main()