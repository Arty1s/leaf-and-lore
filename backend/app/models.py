from __future__ import annotations

import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BookStatus(str, enum.Enum):
    WANT_TO_READ = "want_to_read"
    READING = "reading"
    FINISHED = "finished"
    DROPPED = "dropped"


class Difficulty(str, enum.Enum):
    EASY = "easy"
    NORMAL = "normal"
    DIFFICULT = "difficult"


class FriendshipStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class GoalMetric(str, enum.Enum):
    BOOKS = "books"
    PAGES = "pages"
    MINUTES = "minutes"


class GoalPeriod(str, enum.Enum):
    MONTH = "month"
    YEAR = "year"
    CUSTOM = "custom"


class ClubRole(str, enum.Enum):
    OWNER = "owner"
    MODERATOR = "moderator"
    MEMBER = "member"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(80))
    bio: Mapped[str | None] = mapped_column(Text)
    tagline: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(Text)
    banner_url: Mapped[str | None] = mapped_column(Text)
    reading_speed_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    library: Mapped[list[UserBook]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reading_sessions: Mapped[list[ReadingSession]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(300), index=True)
    author: Mapped[str] = mapped_column(String(300), index=True)
    cover_url: Mapped[str | None] = mapped_column(String(500))
    isbn: Mapped[str | None] = mapped_column(String(20), unique=True)
    page_count: Mapped[int | None] = mapped_column(Integer)
    word_count: Mapped[int | None] = mapped_column(Integer)
    genre: Mapped[str | None] = mapped_column(String(120), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    metadata_source: Mapped[str | None] = mapped_column(String(40))
    metadata_source_id: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("page_count IS NULL OR page_count > 0", name="ck_books_page_count_positive"),
        CheckConstraint("word_count IS NULL OR word_count > 0", name="ck_books_word_count_positive"),
        UniqueConstraint("metadata_source", "metadata_source_id", name="uq_books_metadata_source_id"),
    )


class UserBook(Base):
    __tablename__ = "user_books"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), index=True)
    status: Mapped[BookStatus] = mapped_column(Enum(BookStatus), default=BookStatus.WANT_TO_READ, index=True)
    rating: Mapped[Decimal | None] = mapped_column(Numeric(2, 1))
    notes: Mapped[str | None] = mapped_column(Text)
    start_date: Mapped[date | None] = mapped_column(Date)
    finish_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="library")
    book: Mapped[Book] = relationship()

    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_user_books_user_book"),
        CheckConstraint("rating IS NULL OR (rating >= 0.5 AND rating <= 5)", name="ck_user_books_rating_range"),
    )


class ReadingSession(Base):
    __tablename__ = "reading_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_book_id: Mapped[int] = mapped_column(ForeignKey("user_books.id", ondelete="CASCADE"), index=True)
    starting_page: Mapped[int] = mapped_column(Integer)
    ending_page: Mapped[int] = mapped_column(Integer)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    session_date: Mapped[date] = mapped_column(Date, index=True)
    difficulty: Mapped[Difficulty | None] = mapped_column(Enum(Difficulty))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="reading_sessions")
    user_book: Mapped[UserBook] = relationship()

    __table_args__ = (
        CheckConstraint("starting_page >= 0", name="ck_sessions_start_nonnegative"),
        CheckConstraint("ending_page > starting_page", name="ck_sessions_pages_increase"),
        CheckConstraint("duration_minutes > 0", name="ck_sessions_duration_positive"),
    )

    @property
    def pages_read(self) -> int:
        return self.ending_page - self.starting_page

    def estimated_words_read(self, book: Book) -> int:
        words_per_page = (book.word_count / book.page_count) if book.word_count and book.page_count else 275
        return round(words_per_page * self.pages_read)

    def pages_per_hour(self) -> float:
        return round(self.pages_read / (self.duration_minutes / 60), 1)

    def estimated_wpm(self, book: Book) -> float:
        return round(self.estimated_words_read(book) / self.duration_minutes, 1)


class Friendship(Base):
    __tablename__ = "friendships"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_low_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_high_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[FriendshipStatus] = mapped_column(Enum(FriendshipStatus), default=FriendshipStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        UniqueConstraint("user_low_id", "user_high_id", name="uq_friendships_pair"),
        CheckConstraint("user_low_id < user_high_id", name="ck_friendships_canonical_pair"),
    )


class Follow(Base):
    __tablename__ = "follows"

    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    followed_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("follower_id", "followed_id", name="uq_follows_pair"),
        CheckConstraint("follower_id != followed_id", name="ck_follows_not_self"),
    )


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReadingGoal(Base):
    __tablename__ = "reading_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    metric: Mapped[GoalMetric] = mapped_column(Enum(GoalMetric))
    period: Mapped[GoalPeriod] = mapped_column(Enum(GoalPeriod))
    target_value: Mapped[int] = mapped_column(Integer)
    starts_on: Mapped[date] = mapped_column(Date)
    ends_on: Mapped[date] = mapped_column(Date)

    __table_args__ = (
        CheckConstraint("target_value > 0", name="ck_goals_target_positive"),
        CheckConstraint("ends_on >= starts_on", name="ck_goals_date_order"),
        UniqueConstraint("user_id", "metric", "starts_on", "ends_on", name="uq_goals_user_metric_period"),
    )


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_book_id: Mapped[int] = mapped_column(ForeignKey("user_books.id", ondelete="CASCADE"), unique=True)
    body: Mapped[str] = mapped_column(Text)
    contains_spoilers: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DiscordConnection(Base):
    __tablename__ = "discord_connections"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    discord_user_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    discord_username: Mapped[str] = mapped_column(String(80))
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BookClub(Base):
    __tablename__ = "book_clubs"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    discord_guild_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    discord_channel_id: Mapped[int | None] = mapped_column(BigInteger)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ClubMembership(Base):
    __tablename__ = "club_memberships"

    id: Mapped[int] = mapped_column(primary_key=True)
    club_id: Mapped[int] = mapped_column(ForeignKey("book_clubs.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[ClubRole] = mapped_column(Enum(ClubRole), default=ClubRole.MEMBER)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("club_id", "user_id", name="uq_club_memberships_club_user"),)
