"""Import the user-approved intake, preserving separate language/format editions."""
import asyncio
import re
import unicodedata
import json
import html
from pathlib import Path
import httpx
from sqlalchemy import select
from app.database import SessionLocal
from app.models import Book, User, UserBook, BookStatus

def normalized(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text.casefold()) if not unicodedata.combining(c))

def title_words(text):
    """Comparable title words, ignoring punctuation and format notes."""
    text = re.sub(r'\([^)]*\)', ' ', normalized(text))
    return {word for word in re.findall(r'[a-z0-9]+', text) if len(word) > 2}

def broad_genre(title, author=''):
    text=normalized(title+' '+author)
    groups=[
        ('Fantasy',('harry potter','artemis fowl','magisterium','hraniciarov','eragon','cruel prince','volanie vlka','beginning after the end','alchymista','nekonecny pribeh','znameni ametystu','pan prstenov','beedle','barda beedleho','famfrpal','grindelwald')),
        ('Science Fiction',('dune','duna','ready player','artemis andy weir')),
        ('Business & Marketing',('give and take','trifecta advantage','influence','zlta kniha','start with why','never split','this is marketing','contagious','storybrand','diary of a ceo','talk like ted')),
        ('Psychology & Self-help',('48 laws','mastery','daily laws','atomic habits','psychology of money','originals','clear thinking','surrounded by idiots','how to win friends','thinking fast','war of art','extraordinary mind','behave')),
        ('Science & Nature',('einstein','astrophysics','brief history of time','blueprints')),
        ('Classics & Philosophy',('hamlet','art of war','meditations','don quijote','1984','na zapade nic nove')),
        ('Mystery & Thriller',('naturals','assassin’s creed','assassin\'s creed')),
        ('Biography & Memoir',('beyond the wand',)),
    ]
    for genre,needles in groups:
        if any(needle in text for needle in needles):return genre
    return 'Fiction'

VERIFIED_METADATA = {
    'Jednoducho Einstein': ('Rüdiger Vaas', 128, 'https://rezised-images.knhbt.cz/1920x1920/70024983.webp'),
    'Alchymista: Tajomstvo nesmrteľného Nicholasa Flamela': ('Michael Scott', 400, 'https://mrtns.sk/tovar/_l/257/l257989.jpg?v=17804608922'),
    'Pobertův plánek / Průvodce Bradavicemi (Czech)': ('Erinn Pascal', 52, 'https://covers.openlibrary.org/b/isbn/9781338252804-L.jpg'),
    'The Trifecta Advantage': ('Adriana Hrubý', 141, None),
    'Duna': ('Frank Herbert', 496, 'https://mrtns.sk/tovar/_l/312/l312629.jpg?v=17886738072'),
    'Dune': ('Frank Herbert', 896, 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg'),
    'Pán prsteňov': ('J.R.R. Tolkien', 456, 'https://mrtns.sk/tovar/_l/134/l134260.jpg?v=17886738092'),
    'Pán prsteňov I. – Spoločenstvo prsteňa': ('J.R.R. Tolkien', 456, 'https://mrtns.sk/tovar/_l/134/l134260.jpg?v=17886738092'),
    'Volanie vlka': ('Anthony Ryan', 528, 'https://mrtns.sk/tovar/_l/878/l878807.jpg?v=17886738072'),
    'Don Quijote de la Mancha': ('Miguel de Cervantes', 1560, 'https://www.planetadelibros.com.mx/usuaris/libros/fotos/250/original/249590_portada_don-quijote-de-la-mancha_miguel-de-cervantes_201504281253.png'),
    'Meditations': ('Marcus Aurelius', 254, 'https://www.dymocks.com.au/images/meditations-popular-penguins-marcus-aurelius-9780143566328.jpg'),
    'Blueprints': ('Marcus du Sautoy', 384, 'https://www.hachettebookgroup.com/wp-content/uploads/2025/01/9781541605701.jpg'),
    'Hraničiarov učeň 4': ('John Flanagan', 312, 'https://mrtns.sk/tovar/_l/309/l309194.jpg?v=17886738072'),
    'Hraničiarov učeň 5': ('John Flanagan', 436, 'https://mrtns.sk/tovar/_l/437/l437283.jpg?v=17870782812'),
    'Hraničiarov učeň 6': ('John Flanagan', 312, 'https://mrtns.sk/tovar/_l/437/l437285.jpg?v=17798572302'),
    'Harry Potter and the Prisoner of Azkaban': ('J.K. Rowling', 480, None),
    'Harry Potter a Tajomná komnata': ('J.K. Rowling', 400, 'https://covers.openlibrary.org/b/isbn/9781408855669-L.jpg'),
    'Harry Potter a Väzeň z Azkabanu': ('J.K. Rowling', 480, 'https://covers.openlibrary.org/b/isbn/9781408855676-L.jpg'),
    'Harry Potter a Ohnivá čaša': ('J.K. Rowling', 712, 'https://covers.openlibrary.org/b/isbn/9781408855683-L.jpg'),
    'Harry Potter a Fénixov rád': ('J.K. Rowling', 832, 'https://covers.openlibrary.org/b/isbn/9781408855690-L.jpg'),
    'Harry Potter a Polovičný princ': ('J.K. Rowling', 432, 'https://covers.openlibrary.org/b/isbn/9781408855706-L.jpg'),
    'Harry Potter a Dary smrti': ('J.K. Rowling', 624, 'https://covers.openlibrary.org/b/isbn/9781408855713-L.jpg'),
}

def intake():
    text = Path('../artemis-library-draft.md').read_text(encoding='utf-8')
    rows=[]
    status=None
    for line in text.splitlines():
        if line.startswith('## '):
            status = 'finished' if 'finished' in line.lower() else 'reading' if line == '## Reading (confirmed)' else 'want_to_read' if line == '## Want to Read' else None
            continue
        if not status or not re.match(r'^(?:\d+\. |\- )',line): continue
        value=re.sub(r'^(?:\d+\. |\- )','',line)
        if 'Hraničiarov učeň' in value:
            for n in (range(1,8) if status=='finished' else range(8,10)):
                rows.append((f'Hraničiarov učeň {n}', 'John Flanagan',status,'Slovak'))
            continue
        if value.startswith('Magisterium —'):
            for title in ['Železná skúška','Medená rukavica','Bronzový kľúč','Strieborná maska','Zlatá veža']:
                rows.append((title,'Holly Black & Cassandra Clare',status,'Slovak'))
            continue
        if value.startswith('Artemis Fowl — English, from'):
            for title in ['The Eternity Code','The Opal Deception','The Lost Colony','The Time Paradox','The Atlantis Complex','The Last Guardian']:
                rows.append(('Artemis Fowl: '+title,'Eoin Colfer',status,'English'))
            continue
        if 'pending' in value or 'clarification' in value or 'likely ' in value or 'unclear' in value:
            continue
        parts=value.split(' — ',1)
        title=parts[0].strip().rstrip('.')
        rest=parts[1] if len(parts)>1 else ''
        language=next((lang for lang in ['Slovak','Czech','English','Spanish'] if lang in value),'')
        author=re.split(r'[;(]|\. Title',rest)[0].strip().rstrip('.')
        if author.startswith(('Slovak','English','Spanish','volume')): author=''
        if 'graphic novel' in value: title+=' (graphic novel)'
        elif 'film/tie-in' in value: title+=' (film tie-in)'
        rows.append((title,author,status,language))
    return rows

async def main():
    with SessionLocal() as db:
        user=db.scalar(select(User).where(User.username=='artemis'))
        assert user, 'Artemis account missing'
        targets=[]
        for title,author,status,language in intake():
            key=title+'|'+language
            book=db.scalar(select(Book).where(Book.metadata_source=='artemis-intake',Book.metadata_source_id==key[:120]))
            if not book:
                book=Book(title=title,author=author or 'Unknown author',metadata_source='artemis-intake',metadata_source_id=key[:120])
                db.add(book);db.flush()
            item=db.scalar(select(UserBook).where(UserBook.user_id==user.id,UserBook.book_id==book.id))
            if not item: db.add(UserBook(user_id=user.id,book_id=book.id,status=BookStatus(status)))
            targets.append((book.id,title,author,language))
        db.commit()
        print(f'Saved {len(targets)} confirmed books',flush=True)
    sem=asyncio.Semaphore(3)
    async with httpx.AsyncClient(timeout=20) as client:
        async def enrich(row):
            ident,title,author,language=row
            try:
                async with sem:
                    search_title=title
                    if title.startswith('Hraničiarov učeň '):
                        words=['prvá','druhá','tretia','štvrtá','piata','šiesta','siedma','ôsma','deviata']
                        search_title='Hraničiarov učeň kniha '+words[int(title.rsplit(' ',1)[1])-1]
                    response=await client.get('https://www.martinus.sk/search',params={'q':search_title})
                    links=list(dict.fromkeys(re.findall(r'href="(/[^"?]+/kniha)"',response.text)))[:8]
                    for link in links:
                        page=await client.get('https://www.martinus.sk'+link)
                        schemas=re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',page.text,re.S)
                        for raw in schemas:
                            try:data=json.loads(raw)
                            except ValueError:continue
                            for data in (data if isinstance(data,list) else [data]):
                                if not isinstance(data,dict):continue
                                schema_types=data.get('@type',[])
                                if isinstance(schema_types,str):schema_types=[schema_types]
                                if 'Book' not in schema_types:continue
                                name=data.get('name','')
                                expected=title_words(search_title.replace('kniha ',''))
                                actual=title_words(name)
                                # Martinus commonly adds a subtitle or edition label.
                                if expected and len(expected & actual) / len(expected) < .65:continue
                                lang=str(data.get('inLanguage','')).lower()
                                if language and lang and lang not in {'Slovak':{'sk','slovak','slovenčina'},'Czech':{'cs','czech','čeština'},'English':{'en','english','angličtina'},'Spanish':{'es','spanish','španielčina'}}[language]:continue
                                cover_url=data.get('image') or data.get('thumbnailUrl')
                                cover=re.search(r'<meta property="og:image" content="([^"]+)"',page.text)
                                pages=data.get('numberOfPages')
                                with SessionLocal() as db:
                                    book=db.get(Book,ident)
                                    if not (book.cover_url or '').startswith('/'):
                                        if cover_url:book.cover_url=html.unescape(str(cover_url))
                                        elif cover:book.cover_url=html.unescape(cover.group(1))
                                    if str(pages).isdigit() and int(pages)>0:book.page_count=int(pages)
                                    book.genre=broad_genre(book.title,book.author)
                                    db.commit()
                                return
                async with sem:
                    r=await client.get('https://openlibrary.org/search.json',params={'title':title,'author':author,'limit':3,'fields':'title,author_name,cover_i,number_of_pages_median,subject'})
                    r.raise_for_status()
                docs=r.json().get('docs',[])
                if not docs:return
                expected=title_words(title)
                matching=[doc for doc in docs if not expected or len(expected & title_words(doc.get('title',''))) / len(expected) >= .6]
                if not matching:return
                doc=matching[0]
                with SessionLocal() as db:
                    book=db.get(Book,ident)
                    if doc.get('cover_i') and not (book.cover_url or '').startswith('/'):book.cover_url=f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-L.jpg"
                    if doc.get('number_of_pages_median'):book.page_count=doc['number_of_pages_median']
                    if not author and doc.get('author_name'):book.author=', '.join(doc['author_name'][:2])
                    book.genre=broad_genre(book.title,book.author)
                    db.commit()
            except Exception as exc:
                safe_title = title.encode('ascii', 'backslashreplace').decode('ascii')
                print(f'Metadata unavailable for {safe_title}: {type(exc).__name__}', flush=True)
        await asyncio.gather(*(enrich(row) for row in targets))
    print('Metadata pass complete',flush=True)
    with SessionLocal() as db:
        user=db.scalar(select(User).where(User.username=='artemis'))
        for item in db.scalars(select(UserBook).where(UserBook.user_id==user.id)).all():
            item.book.genre=broad_genre(item.book.title,item.book.author)
            verified = VERIFIED_METADATA.get(item.book.title)
            if verified:
                author, pages, cover = verified
                item.book.author = author
                item.book.page_count = pages
                if cover:
                    item.book.cover_url = cover
        db.commit()

if __name__=='__main__':asyncio.run(main())
