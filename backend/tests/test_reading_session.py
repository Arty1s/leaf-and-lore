from datetime import date

from app.models import Book, Difficulty, ReadingSession


def make_session(**overrides: object) -> ReadingSession:
    values = {
        "user_id": 1,
        "user_book_id": 1,
        "starting_page": 10,
        "ending_page": 40,
        "duration_minutes": 30,
        "session_date": date(2026, 8, 29),
        "difficulty": Difficulty.NORMAL,
    }
    values.update(overrides)
    return ReadingSession(**values)


def test_reading_session_uses_book_word_count() -> None:
    book = Book(title="Example", author="Author", page_count=400, word_count=120_000)
    session = make_session()

    assert session.pages_read == 30
    assert session.estimated_words_read(book) == 9_000
    assert session.pages_per_hour() == 60
    assert session.estimated_wpm(book) == 300


def test_reading_session_falls_back_to_275_words_per_page() -> None:
    book = Book(title="Example", author="Author")
    session = make_session(starting_page=5, ending_page=25, duration_minutes=25, difficulty=None)

    assert session.estimated_words_read(book) == 5_500
    assert session.estimated_wpm(book) == 220
