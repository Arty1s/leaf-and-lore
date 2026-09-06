from datetime import date

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Book, BookStatus, Difficulty, ReadingSession, User, UserBook


BOOKS = [
    ("The Left Hand of Darkness", "Ursula K. Le Guin", "9780441478125", 304, "Science Fiction", "https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg", BookStatus.READING),
    ("Piranesi", "Susanna Clarke", "9781635577808", 272, "Fantasy", "https://covers.openlibrary.org/b/isbn/9781635577808-L.jpg", BookStatus.WANT_TO_READ),
    ("Babel", "R. F. Kuang", "9780063021426", 560, "Historical Fantasy", "https://covers.openlibrary.org/b/isbn/9780063021426-L.jpg", BookStatus.WANT_TO_READ),
    ("Atomic Habits", "James Clear", "9780735211292", 320, "Self improvement", "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg", BookStatus.READING),
    ("Project Hail Mary", "Andy Weir", "9780593135204", 496, "Science Fiction", "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg", BookStatus.FINISHED),
    ("Dune", "Frank Herbert", "9780441172719", 688, "Science Fiction", "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg", BookStatus.FINISHED),
]


def seed_demo_data() -> None:
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == "alex"))
        if not user:
            user = User(email="alex@example.com", username="alex", password_hash="demo-not-for-production", display_name="Alex Morgan", bio="A curious reader of literary fiction and science fiction.", avatar_url="https://i.pravatar.cc/240?img=12", reading_speed_public=True)
            db.add(user)
            db.flush()
        demo_people = [
            ("michaela", "Michaela Reed", 32),
            ("tom", "Tom Bennett", 12),
            ("nina", "Nina Kovac", 47),
            ("daniel", "Daniel Brooks", 11),
        ]
        for username, display_name, avatar in demo_people:
            if not db.scalar(select(User).where(User.username == username)):
                db.add(User(email=f"{username}@example.com", username=username, password_hash="demo-not-for-production", display_name=display_name, bio="Reader and member of the Leaf & Lore community.", tagline="Always looking for the next unforgettable book.", avatar_url=f"https://i.pravatar.cc/240?img={avatar}", reading_speed_public=True))
        if not db.scalar(select(UserBook).where(UserBook.user_id == user.id)):
            created = []
            for title, author, isbn, pages, genre, cover, status in BOOKS:
                book = Book(title=title, author=author, isbn=isbn, page_count=pages, genre=genre, cover_url=cover, metadata_source="seed")
                db.add(book)
                db.flush()
                item = UserBook(user_id=user.id, book_id=book.id, status=status, rating=4.5 if status == BookStatus.FINISHED else None, start_date=date(2026, 8, 1) if status == BookStatus.READING else None, finish_date=date(2026, 8, 18) if status == BookStatus.FINISHED else None)
                db.add(item)
                db.flush()
                created.append(item)
            current = created[0]
            db.add_all([
                ReadingSession(user_id=user.id, user_book_id=current.id, starting_page=100, ending_page=142, duration_minutes=48, session_date=date(2026, 8, 27), difficulty=Difficulty.NORMAL),
                ReadingSession(user_id=user.id, user_book_id=current.id, starting_page=142, ending_page=184, duration_minutes=48, session_date=date(2026, 8, 29), difficulty=Difficulty.NORMAL),
            ])
        db.commit()
