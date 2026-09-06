import { BarChart3, BookHeart, BookOpen, Bookmark, Check, ChevronRight, CircleHelp, Clock3, Compass, Goal, House, ImagePlus, Import, Library, Medal, Menu, MessageCircle, Moon, Pencil, Plus, Search, Share2, Sparkles, Star, Sun, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const AUTH_API="http://127.0.0.1:8014";
declare global { interface Window { __leafLoreFetchPatched?: boolean } }
if(!window.__leafLoreFetchPatched){const originalFetch=window.fetch.bind(window);window.fetch=(input,init={})=>{let target=input;if(typeof input==="string"&&(input.startsWith("http://127.0.0.1:8000")||input.startsWith("http://127.0.0.1:8001")))target=input.replace(/http:\/\/127\.0\.0\.1:800[01]/,AUTH_API);const token=localStorage.getItem("leaf-lore-session");const headers=new Headers(init.headers);if(token)headers.set("Authorization",`Bearer ${token}`);return originalFetch(target,{...init,headers});};window.__leafLoreFetchPatched=true;}

const monthlyPages = [
  { month: "Mar", pages: 620 }, { month: "Apr", pages: 870 },
  { month: "May", pages: 740 }, { month: "Jun", pages: 1120 },
  { month: "Jul", pages: 960 }, { month: "Aug", pages: 1240 },
];
const navigation = [["Home", House], ["My Library", Library], ["Friends", Users], ["Leaderboard", Medal], ["Book Club", BookHeart]] as const;
const recommendations = [
  { title: "Piranesi", author: "Susanna Clarke", reason: "Because you enjoy literary fantasy", cover: "https://covers.openlibrary.org/b/isbn/9781635577808-L.jpg", match: "96% match" },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", reason: "Thoughtful speculative fiction", cover: "https://covers.openlibrary.org/b/isbn/9780593396568-L.jpg", match: "Book club pick" },
  { title: "Babel", author: "R. F. Kuang", reason: "Popular with 4 friends", cover: "https://covers.openlibrary.org/b/isbn/9780063021426-L.jpg", match: "92% match" },
  { title: "An Immense World", author: "Ed Yong", reason: "Explore more natural science", cover: "https://covers.openlibrary.org/b/isbn/9780593133231-L.jpg", match: "New genre" },
];
const socialReaders = [
  {name:"Michaela",avatar:"https://i.pravatar.cc/160?img=32",current:"Atomic Habits",progress:42,finished:"Educated",finishedCover:"https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg",recommendation:"A thoughtful memoir about learning to choose your own life.",rating:"4.8"},
  {name:"Tom",avatar:"https://i.pravatar.cc/160?img=12",current:"Babel",progress:16,finished:"Project Hail Mary",finishedCover:"https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",recommendation:"Clever, warm science fiction that is impossible to put down.",rating:"4.7"},
  {name:"Nina",avatar:"https://i.pravatar.cc/160?img=47",current:"The Will to Change",progress:44,finished:"Piranesi",finishedCover:"https://covers.openlibrary.org/b/isbn/9781635577808-L.jpg",recommendation:"Beautiful, strange, and best discovered with no spoilers.",rating:"4.9"},
  {name:"Daniel",avatar:"https://i.pravatar.cc/160?img=11",current:"Sea of Tranquility",progress:58,finished:"The Midnight Library",finishedCover:"https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg",recommendation:"A comforting reminder that a life can hold many possibilities.",rating:"4.5"},
];
const leaderboardReaders = [
  {name:"Alex",avatar:"https://i.pravatar.cc/160?img=12",pages:1240,books:4,time:"18h 20m",last:"Dune"},
  {name:"Michaela",avatar:"https://i.pravatar.cc/160?img=32",pages:1080,books:3,time:"16h 05m",last:"Educated"},
  {name:"Tom",avatar:"https://i.pravatar.cc/160?img=12",pages:870,books:3,time:"13h 40m",last:"Project Hail Mary"},
  {name:"Nina",avatar:"https://i.pravatar.cc/160?img=47",pages:740,books:2,time:"11h 15m",last:"Piranesi"},
  {name:"Sara",avatar:"https://i.pravatar.cc/160?img=25",pages:620,books:2,time:"9h 50m",last:"Sapiens"},
];
const pageContent: Record<string, { action: string; eyebrow: string; intro: string; cards: { label: string; value: string; note: string }[]; title: string; items: { name: string; detail: string; meta: string }[] }> = {
  "My Library": { action: "Add book", eyebrow: "Your collection", intro: "Keep every book organized by where it sits in your reading life.", cards: [{label:"Want to read",value:"24",note:"Your next possibilities"},{label:"Reading",value:"2",note:"Currently in progress"},{label:"Finished",value:"31",note:"Completed this year"}], title:"Recently updated", items:[{name:"The Left Hand of Darkness",detail:"Reading · page 184 of 304",meta:"61%"},{name:"Piranesi",detail:"Want to read · Susanna Clarke",meta:"Added today"},{name:"Project Hail Mary",detail:"Finished · 4.5/5",meta:"18 Aug"}] },
  "Reading": { action: "Log session", eyebrow: "Session journal", intro: "Record the time you spend reading and understand your pace in context.", cards: [{label:"Today",value:"42 pages",note:"48 minutes"},{label:"This month",value:"14 sessions",note:"18h 20m total"},{label:"Average pace",value:"286 WPM",note:"Varies by book"}], title:"Recent sessions", items:[{name:"The Left Hand of Darkness",detail:"Pages 142–184 · Normal difficulty",meta:"48 min"},{name:"The Dispossessed",detail:"Pages 80–112 · Difficult",meta:"41 min"},{name:"Atomic Habits",detail:"Pages 31–58 · Easy",meta:"22 min"}] },
  "Friends": { action: "Find friends", eyebrow: "Reading circle", intro: "See what close friends are enjoying without turning reading into a competition.", cards: [{label:"Friends",value:"12",note:"In your circle"},{label:"Reading now",value:"8",note:"Across 7 books"},{label:"Shared books",value:"16",note:"This year"}], title:"Currently reading", items:[{name:"Michaela",detail:"Atomic Habits · page 126",meta:"42%"},{name:"Tom",detail:"Babel · page 88",meta:"16%"},{name:"Nina",detail:"The Will to Change · page 104",meta:"44%"}] },
  "Leaderboard": { action: "Change period", eyebrow: "Friendly leaderboard", intro: "A small monthly view for your friends, ranked by books finished—not streaks.", cards: [{label:"Your rank",value:"#1",note:"Friends · August"},{label:"Books finished",value:"4",note:"This month"},{label:"Club average",value:"2.8",note:"Books per member"}], title:"Friends · This month", items:[{name:"1. Alex",detail:"4 books · 1,240 pages",meta:"18h 20m"},{name:"2. Michaela",detail:"3 books · 1,080 pages",meta:"16h 05m"},{name:"3. Tom",detail:"3 books · 870 pages",meta:"13h 40m"}] },
  "Book Club": { action: "Invite member", eyebrow: "Discord book club", intro: "One calm place for your club's reading, discussions, and shared monthly pick.", cards: [{label:"Members",value:"8",note:"6 active this month"},{label:"Club pages",value:"6,520",note:"August total"},{label:"Shared pick",value:"61%",note:"Average progress"}], title:"Book Club · August", items:[{name:"The Left Hand of Darkness",detail:"Current club pick · 6 members reading",meta:"Discuss 3 Sep"},{name:"Michaela",detail:"1,080 pages · 3 books",meta:"#1 club"},{name:"Discord connected",detail:"Commands and account linking ready next",meta:"Online"}] },
};
const visualContent: Record<string, { title: string; subtitle: string; items: { name: string; byline: string; badge: string; image?: string; progress?: number }[] }> = {
  "My Library": { title: "Want to read", subtitle: "24 books waiting on your shelf", items: [
    {name:"Piranesi",byline:"Susanna Clarke",badge:"Fantasy",image:"https://covers.openlibrary.org/b/isbn/9781635577808-L.jpg"},
    {name:"Babel",byline:"R. F. Kuang",badge:"Historical fantasy",image:"https://covers.openlibrary.org/b/isbn/9780063021426-L.jpg"},
    {name:"An Immense World",byline:"Ed Yong",badge:"Science",image:"https://covers.openlibrary.org/b/isbn/9780593133231-L.jpg"},
    {name:"Klara and the Sun",byline:"Kazuo Ishiguro",badge:"Literary fiction",image:"https://covers.openlibrary.org/b/isbn/9780593396568-L.jpg"},
    {name:"Tomorrow, and Tomorrow, and Tomorrow",byline:"Gabrielle Zevin",badge:"Contemporary",image:"https://covers.openlibrary.org/b/isbn/9780593466490-L.jpg"},
    {name:"The Will to Change",byline:"bell hooks",badge:"Non-fiction",image:"https://covers.openlibrary.org/b/isbn/9780743456081-L.jpg"},
  ]},
  "Reading": { title: "Books in progress", subtitle: "Continue where you left off", items: [
    {name:"The Left Hand of Darkness",byline:"Ursula K. Le Guin",badge:"Page 184 of 304",image:"https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg",progress:61},
    {name:"The Dispossessed",byline:"Ursula K. Le Guin",badge:"Page 112 of 387",image:"https://covers.openlibrary.org/b/isbn/9780061054884-L.jpg",progress:29},
    {name:"Atomic Habits",byline:"James Clear",badge:"Page 58 of 320",image:"https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",progress:18},
  ]},
  "Friends": { title: "Around your circle", subtitle: "What friends are reading now", items: [
    {name:"Michaela",byline:"Atomic Habits",badge:"42% read",image:"https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",progress:42},
    {name:"Tom",byline:"Babel",badge:"16% read",image:"https://covers.openlibrary.org/b/isbn/9780063021426-L.jpg",progress:16},
    {name:"Nina",byline:"The Will to Change",badge:"44% read",image:"https://covers.openlibrary.org/b/isbn/9780743456081-L.jpg",progress:44},
  ]},
  "Leaderboard": { title: "Top readers", subtitle: "Friends · August · ranked by pages", items: [
    {name:"Alex",byline:"1,240 pages · 18h 20m",badge:"1"},{name:"Michaela",byline:"1,080 pages · 16h 05m",badge:"2"},{name:"Tom",byline:"870 pages · 13h 40m",badge:"3"},
  ]},
  "Book Club": { title: "On the club shelf", subtitle: "Current and upcoming group reads", items: [
    {name:"The Left Hand of Darkness",byline:"August pick · 6 reading",badge:"Discuss 3 Sep",image:"https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg",progress:61},
    {name:"Klara and the Sun",byline:"September shortlist",badge:"5 votes",image:"https://covers.openlibrary.org/b/isbn/9780593396568-L.jpg"},
    {name:"Piranesi",byline:"September shortlist",badge:"3 votes",image:"https://covers.openlibrary.org/b/isbn/9781635577808-L.jpg"},
  ]},
};
const finishedBooks = [
  {name:"Project Hail Mary",author:"Andy Weir",finished:"Finished 18 Aug",rating:"4.5 ★",image:"https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg"},
  {name:"The Dispossessed",author:"Ursula K. Le Guin",finished:"Finished 2 Aug",rating:"5.0 ★",image:"https://covers.openlibrary.org/b/isbn/9780061054884-L.jpg"},
  {name:"Sea of Tranquility",author:"Emily St. John Mandel",finished:"Finished 21 Jul",rating:"4.0 ★",image:"https://covers.openlibrary.org/b/isbn/9780593321447-L.jpg"},
  {name:"Tomorrow, and Tomorrow, and Tomorrow",author:"Gabrielle Zevin",finished:"Finished 6 Jul",rating:"4.5 ★",image:"https://covers.openlibrary.org/b/isbn/9780593466490-L.jpg"},
  {name:"The Midnight Library",author:"Matt Haig",finished:"Finished 22 Jun",rating:"3.5 ★",image:"https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg"},
  {name:"Dune",author:"Frank Herbert",finished:"Finished 5 Jun",rating:"5.0 ★",image:"https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg"},
];
const droppedBooks = [
  {name:"Infinite Jest",byline:"David Foster Wallace",badge:"Dropped · page 126",image:"https://covers.openlibrary.org/b/isbn/9780316066525-L.jpg"},
  {name:"The Goldfinch",byline:"Donna Tartt",badge:"Dropped · page 214",image:"https://covers.openlibrary.org/b/isbn/9780316055437-L.jpg"},
];
const addBookCatalog = [
  {title:"Dune",author:"Frank Herbert",isbn:"978-0441172719",cover:"https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",genre:"Science Fiction",year:"1965",pages:"688",publisher:"Ace",language:"English",rating:"4.6",description:"Set on the desert planet Arrakis, Dune follows Paul Atreides through politics, betrayal, and the mystic spice."},
  {title:"Piranesi",author:"Susanna Clarke",isbn:"978-1635577808",cover:"https://covers.openlibrary.org/b/isbn/9781635577808-L.jpg",genre:"Fantasy",year:"2020",pages:"272",publisher:"Bloomsbury",language:"English",rating:"4.3",description:"A dreamlike mystery about an infinite house, an ocean, and one man's shifting understanding of his world."},
  {title:"Atomic Habits",author:"James Clear",isbn:"978-0735211292",cover:"https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",genre:"Self improvement",year:"2018",pages:"320",publisher:"Avery",language:"English",rating:"4.4",description:"A practical guide to building good habits, breaking bad ones, and mastering small behaviors."},
  {title:"Babel",author:"R. F. Kuang",isbn:"978-0063021426",cover:"https://covers.openlibrary.org/b/isbn/9780063021426-L.jpg",genre:"Historical Fantasy",year:"2022",pages:"560",publisher:"Harper Voyager",language:"English",rating:"4.2",description:"A dark academic fantasy about language, translation, power, and resistance in an alternate Oxford."},
];
type LibraryApiItem = {id:number;status:"want_to_read"|"reading"|"finished"|"dropped";rating:number|null;notes:string|null;finish_date:string|null;book:{title:string;author:string;isbn:string|null;cover_url:string|null;page_count:number|null;genre:string|null}};
type DashboardApi = {total_books:number;pages_read:number;finished_book_pages:number;partial_book_pages:number;reading_minutes:number;logged_reading_minutes:number;estimated_unlogged_pages:number;average_minutes_per_page:number;session_count:number;books_finished:number;average_rating:number|null;rated_books:number};
type SocialAccount = {username:string;display_name:string;avatar_url:string|null};
type ProfileApi = {username:string;display_name:string;bio:string|null;tagline?:string;avatar_url:string|null;banner_url:string|null;is_following?:boolean;followers?:SocialAccount[];following?:SocialAccount[];counts?:{books:number;finished:number;followers:number;following:number};books?:LibraryApiItem[]};
type ShelfBook = {name:string;byline:string;badge:string;image?:string;source?:LibraryApiItem};
type FinishedBookCard = {name:string;author:string;finished:string;rating:string;image:string;notes?:string|null;source?:LibraryApiItem};

export default function App(){
  const sharedMatch=window.location.pathname.match(/^\/shared\/([^/]+)$/);
  const [user,setUser]=useState<SocialAccount|null>(null);
  const [checking,setChecking]=useState(true);
  useEffect(()=>{const token=localStorage.getItem("leaf-lore-session");if(!token){setChecking(false);return;}void fetch(`${AUTH_API}/api/auth/me`).then(async response=>{if(response.ok)setUser(await response.json());else localStorage.removeItem("leaf-lore-session");}).finally(()=>setChecking(false));},[]);
  if(sharedMatch)return <PublicProfile username={decodeURIComponent(sharedMatch[1])}/>;
  if(checking)return <div className="auth-loading"><span className="brand-mark">L</span><p>Opening your library…</p></div>;
  if(!user)return <AuthPage onAuthenticated={account=>setUser(account)}/>;
  return <MainApp authUser={user} onLogout={()=>{void fetch(`${AUTH_API}/api/auth/logout`,{method:"POST"});localStorage.removeItem("leaf-lore-session");setUser(null);}}/>;
}

function PublicProfile({username}:{username:string}) {
  const [profile,setProfile]=useState<ProfileApi|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{void fetch(`${AUTH_API}/api/public/profiles/${encodeURIComponent(username)}`).then(async response=>{if(!response.ok)throw new Error("This shared profile is not available.");setProfile(await response.json());}).catch(reason=>setError(reason instanceof Error?reason.message:"Profile unavailable."));},[username]);
  if(error)return <main className="public-profile-state"><span className="brand-mark">L</span><h1>Profile unavailable</h1><p>{error}</p><a href="/">Visit Leaf & Lore</a></main>;
  if(!profile)return <div className="auth-loading"><span className="brand-mark">L</span><p>Opening shared profile…</p></div>;
  const books=profile.books||[];
  return <main className="public-profile"><nav><a href="/"><span className="brand-mark">L</span><strong>Leaf & Lore</strong></a><a className="public-join" href="/">Join Leaf & Lore</a></nav><div className="public-banner"><img src={profile.banner_url||"https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1600&q=80"} alt=""/></div><section><header><img src={profile.avatar_url||`https://i.pravatar.cc/240?u=${profile.username}`} alt={`${profile.display_name} profile`}/><div><p className="eyebrow">Shared reader profile</p><h1>{profile.display_name} <span>❧</span></h1><p>@{profile.username}</p><blockquote>“{profile.tagline||profile.bio||"So many books, so little time."}”</blockquote></div></header><div className="public-counts"><span><strong>{profile.counts?.books||0}</strong>Books</span><span><strong>{profile.counts?.finished||0}</strong>Finished</span><span><strong>{profile.counts?.followers||0}</strong>Followers</span><span><strong>{profile.counts?.following||0}</strong>Following</span></div><div className="public-books"><div><p className="eyebrow">Public bookshelf</p><h2>Books from {profile.display_name.split(" ")[0]}'s library</h2></div><div>{books.slice(0,12).map(item=><article key={item.id}><img src={item.book.cover_url||"https://covers.openlibrary.org/b/id/0-L.jpg"} alt={`${item.book.title} cover`}/><h3>{item.book.title}</h3><p>{item.book.author}</p><strong>{item.status.replaceAll("_"," ")}</strong></article>)}</div>{!books.length&&<p>This reader's shelf is empty for now.</p>}</div></section><footer>Shared from Leaf & Lore · Your reading life, beautifully collected.</footer></main>;
}

function MainApp({authUser,onLogout}:{authUser:SocialAccount;onLogout:()=>void}) {
  const [active, setActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark"|"light">("dark");
  const [profileName, setProfileName] = useState(authUser.display_name);
  const [inboxOpen,setInboxOpen]=useState(false);
  const [activeChat,setActiveChat]=useState<SocialAccount|null>(null);
  const [ownProfile,setOwnProfile]=useState<ProfileApi>({username:authUser.username,display_name:authUser.display_name,bio:"",tagline:"So many books, so little time.",avatar_url:authUser.avatar_url,banner_url:null});
  useEffect(()=>{void fetch(`http://127.0.0.1:8000/api/profiles/${authUser.username}`).then(async response=>{if(response.ok)setOwnProfile(await response.json());}).catch(()=>{});},[authUser.username]);
  const openProfile = (name:string) => { setProfileName(name); setActive("Profile"); window.scrollTo({top:0,behavior:"smooth"}); };
  return <div className={`app-shell ${theme}-theme ${active === "My Library" ? "library-mode" : ""} ${active === "Profile" ? "profile-mode" : ""}`}>
    <aside className={menuOpen ? "sidebar sidebar--open" : "sidebar"}>
      <div className="brand"><span className="brand-mark">L</span><span>Leaf & Lore</span></div>
      <nav aria-label="Main navigation">{navigation.map(([label, Icon]) =>
        <button className={active === label ? "nav-item active" : "nav-item"} key={label} onClick={() => { setActive(label); setMenuOpen(false); window.scrollTo({top: 0, behavior: "smooth"}); }}><Icon size={19}/><span>{label}</span></button>
      )}</nav>
      <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}<span>{theme === "dark" ? "Light mode" : "Dark mode"}</span></button>
      <div className="sidebar-utilities"><button onClick={()=>setInboxOpen(true)}><MessageCircle size={17}/><span>Messages</span></button><button className="feedback-tba" aria-label="Feedback coming soon"><CircleHelp size={17}/><span>Feedback</span><em>TBA</em></button><button onClick={onLogout}><X size={17}/><span>Log out</span></button></div>
      <button className="profile-chip" onClick={()=>openProfile(ownProfile.display_name)}><img className="avatar" src={ownProfile.avatar_url||"https://i.pravatar.cc/240?img=12"} alt="Alex profile"/><div><strong>{ownProfile.display_name}</strong><span>View profile</span></div><ChevronRight size={17}/></button>
    </aside>
    <main>
      {active !== "My Library" && active !== "Profile" && <header className="topbar">
        <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu/></button>
        <div><p className="eyebrow">Saturday, 29 August</p><h1>{active === "Home" ? "Good evening, Alex." : active}</h1></div>
        {active !== "Home" && active !== "Book Club" && <button className="primary"><Plus size={18}/> {pageContent[active].action}</button>}
      </header>}
      {active === "Profile" ? <ProfilePage name={profileName} isOwn={profileName === ownProfile.display_name} ownProfile={ownProfile} onOpenProfile={openProfile} onProfileSaved={profile=>{setOwnProfile(profile);setProfileName(profile.display_name);}}/> : active === "My Library" ? <LibraryPage/> : active === "Home" ? <>
      <section className="reading-hero">
        <div className="book-cover" aria-label="The Left Hand of Darkness book cover"><span>Ursula K. Le Guin</span><strong>The Left Hand<br/>of Darkness</strong><small>A Novel</small></div>
        <div className="book-details"><p className="eyebrow accent">Currently reading</p><h2>The Left Hand of Darkness</h2><p>Ursula K. Le Guin</p>
          <div className="progress-label"><span>Page 184 of 304</span><strong>61%</strong></div><div className="progress"><span style={{width:"61%"}}/></div>
          <div className="reading-meta"><span><Clock3 size={16}/> 4h 12m read</span><span><Sparkles size={16}/> Normal pace</span></div>
        </div><button className="session-button"><BookOpen size={19}/> Continue reading</button>
      </section>
      <section className="stats-grid goal-only" aria-label="Yearly reading goal">
        <Stat icon={<Goal/>} tone="blue" label="Yearly goal" value="31 / 40" note="78% complete"/>
      </section>
      <div className="content-grid">
        <section className="panel chart-panel"><PanelHeading eyebrow="Reading rhythm" title="Monthly pages" action="View statistics"/><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyPages} margin={{top:10,right:8,left:8,bottom:0}}><defs><linearGradient id="pages" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#55735b" stopOpacity={.35}/><stop offset="1" stopColor="#55735b" stopOpacity={.02}/></linearGradient></defs><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#7d7b73",fontSize:12}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e3dfd4"}}/><Area type="monotone" dataKey="pages" stroke="#55735b" strokeWidth={3} fill="url(#pages)"/></AreaChart></ResponsiveContainer></div></section>
        <section className="panel activity-panel"><PanelHeading eyebrow="Your circle" title="Friends activity" action="See all"/>
          <Activity initial="M" tone="rose"><strong>Michaela</strong> read 42 pages of <em>Atomic Habits</em><small>26 min ago</small></Activity>
          <Activity initial="T" tone="teal"><strong>Tom</strong> finished <em>Project Hail Mary</em> · 4.5/5<small>2 hours ago</small></Activity>
          <Activity initial="3" tone="amber"><strong>3 friends</strong> are reading <em>The Will to Change</em><small>Popular in your club</small></Activity>
        </section>
      </div>
      <section className="discover-section">
        <div className="discover-heading"><div><p className="eyebrow">Find your next read</p><h3>Picked for your shelf</h3><p>Suggestions shaped by your genres, ratings, and book-club circle.</p></div><button className="catalog-button"><Search size={17}/> Browse full catalog <ChevronRight size={16}/></button></div>
        <div className="recommendations">{recommendations.map((book) => {
          const isSaved = saved.includes(book.title);
          return <article className="book-card" key={book.title}>
            <div className="cover-wrap"><img src={book.cover} alt={`${book.title} cover`} loading="lazy"/><span>{book.match}</span></div>
            <p className="recommendation-reason">{book.reason}</p><h4>{book.title}</h4><p className="book-author">{book.author}</p>
            <button className={isSaved ? "save-button saved" : "save-button"} onClick={() => setSaved(isSaved ? saved.filter((title) => title !== book.title) : [...saved, book.title])}>{isSaved ? <Check size={16}/> : <Bookmark size={16}/>} {isSaved ? "Saved to library" : "Want to read"}</button>
          </article>;
        })}</div>
        <div className="genre-strip"><span><Compass size={17}/> Browse by mood</span>{["Quiet & reflective", "Big ideas", "Page-turners", "Book club friendly", "Under 300 pages"].map((genre) => <button key={genre}>{genre}</button>)}</div>
      </section>
      </> : <FeaturePage page={active} onOpenProfile={openProfile}/>} 
    </main>
    {inboxOpen&&<InboxModal onClose={()=>setInboxOpen(false)} onSelect={account=>{setInboxOpen(false);setActiveChat(account);}}/>}
    {activeChat&&<MessageModal username={activeChat.username} name={activeChat.display_name} avatar={activeChat.avatar_url||`https://i.pravatar.cc/160?u=${activeChat.username}`} onClose={()=>setActiveChat(null)}/>} 
  </div>;
}

function AuthPage({onAuthenticated}:{onAuthenticated:(user:SocialAccount)=>void}){
  const [mode,setMode]=useState<"login"|"register">("login");
  useEffect(()=>{document.body.dataset.authMode=mode;return()=>{delete document.body.dataset.authMode;}},[mode]);
  const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [agreed,setAgreed]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const submit=async(event:React.FormEvent)=>{event.preventDefault();if(mode==="register"&&password!==confirm){setError("Passwords do not match.");return;}if(mode==="register"&&!agreed){setError("Please accept the terms to create your account.");return;}setBusy(true);setError("");try{const response=await fetch(`${AUTH_API}/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="login"?{email,password}:{display_name:name,email,password})});const data=await response.json();if(!response.ok)throw new Error(data.detail||"Unable to continue.");localStorage.setItem("leaf-lore-session",data.token);onAuthenticated(data.user);}catch(reason){setError(reason instanceof Error?reason.message:"Unable to continue.");}finally{setBusy(false);}};
  return <main className="auth-page"><section className="auth-story"><div className="auth-brand"><span className="brand-mark">L</span><span>Leaf & Lore</span></div><div><p className="eyebrow accent">Every book takes you somewhere</p><h1>{mode==="login"?"Your reading life, all in one place.":"Create your reading story."}</h1><p>Track your library, discover thoughtful recommendations, and read together with people who love books.</p><div className="auth-benefits"><span><BookOpen/> Track your journey</span><span><Compass/> Discover more</span><span><Users/> Read together</span></div></div><blockquote>“So many books, so little time.”<cite>— Frank Zappa</cite></blockquote></section><section className="auth-panel"><form onSubmit={submit}><div className="auth-leaf">❧</div><p className="eyebrow">Leaf & Lore</p><h2>{mode==="login"?<>Welcome back,<br/><em>reader.</em></>:<>Create your<br/><em>account.</em></>}</h2><p>{mode==="login"?"Log in to your library":"Start your reading journey"}</p>{mode==="register"&&<label><span>Display name</span><input value={name} onChange={event=>setName(event.target.value)} required minLength={2} autoComplete="name" placeholder="Alex Morgan"/></label>}<label><span>Email address</span><input type="email" value={email} onChange={event=>setEmail(event.target.value)} required autoComplete="email" placeholder="reader@example.com"/></label><label><span>Password</span><input type="password" value={password} onChange={event=>setPassword(event.target.value)} required minLength={8} autoComplete={mode==="login"?"current-password":"new-password"} placeholder="At least 8 characters"/></label>{mode==="register"&&<><label><span>Confirm password</span><input type="password" value={confirm} onChange={event=>setConfirm(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Repeat your password"/></label><label className="auth-check"><input type="checkbox" checked={agreed} onChange={event=>setAgreed(event.target.checked)}/><span>I agree to the Terms and Privacy Policy</span></label></>}{error&&<p className="auth-error">{error}</p>}<button className="auth-submit" disabled={busy}>{busy?"Please wait…":mode==="login"?"Log in":"Create my account"}</button>{mode==="login"&&<small className="demo-login">Demo account: alex@example.com · reader123</small>}<div className="auth-switch">{mode==="login"?"New here?":"Already have an account?"}<button type="button" onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>{mode==="login"?"Create your account":"Log in"}</button></div></form></section></main>;
}

function Stat({icon,tone,label,value,note}:{icon:React.ReactNode;tone:string;label:string;value:string;note:string}) { return <article><span className={`stat-icon ${tone}`}>{icon}</span><p>{label}</p><strong>{value}</strong><small>{note}</small></article>; }
function PanelHeading({eyebrow,title,action}:{eyebrow:string;title:string;action:string}) { return <div className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div><button className="text-button">{action}<ChevronRight size={16}/></button></div>; }
function Activity({initial,tone,children}:{initial:string;tone:string;children:React.ReactNode}) { return <div className="activity"><span className={`mini-avatar ${tone}`}>{initial}</span><p>{children}</p></div>; }
function RatingDisplay({value}:{value:string|number}) { const rating=typeof value==="number"?value:Number.parseFloat(value);if(!Number.isFinite(rating))return <strong className="rating-display unrated">Not rated</strong>;const filled=Math.max(0,Math.min(5,Math.round(rating)));return <strong className="rating-display" aria-label={`${rating.toFixed(1)} out of 5 stars`}><span className="rating-stars">{[1,2,3,4,5].map(star=><Star className={star<=filled?"filled":"empty"} size={15} strokeWidth={2.2} fill={star<=filled?"currentColor":"none"} key={star}/>)}</span><em>{rating.toFixed(1)}</em></strong>; }

function LibraryPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState("All books");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [editing,setEditing]=useState<LibraryApiItem|null>(null);
  const [apiBooks, setApiBooks] = useState<LibraryApiItem[]>([]);
  const [libraryLoaded,setLibraryLoaded]=useState(false);
  const [dashboard,setDashboard]=useState<DashboardApi|null>(null);
  const loadLibrary = async()=>{try{const [libraryResponse,dashboardResponse]=await Promise.all([fetch("http://127.0.0.1:8000/api/library"),fetch("http://127.0.0.1:8000/api/dashboard")]);if(libraryResponse.ok){setApiBooks(await libraryResponse.json());setLibraryLoaded(true);}if(dashboardResponse.ok)setDashboard(await dashboardResponse.json());}catch{/* Keep the designed fallback shelves visible when the local API is offline. */}};
  useEffect(()=>{void loadLibrary();},[]);
  const want: ShelfBook[] = visualContent["My Library"].items;
  const reading: ShelfBook[] = visualContent["Reading"].items;
  const apiVisual=(status:LibraryApiItem["status"]):ShelfBook[]=>apiBooks.filter(item=>item.status===status).map(item=>({name:item.book.title,byline:item.book.author,badge:item.book.genre||status.replaceAll("_"," "),image:item.book.cover_url||undefined,source:item}));
  const userShelf=(primary:ShelfBook[],fallback:ShelfBook[])=>libraryLoaded?primary:fallback;
  const wantBooks=userShelf(apiVisual("want_to_read"),want);
  const readingBooks=userShelf(apiVisual("reading"),reading);
  const droppedMerged=userShelf(apiVisual("dropped"),droppedBooks);
  const apiFinished:FinishedBookCard[]=apiBooks.filter(item=>item.status==="finished").map(item=>({name:item.book.title,author:item.book.author,finished:item.finish_date?`Finished ${new Date(item.finish_date).toLocaleDateString("en",{day:"numeric",month:"short"})}`:"Finished",rating:item.rating?`${item.rating.toFixed(1)} ★`:"—",notes:item.notes,image:item.book.cover_url||"https://covers.openlibrary.org/b/id/0-L.jpg",source:item}));
  const finishedMerged:FinishedBookCard[]=libraryLoaded?apiFinished:finishedBooks.map(book=>({...book,notes:null}));
  const matches = (name:string, byline:string) => `${name} ${byline}`.toLowerCase().includes(query.toLowerCase());
  const filteredWant = wantBooks.filter((book)=>matches(book.name,book.byline));
  const filteredReading = readingBooks.filter((book)=>matches(book.name,book.byline));
  const filteredFinished = finishedMerged.filter((book)=>matches(book.name,book.author));
  const filteredDropped = droppedMerged.filter((book)=>matches(book.name,book.byline));
  const formatMinutes=(minutes:number)=>`${Math.floor(minutes/60)}h ${minutes%60}m`;
  const summaryMetrics = dashboard ? [
    [String(dashboard.total_books),"Total books","In your library",BookOpen],
    [String(dashboard.books_finished),"Finished","Completed books",Check],
    [formatMinutes(dashboard.reading_minutes),"Reading time",dashboard.estimated_unlogged_pages?`Estimated from your ${dashboard.average_minutes_per_page} min/page pace`:`Across ${dashboard.session_count} sessions`,Clock3],
    [dashboard.pages_read.toLocaleString(),"Pages read",dashboard.partial_book_pages?"Finished books + logged progress":"From finished books",BarChart3],
    [dashboard.average_rating?.toFixed(1)??"—","Average rating",dashboard.rated_books?`Based on ${dashboard.rated_books} books`:"No ratings yet",Star],
  ] : [["—","Total books","Loading…",BookOpen],["—","Finished","Loading…",Check],["—","Reading time","Loading…",Clock3],["—","Pages read","Loading…",BarChart3],["—","Average rating","Loading…",Star]];
  return <section className="library-page">
    <header className="library-header"><div><h1>My Library</h1><p>Your books. Your journey.</p></div><div className="library-actions"><label><Search size={17}/><input aria-label="Search library" placeholder="Search books, authors, ISBN..." value={query} onChange={(event)=>setQuery(event.target.value)}/>{query && <button aria-label="Clear search" onClick={()=>setQuery("")}><X size={14}/></button>}</label><button className="library-import" onClick={() => setShowImport(true)}><Import size={18}/> Import books</button><button className="library-add" onClick={() => setShowAdd(true)}><Plus size={18}/> Add book</button></div></header>
    <div className="library-summary">{summaryMetrics.map(([value,label,note,Icon]) => { const MetricIcon = Icon as typeof BookOpen; return <article key={label as string}><MetricIcon size={20}/><div><strong>{value as string}</strong><span>{label as string}</span><small>{note as string}</small></div></article>; })}</div>
    <div className="library-toolbar"><div>{["All books","Want to read","Reading","Finished","Dropped"].map((item)=><button className={filter===item?"selected":""} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div><button className="sort-button">Recently added <ChevronRight size={15}/></button></div>
    {(filter==="All books"||filter==="Want to read") && <LibraryShelf title="Want to read" count={String(filteredWant.length)} subtitle="Books you're excited to read next." books={filteredWant} onEdit={setEditing}/>} 
    {(filter==="All books"||filter==="Reading") && <LibraryShelf title="Reading now" count={String(filteredReading.length)} subtitle="Books currently in progress." books={filteredReading} onEdit={setEditing}/>} 
    {(filter==="All books"||filter==="Finished") && <FinishedShelf books={filteredFinished} onEdit={setEditing}/>} 
    {(filter==="All books"||filter==="Dropped") && <LibraryShelf title="Dropped" count={String(filteredDropped.length)} subtitle="Books you decided not to continue." books={filteredDropped} onEdit={setEditing}/>} 
    {query && filteredWant.length+filteredReading.length+filteredFinished.length+filteredDropped.length===0 && <div className="library-empty"><Search/><h2>No books found</h2><p>Try another title or author.</p></div>}
    {notice && <div className="save-notice"><Check size={15}/>{notice}</div>}
    {showAdd && <AddBookModal onClose={()=>setShowAdd(false)} onAdded={async(title)=>{await loadLibrary();setNotice(`${title} was saved to your library`);setShowAdd(false);setTimeout(()=>setNotice(""),3000);}}/>} 
    {showImport&&<ImportLibraryModal onClose={()=>setShowImport(false)} onImported={async count=>{await loadLibrary();setShowImport(false);setNotice(`${count} book${count===1?"":"s"} imported into your library`);setTimeout(()=>setNotice(""),3500);}}/>}
    {editing&&<EditBookModal item={editing} onClose={()=>setEditing(null)} onSaved={async()=>{await loadLibrary();setEditing(null);setNotice("Book updated");setTimeout(()=>setNotice(""),2500);}}/>}
  </section>;
}

function LibraryShelf({title,count,subtitle,books,onEdit}:{title:string;count:string;subtitle:string;books:ShelfBook[];onEdit:(item:LibraryApiItem)=>void}) {
  return <section className="dark-shelf"><div className="dark-shelf-heading"><div><h2>{title} <span>{count}</span></h2><p>{subtitle}</p></div><button>View all <ChevronRight size={15}/></button></div><div className="dark-book-grid">{books.map(book=><article key={book.name}><div className="dark-cover"><img src={book.image} alt={`${book.name} cover`}/>{book.source&&<button aria-label={`Edit ${book.name}`} onClick={()=>onEdit(book.source!)}><Pencil size={14}/></button>}</div><h3>{book.name}</h3><p>{book.byline}</p><div><span className="dark-tag">{book.badge}</span></div></article>)}</div></section>;
}

function FinishedShelf({books,onEdit}:{books:FinishedBookCard[];onEdit:(item:LibraryApiItem)=>void}) {
  return <section className="dark-shelf"><div className="dark-shelf-heading"><div><h2>Finished this year <span>{books.length}</span></h2><p>Books you've completed in 2026.</p></div><button>View all <ChevronRight size={15}/></button></div><div className="dark-book-grid">{books.map(book=><article key={book.name}><div className="dark-cover"><img src={book.image} alt={`${book.name} cover`}/><span><Check size={12}/></span>{book.source&&<button className="edit-finished" aria-label={`Edit ${book.name}`} onClick={()=>onEdit(book.source!)}><Pencil size={14}/></button>}</div><h3>{book.name}</h3><p>{book.author}</p><div><RatingDisplay value={book.rating}/><small>{book.finished}</small>{book.notes&&<blockquote className="finished-note" title={book.notes}>“{book.notes}”</blockquote>}</div></article>)}</div></section>;
}

function EditBookModal({item,onClose,onSaved}:{item:LibraryApiItem;onClose:()=>void;onSaved:()=>void}) {
  const labels:Record<LibraryApiItem["status"],string>={want_to_read:"Want to read",reading:"Reading",finished:"Finished",dropped:"Dropped"};
  const [status,setStatus]=useState<LibraryApiItem["status"]>(item.status);
  const [rating,setRating]=useState(item.rating||0);
  const [notes,setNotes]=useState(item.notes||"");
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const save=async()=>{setSaving(true);setError("");try{const response=await fetch(`http://127.0.0.1:8000/api/library/${item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,rating:status==="finished"&&rating?rating:null,notes:notes.trim()||null})});if(!response.ok)throw new Error("Could not update this book");onSaved();}catch(error){setError(error instanceof Error?error.message:"Could not update this book");setSaving(false);}};
  return <div className="modal-backdrop" role="presentation"><section className="add-modal edit-book-modal" role="dialog" aria-modal="true" aria-label={`Edit ${item.book.title}`}><header><div><h2>Edit book</h2><p>Update where this book is in your reading journey.</p></div><button onClick={onClose} aria-label="Close"><X/></button></header><div className="edit-book-body"><div className="edit-book-title"><img src={item.book.cover_url||"https://covers.openlibrary.org/b/id/0-L.jpg"} alt={`${item.book.title} cover`}/><div><h3>{item.book.title}</h3><p>{item.book.author}</p><small>{item.book.page_count?`${item.book.page_count} pages`:"Page count unknown"}</small></div></div><h4>Status</h4><div className="status-grid">{(Object.keys(labels) as LibraryApiItem["status"][]).map(value=><button className={status===value?"active":""} onClick={()=>setStatus(value)} key={value}><Bookmark size={18}/>{labels[value]}</button>)}</div>{status==="finished"&&<div className="finished-review"><h4>Your rating (optional)</h4><div className="star-picker">{[1,2,3,4,5].map(star=><button className={star<=rating?"selected":""} onClick={()=>setRating(star)} aria-label={`${star} stars`} key={star}><Star size={23} fill={star<=rating?"currentColor":"none"}/></button>)}<span>{rating?`${rating}/5`:"Not rated"}</span></div></div>}<h4>Notes (optional)</h4><textarea value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Add a personal note..." maxLength={500}/><small className="note-count">{notes.length}/500</small></div><footer><button onClick={onClose}>Cancel</button><span className="save-error">{error}</span><button className="library-add" onClick={save} disabled={saving}><Check size={17}/>{saving?"Saving...":"Save changes"}</button></footer></section></div>;
}

function ImportLibraryModal({onClose,onImported}:{onClose:()=>void;onImported:(count:number)=>void}) {
  const [url,setUrl]=useState("");
  const [loading,setLoading]=useState(false);
  const [stage,setStage]=useState("Connecting to Goodreads…");
  const [error,setError]=useState("");
  const start=async()=>{if(!url.trim()){setError("Paste your public Goodreads profile or shelf link.");return;}setLoading(true);setError("");const stages=["Connecting to Goodreads…","Reading your public shelf…","Matching covers and page counts…","Adding books to your library…"];let index=0;const timer=window.setInterval(()=>{index=Math.min(index+1,stages.length-1);setStage(stages[index]);},1100);try{const response=await fetch("http://127.0.0.1:8000/api/library/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:url.trim()})});const data=await response.json();if(!response.ok)throw new Error(data.detail||"Could not import this shelf.");clearInterval(timer);setStage(`Done — ${data.imported} imported, ${data.skipped} already in your library.`);window.setTimeout(()=>onImported(data.imported),900);}catch(reason){clearInterval(timer);setError(reason instanceof Error?reason.message:"Could not import this shelf.");setLoading(false);}};
  return <div className="modal-backdrop import-backdrop"><section className="import-modal" role="dialog" aria-modal="true" aria-label="Import books"><header><div><p className="eyebrow">Bring your books with you</p><h2>Import your library</h2></div>{!loading&&<button onClick={onClose} aria-label="Close"><X/></button>}</header>{loading?<div className="import-loading"><div className="import-orbit"><BookOpen/><span/></div><h3>{stage}</h3><p>Large shelves can take a little while. Please keep this window open.</p><div className="import-progress"><i/></div></div>:<div className="import-form"><div className="import-source"><strong>Goodreads</strong><span>More services coming later</span></div><label><span>Public profile or shelf link</span><input value={url} onChange={event=>setUrl(event.target.value)} placeholder="https://www.goodreads.com/review/list/…" autoFocus/></label><p>We import the shelf in your link. A profile link imports the “Read” shelf by default. Existing books are safely skipped.</p>{error&&<p className="profile-save-error">{error}</p>}<footer><button onClick={onClose}>Cancel</button><button className="profile-save" onClick={start}><Import size={17}/> Start import</button></footer></div>}</section></div>;
}

function AddBookModal({onClose,onAdded}:{onClose:()=>void;onAdded:(title:string)=>void}) {
  const [status,setStatus]=useState("Want to read");
  const [rating,setRating]=useState(0);
  const [notes,setNotes]=useState("");
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState(addBookCatalog[0]);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [results,setResults]=useState(addBookCatalog);
  const [searching,setSearching]=useState(false);
  const [searchError,setSearchError]=useState("");
  useEffect(()=>{if(query.trim().length<2){setResults(addBookCatalog);setSearching(false);setSearchError("");return;}const controller=new AbortController();const timer=setTimeout(async()=>{setSearching(true);setSearchError("");try{const response=await fetch(`http://127.0.0.1:8000/api/books/search?q=${encodeURIComponent(query.trim())}`,{signal:controller.signal});if(!response.ok)throw new Error("Internet catalog unavailable");const data=await response.json() as Array<{title:string;author:string;isbn:string|null;cover_url:string|null;page_count:number|null;genre:string|null;first_publish_year:number|null;publisher:string|null;language:string|null;languages:string[];rating:number|null;description:string}>;const languageNames:Record<string,string>={eng:"English",slo:"Slovak",slk:"Slovak",cze:"Czech",ces:"Czech",ger:"German",deu:"German",fre:"French",fra:"French",spa:"Spanish",ita:"Italian",pol:"Polish",hun:"Hungarian",rus:"Russian",ukr:"Ukrainian",por:"Portuguese"};const mapped=data.map((book,index)=>({title:book.title,author:book.author,isbn:book.isbn||`OL-${index}-${book.title}`,cover:book.cover_url||"https://covers.openlibrary.org/b/id/0-L.jpg",genre:book.genre||"Uncategorized",year:String(book.first_publish_year||"Unknown"),pages:String(book.page_count||0),publisher:book.publisher||"Unknown",language:(book.languages||[book.language]).filter(Boolean).map(code=>languageNames[code!]||code!.toUpperCase()).slice(0,3).join(", ")||"Not specified",rating:String(book.rating||"—"),description:book.description}));setResults(mapped);if(mapped[0])setSelected(mapped[0]);}catch(fetchError){if(!controller.signal.aborted){setResults([]);setSearchError(fetchError instanceof Error?fetchError.message:"Search failed");}}finally{if(!controller.signal.aborted)setSearching(false);}},350);return()=>{clearTimeout(timer);controller.abort();};},[query]);
  const save=async()=>{setSaving(true);setError("");try{const response=await fetch("http://127.0.0.1:8000/api/library",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:selected.title,author:selected.author,isbn:selected.isbn.replaceAll("-",""),cover_url:selected.cover,page_count:Number(selected.pages),genre:selected.genre,status:status.toLowerCase().replaceAll(" ","_"),rating:status==="Finished"&&rating?rating:null,notes:notes.trim()||null})});if(!response.ok)throw new Error("Could not save the book");onAdded(selected.title);}catch(error){setError(error instanceof Error?error.message:"Could not save the book");setSaving(false);}};
  return <div className="modal-backdrop" role="presentation"><section className="add-modal" role="dialog" aria-modal="true" aria-label="Add a book"><header><div><h2>Add a book</h2><p>Search books in any language by title, author, or ISBN</p></div><button onClick={onClose} aria-label="Close"><X/></button></header><div className="modal-body"><div className="add-form"><div className="add-tabs"><button className="active">Search</button><button>Scan ISBN</button><button>Enter manually</button></div><label className="modal-search"><Search size={17}/><input placeholder="Search any book, author or ISBN..." value={query} onChange={event=>setQuery(event.target.value)} autoFocus/>{searching&&<span className="search-spinner"/>}{query&&<button onClick={()=>setQuery("")} aria-label="Clear"><X size={14}/></button>}</label><div className="search-results">{searching?<p>Searching the worldwide catalog…</p>:results.length?results.map(book=><button className={selected.isbn===book.isbn?"selected":""} key={`${book.isbn}-${book.title}`} onClick={()=>setSelected(book)}><img src={book.cover} alt=""/><span><strong>{book.title}</strong><small>{book.author} · {book.year} · {book.language}</small></span><ChevronRight size={15}/></button>):<p>{searchError||"No matching books. Try another title, author, or ISBN."}</p>}</div><h4>Add to</h4><div className="status-grid">{["Want to read","Reading","Finished","Dropped"].map(item=><button className={status===item?"active":""} onClick={()=>setStatus(item)} key={item}><Bookmark size={18}/>{item}</button>)}</div>{status==="Finished"&&<div className="finished-review"><h4>Your rating (optional)</h4><div className="star-picker" aria-label="Rate this book">{[1,2,3,4,5].map(star=><button className={star<=rating?"selected":""} onClick={()=>setRating(star)} aria-label={`${star} star${star===1?"":"s"}`} aria-pressed={star<=rating} key={star}><Star size={23} fill={star<=rating?"currentColor":"none"}/></button>)}<span>{rating?`${rating}/5`:"Not rated"}</span></div></div>}<h4>Notes (optional)</h4><textarea placeholder={status==="Finished"?"What did you think of this book?":"Add a personal note..."} value={notes} onChange={event=>setNotes(event.target.value)} maxLength={500}/><small className="note-count">{notes.length}/500</small></div><div className="book-preview"><div className="preview-top"><img src={selected.cover} alt={`${selected.title} cover`}/><div><h3>{selected.title}</h3><p>{selected.author}</p><strong>★★★★★ <em>{selected.rating}</em></strong><span>{selected.genre} · {selected.year} · {selected.pages||"?"} pages</span><p>{selected.description}</p></div></div><dl><div><dt>ISBN</dt><dd>{selected.isbn}</dd></div><div><dt>Publisher</dt><dd>{selected.publisher}</dd></div><div><dt>Language</dt><dd>{selected.language}</dd></div><div><dt>Page count</dt><dd>{selected.pages||"Unknown"}</dd></div><div><dt>Source</dt><dd>Open Library</dd></div></dl></div></div><footer><button onClick={onClose}>Cancel</button><span className="save-error">{error}</span><button className="library-add" onClick={save} disabled={saving}><Plus size={17}/> {saving?"Saving...":`Add ${selected.title}`}</button></footer></section></div>;
}

function ProfilePage({name,isOwn,ownProfile,onOpenProfile,onProfileSaved}:{name:string;isOwn:boolean;ownProfile:ProfileApi;onOpenProfile:(name:string)=>void;onProfileSaved:(profile:ProfileApi)=>void}) {
  const [tab,setTab]=useState("Overview");
  const [editingProfile,setEditingProfile]=useState(false);
  const [socialProfile,setSocialProfile]=useState<ProfileApi|null>(null);
  const [peopleList,setPeopleList]=useState<{title:string;accounts:SocialAccount[]}|null>(null);
  const [messaging,setMessaging]=useState(false);
  const [userLibrary,setUserLibrary]=useState<LibraryApiItem[]|null>(null);
  const [userDashboard,setUserDashboard]=useState<DashboardApi|null>(null);
  const [shared,setShared]=useState(false);
  const profileUsername=isOwn?ownProfile.username:name.split(" ")[0].toLowerCase();
  const loadSocialProfile=()=>fetch(`http://127.0.0.1:8001/api/profiles/${profileUsername}`).then(async response=>{if(response.ok)setSocialProfile(await response.json());}).catch(()=>{});
  useEffect(()=>{void loadSocialProfile();if(!isOwn)return;void Promise.all([fetch("http://127.0.0.1:8000/api/library"),fetch("http://127.0.0.1:8000/api/dashboard")]).then(async([libraryResponse,dashboardResponse])=>{if(libraryResponse.ok)setUserLibrary(await libraryResponse.json());if(dashboardResponse.ok)setUserDashboard(await dashboardResponse.json());}).catch(()=>{});},[isOwn,profileUsername]);
  const first=name.split(" ")[0];
  const avatar=isOwn?(ownProfile.avatar_url||"https://i.pravatar.cc/240?img=12"):`https://i.pravatar.cc/240?u=${encodeURIComponent(name)}`;
  const banner=isOwn&&ownProfile.banner_url?ownProfile.banner_url:"https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1600&q=80";
  const finished=userLibrary?.filter(item=>item.status==="finished")||[];
  const favorite=isOwn&&userLibrary?finished.filter(item=>item.book.cover_url).sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,5).map(item=>({name:item.book.title,image:item.book.cover_url!})):finishedBooks.slice(0,5);
  const current=isOwn&&userLibrary?userLibrary.find(item=>item.status==="reading"):null;
  const recent=isOwn&&userLibrary?finished[0]:null;
  const shelfCount=(status:LibraryApiItem["status"],fallback:number)=>isOwn&&userLibrary?userLibrary.filter(item=>item.status===status).length:fallback;
  const dnaSource=(isOwn?userLibrary:socialProfile?.books)||[];
  const dnaCounts=Object.entries(dnaSource.reduce<Record<string,number>>((counts,item)=>{const genre=item.book.genre||"Other";counts[genre]=(counts[genre]||0)+1;return counts;},{})).sort((a,b)=>b[1]-a[1]);
  const dnaBase=(dnaCounts.length?dnaCounts.slice(0,4):[["Literary Fiction",32],["Psychology",21],["Fantasy",18],["Non-fiction",10]]) as [string,number][];
  const dnaTotal=(dnaCounts.length?dnaCounts:dnaBase).reduce((sum,[,count])=>sum+count,0)||1;
  const dnaGenres=dnaBase.map(([genre,count])=>({genre,count,percent:Math.round(count/dnaTotal*100)}));
  const dnaColors=["#245a3c","#9c3325","#bc5a28","#594189"];
  let dnaCursor=0;const dnaGradient=`conic-gradient(${dnaGenres.map((item,index)=>{const start=dnaCursor;dnaCursor+=item.percent;return `${dnaColors[index]} ${start}% ${dnaCursor}%`;}).join(",")},#58756a ${dnaCursor}% 100%)`;
  const profileCounts=isOwn&&userDashboard?[[String(userDashboard.rated_books),"Ratings"],[userDashboard.average_rating?.toFixed(1)||"—","Avg rating"],["4","Years reading"],[String(socialProfile?.counts?.followers||0),"Followers"],[String(socialProfile?.counts?.following||0),"Following"]]:[["213","Ratings"],["4.6","Avg rating"],["4","Years reading"],[String(socialProfile?.counts?.followers||0),"Followers"],[String(socialProfile?.counts?.following||0),"Following"]];
  const toggleFollow=async()=>{const response=await fetch(`http://127.0.0.1:8001/api/profiles/${profileUsername}/follow`,{method:"POST"});if(response.ok)await loadSocialProfile();};
  const shareProfile=async()=>{const url=`${window.location.origin}/shared/${profileUsername}`;try{if(navigator.share)await navigator.share({title:`${isOwn?ownProfile.display_name:(socialProfile?.display_name||name)} on Leaf & Lore`,url});else await navigator.clipboard.writeText(url);setShared(true);setTimeout(()=>setShared(false),2500);}catch{/* The user can dismiss the native share sheet. */}};
  const formatProfileMinutes=(minutes:number)=>`${Math.floor(minutes/60)}h ${minutes%60}m`;
  return <section className="profile-page">
    <div className="profile-banner"><img src={banner} alt={`${name} profile banner`}/></div>
    <div className="profile-surface">
      <header className="profile-header"><img className="profile-avatar" src={isOwn?avatar:(socialProfile?.avatar_url||avatar)} alt={`${name} profile`}/><div className="profile-identity"><h1>{isOwn?ownProfile.display_name:(socialProfile?.display_name||name)} <span>❧</span></h1><p>@{profileUsername} · Bratislava, Slovakia</p><blockquote>“{isOwn?(ownProfile.tagline||ownProfile.bio||"So many books, so little time."):(socialProfile?.tagline||"Always looking for the next unforgettable book.")}”</blockquote></div><div className="profile-actions"><button onClick={shareProfile}><Share2 size={14}/> {shared?"Link copied":"Share"}</button>{isOwn?<button onClick={()=>setEditingProfile(true)}><Pencil size={14}/> Edit profile</button>:<><button className="follow" onClick={toggleFollow}>{socialProfile?.is_following?"Following":"Follow"}</button><button onClick={()=>setMessaging(true)}>Message</button></>}</div></header>
      <div className="profile-counts">{profileCounts.map(([value,label])=>label==="Followers"||label==="Following"?<button key={label} onClick={()=>setPeopleList({title:label,accounts:(label==="Followers"?socialProfile?.followers:socialProfile?.following)||[]})}><strong>{value}</strong><span>{label}</span></button>:<div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      <nav className="profile-tabs">{["Overview","Books","Activity","Highlights"].map(item=><button className={tab===item?"active":""} onClick={()=>setTab(item)} key={item}>{item}</button>)}</nav>
      {tab === "Overview" ? <div className="profile-grid"><div className="profile-main">
        <section className="profile-panel reading-dna-panel"><p className="panel-label">Reading DNA</p><div className="reading-dna"><div className="dna-ring" style={{background:dnaGradient}}><span>Top genre<strong>{dnaGenres[0].genre}</strong><small>{dnaGenres[0].percent}%</small></span></div><ul>{dnaGenres.map(item=><li key={item.genre}>{item.genre} <b>{item.percent}%</b></li>)}</ul></div></section>
        <section className="profile-panel"><p className="panel-label">{first}'s all-time stats</p><div className="all-stats">{(isOwn&&userDashboard?[[String(userDashboard.books_finished),"Books read"],[userDashboard.pages_read.toLocaleString(),"Pages read"],[formatProfileMinutes(userDashboard.reading_minutes),"Reading time"],[`${userDashboard.average_minutes_per_page} min/page`,"Average pace"],[userDashboard.average_rating?.toFixed(1)||"—","Average rating"]]:[["1,240","Books read"],["78,450","Pages read"],["2,154h","Reading time"],["286 WPM","Average speed"],["4.6","Average rating"]]).map(([v,l])=><div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div></section>
        <section className="profile-panel activity-card"><p className="panel-label">Recent activity</p><div><img src={avatar} alt=""/><span>{first} finished a book<small>{recent?.finish_date?new Date(recent.finish_date).toLocaleDateString():"Recently"}</small></span></div><article><img src={recent?.book.cover_url||"https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg"} alt="Recent finished book cover"/><div><h3>{recent?.book.title||"Project Hail Mary"}</h3><p>by {recent?.book.author||"Andy Weir"}</p>{recent?.rating?<RatingDisplay value={recent.rating}/>:<strong>Not rated</strong>}</div><blockquote>“{recent?.notes||"A recently completed book from this reader's library."}”</blockquote></article></section>
      </div><aside className="profile-side">
        <section className="profile-panel current-read"><p className="panel-label">{first}'s current read</p><div><img src={current?.book.cover_url||"https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg"} alt="Current book cover"/><div><h3>{current?.book.title||"The Left Hand of Darkness"}</h3><p>{current?.book.author||"Ursula K. Le Guin"}</p><div className="profile-progress"><span/></div><small>{current?`${current.book.page_count||"Unknown"} pages · In progress`:"Page 184 of 304 · 61%"}</small><button>Continue reading</button></div></div></section>
        <section className="profile-panel"><p className="panel-label">{first}'s favorite books</p><div className="favorite-row">{favorite.map(book=><img key={book.name} src={book.image} alt={`${book.name} cover`}/>)}</div></section>
        <section className="profile-panel"><p className="panel-label">{first}'s bookshelves</p><div className="bookshelf-counts"><span>Want to Read<strong>{shelfCount("want_to_read",24)}</strong></span><span>Currently Reading<strong>{shelfCount("reading",3)}</strong></span><span>Read<strong>{shelfCount("finished",81)}</strong></span><span>Dropped<strong>{shelfCount("dropped",2)}</strong></span></div></section>
        <section className="profile-panel"><p className="panel-label">{first}'s friends</p><div className="profile-friends">{["Michaela","Tom","Sara","Nina"].map((friend,i)=><div key={friend}><img src={`https://i.pravatar.cc/80?img=${i+20}`} alt=""/><span><strong>{friend}</strong><small>{156+i*28} books</small></span></div>)}</div></section>
      </aside></div> : <ProfileTabContent tab={tab} first={first} avatar={avatar} library={isOwn?userLibrary:null}/>} 
    </div>
    {editingProfile&&<EditProfileModal profile={ownProfile} onClose={()=>setEditingProfile(false)} onSaved={profile=>{onProfileSaved(profile);setEditingProfile(false);}}/>}
    {peopleList&&<PeopleListModal title={peopleList.title} accounts={peopleList.accounts} onClose={()=>setPeopleList(null)} onSelect={account=>{setPeopleList(null);onOpenProfile(account.display_name);}}/>} 
    {messaging&&<MessageModal username={profileUsername} name={socialProfile?.display_name||name} avatar={socialProfile?.avatar_url||avatar} onClose={()=>setMessaging(false)}/>} 
  </section>;
}

function EditProfileModal({profile,onClose,onSaved}:{profile:ProfileApi;onClose:()=>void;onSaved:(profile:ProfileApi)=>void}) {
  const [name,setName]=useState(profile.display_name);
  const [tagline,setTagline]=useState(profile.tagline||profile.bio||"");
  const [avatar,setAvatar]=useState(profile.avatar_url);
  const [banner,setBanner]=useState(profile.banner_url);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const loadImage=(file:File|null,kind:"avatar"|"banner")=>{if(!file)return;if(!file.type.startsWith("image/")){setError("Please choose an image file.");return;}if(file.size>5_000_000){setError("Please choose an image smaller than 5 MB.");return;}const reader=new FileReader();reader.onload=()=>{const value=String(reader.result);if(kind==="avatar")setAvatar(value);else setBanner(value);setError("");};reader.readAsDataURL(file);};
  const save=async()=>{if(!name.trim()){setError("Your display name is required.");return;}setSaving(true);setError("");try{const response=await fetch("http://127.0.0.1:8000/api/profiles/alex",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({display_name:name.trim(),bio:tagline.trim(),tagline:tagline.trim(),avatar_url:avatar,banner_url:banner})});if(!response.ok)throw new Error("Could not save your profile.");onSaved(await response.json());}catch(reason){setError(reason instanceof Error?reason.message:"Could not save your profile.");}finally{setSaving(false);}};
  return <div className="modal-backdrop profile-edit-backdrop"><section className="profile-edit-modal" role="dialog" aria-modal="true" aria-label="Edit profile"><header><div><p className="eyebrow">Your public profile</p><h2>Edit profile</h2></div><button onClick={onClose} aria-label="Close"><X/></button></header><div className="profile-edit-banner">{banner?<img src={banner} alt="Banner preview"/>:<span><ImagePlus/> Add a banner</span>}<label><ImagePlus size={16}/> Change banner<input type="file" accept="image/*" onChange={event=>loadImage(event.target.files?.[0]||null,"banner")}/></label></div><div className="profile-edit-body"><div className="profile-edit-avatar">{avatar?<img src={avatar} alt="Profile preview"/>:<span>AM</span>}<label><ImagePlus size={15}/> Change photo<input type="file" accept="image/*" onChange={event=>loadImage(event.target.files?.[0]||null,"avatar")}/></label></div><label className="profile-field"><span>Display name</span><input value={name} onChange={event=>setName(event.target.value)} maxLength={80}/></label><label className="profile-field profile-bio"><span>Profile description</span><textarea value={tagline} onChange={event=>setTagline(event.target.value)} maxLength={180} placeholder="Add a short line that appears beneath your profile details."/><small>{tagline.length}/180</small></label>{error&&<p className="profile-save-error">{error}</p>}</div><footer><button onClick={onClose}>Cancel</button><button className="profile-save" onClick={save} disabled={saving}>{saving?"Saving…":"Save profile"}</button></footer></section></div>;
}

function InboxModal({onClose,onSelect}:{onClose:()=>void;onSelect:(account:SocialAccount)=>void}) {
  const accounts:SocialAccount[]=socialReaders.slice(0,4).map(reader=>({username:reader.name.toLowerCase(),display_name:reader.name,avatar_url:reader.avatar}));
  return <div className="modal-backdrop social-modal-backdrop"><section className="people-modal inbox-modal" role="dialog" aria-modal="true" aria-label="Messages"><header><div><p className="eyebrow">Your conversations</p><h2>Messages</h2></div><button onClick={onClose} aria-label="Close"><X/></button></header><div>{accounts.map(account=><button onClick={()=>onSelect(account)} key={account.username}><img src={account.avatar_url||""} alt=""/><span><strong>{account.display_name}</strong><small>Open conversation</small></span><ChevronRight size={17}/></button>)}</div></section></div>;
}

function PeopleListModal({title,accounts,onClose,onSelect}:{title:string;accounts:SocialAccount[];onClose:()=>void;onSelect:(account:SocialAccount)=>void}) {
  return <div className="modal-backdrop social-modal-backdrop"><section className="people-modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button onClick={onClose} aria-label="Close"><X/></button></header><div>{accounts.length?accounts.slice(0,5).map(account=><button className="people-account" onClick={()=>onSelect(account)} key={account.username}><img src={account.avatar_url||`https://i.pravatar.cc/80?u=${account.username}`} alt=""/><span><strong>{account.display_name}</strong><small>@{account.username}</small></span><ChevronRight size={17}/></button>):<p className="social-empty">No accounts here yet.</p>}</div></section></div>;
}

type DirectMessageApi={id:number;body:string;sent_by_me:boolean;created_at:string};
function MessageModal({username,name,avatar,onClose}:{username:string;name:string;avatar:string;onClose:()=>void}) {
  const [messages,setMessages]=useState<DirectMessageApi[]>([]);
  const [draft,setDraft]=useState("");
  const [sending,setSending]=useState(false);
  const load=()=>fetch(`http://127.0.0.1:8001/api/messages/${username}`).then(async response=>{if(response.ok)setMessages(await response.json());}).catch(()=>{});
  useEffect(()=>{void load();},[username]);
  const send=async()=>{if(!draft.trim())return;setSending(true);const response=await fetch(`http://127.0.0.1:8001/api/messages/${username}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body:draft.trim()})});if(response.ok){setDraft("");await load();}setSending(false);};
  return <div className="modal-backdrop social-modal-backdrop"><section className="message-modal" role="dialog" aria-modal="true" aria-label={`Message ${name}`}><header><img src={avatar} alt=""/><div><h2>{name}</h2><small>@{username}</small></div><button onClick={onClose} aria-label="Close"><X/></button></header><div className="message-thread">{messages.length?messages.map(message=><article className={message.sent_by_me?"mine":"theirs"} key={message.id}><p>{message.body}</p><time>{new Date(message.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</time></article>):<p className="social-empty">Start your conversation with {name}.</p>}</div><footer><textarea value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void send();}}} maxLength={2000} placeholder="Write a message…"/><button onClick={send} disabled={sending||!draft.trim()}>Send</button></footer></section></div>;
}

function ProfileTabContent({tab,first,avatar,library}:{tab:string;first:string;avatar:string;library:LibraryApiItem[]|null}) {
  const [bookFilter,setBookFilter]=useState<"All"|"Read"|"Want to read">("All");
  const books=library?library.map(item=>({name:item.book.title,author:item.book.author,status:item.status,rating:item.rating,image:item.book.cover_url||"https://covers.openlibrary.org/b/id/0-L.jpg"})):[...finishedBooks.map(book=>({name:book.name,author:book.author,status:"finished" as const,rating:Number.parseFloat(book.rating),image:book.image})),...visualContent["My Library"].items.slice(0,4).map(book=>({name:book.name,author:book.byline,status:"want_to_read" as const,rating:null,image:book.image!}))];
  const visibleBooks=books.filter(book=>bookFilter==="All"||(bookFilter==="Read"?book.status==="finished":book.status==="want_to_read"));
  if(tab==="Books") return <section className="profile-tab-page"><div className="tab-page-heading"><div><h2>{first}'s books</h2><p>{visibleBooks.length} {bookFilter.toLowerCase()} books.</p></div><div className="profile-tab-filters">{(["All","Read","Want to read"] as const).map(filter=><button className={bookFilter===filter?"active":""} onClick={()=>setBookFilter(filter)} aria-pressed={bookFilter===filter} key={filter}>{filter}</button>)}</div></div><div className="profile-book-grid">{visibleBooks.map(book=><article key={book.name}><img src={book.image} alt={`${book.name} cover`}/><h3>{book.name}</h3><p>{book.author}</p>{book.status==="finished"?(book.rating!==null?<RatingDisplay value={book.rating}/>:<strong>Finished · Not rated</strong>):<strong>{book.status==="reading"?"Reading":book.status==="dropped"?"Dropped":"Want to read"}</strong>}</article>)}</div></section>;
  if(tab==="Activity") return <section className="profile-tab-page"><div className="tab-page-heading"><div><h2>Recent activity</h2><p>Reading updates from {first}.</p></div></div><div className="activity-timeline">{[["Finished Project Hail Mary","★★★★★ 4.8 · 2 hours ago"],["Read 42 pages of The Left Hand of Darkness","48 minutes · Yesterday"],["Added Piranesi to Want to Read","3 days ago"],["Reviewed Sea of Tranquility","★★★★☆ · 5 days ago"]].map(([title,meta],i)=><article key={title}><img src={i===0?avatar:books[i].image} alt=""/><div><h3>{title}</h3><p>{meta}</p></div></article>)}</div></section>;
  return <section className="profile-tab-page"><div className="tab-page-heading"><div><h2>Highlights</h2><p>Passages {first} wanted to remember.</p></div></div><div className="highlight-grid">{[["The Left Hand of Darkness","It is a terrible thing, this kindness that human beings do not lose."],["The Dispossessed","You cannot buy the revolution. You cannot make the revolution."],["Piranesi","The Beauty of the House is immeasurable; its Kindness infinite."]].map(([book,quote])=><blockquote key={book}>“{quote}”<cite>{book}</cite></blockquote>)}</div></section>;
}

function FeaturePage({page,onOpenProfile}:{page:string;onOpenProfile:(name:string)=>void}) {
  if(page === "Book Club") return <section className="book-club-tba"><BookHeart size={34}/><p className="eyebrow">Book Club</p><h2>TBA</h2></section>;
  const content = pageContent[page];
  if(page === "Friends") return <FriendsPage onOpenProfile={onOpenProfile}/>;
  if(page === "Leaderboard") return <LeaderboardPage onOpenProfile={onOpenProfile}/>;
  return <section className="feature-page">
    <div className="feature-intro"><p className="eyebrow accent">{content.eyebrow}</p><h2>{page}</h2><p>{content.intro}</p></div>
    <VisualGallery page={page}/>
    <div className="feature-metrics">{content.cards.map((card, index) => <article key={card.label}><span className={`feature-number tone-${index + 1}`}>{index + 1}</span><div><p>{card.label}</p><strong>{card.value}</strong><small>{card.note}</small></div></article>)}</div>
    <section className="feature-list"><div className="feature-list-heading"><div><p className="eyebrow">At a glance</p><h3>{content.title}</h3></div><button className="text-button">View all <ChevronRight size={16}/></button></div>
      {content.items.map((item) => <button className="feature-row" onClick={()=>page === "Friends" && onOpenProfile(item.name)} key={item.name}><span className="row-icon">{item.name.charAt(item.name.search(/[A-Za-z]/))}</span><span><strong>{item.name}</strong><small>{item.detail}</small></span><em>{item.meta}</em><ChevronRight size={17}/></button>)}
    </section>
  </section>;
}

function FriendsPage({onOpenProfile}:{onOpenProfile:(name:string)=>void}) {
  const popular=[
    {title:"Dune",author:"Frank Herbert",cover:"https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",friends:"4 friends read",rating:"4.7"},
    {title:"The Seven Husbands of Evelyn Hugo",author:"Taylor Jenkins Reid",cover:"https://covers.openlibrary.org/b/isbn/9781501161933-L.jpg",friends:"3 friends read",rating:"4.6"},
    {title:"1984",author:"George Orwell",cover:"https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",friends:"3 friends read",rating:"4.4"},
    {title:"A Man Called Ove",author:"Fredrik Backman",cover:"https://covers.openlibrary.org/b/isbn/9781476738024-L.jpg",friends:"2 friends read",rating:"4.3"},
  ];
  const reviews=[
    {friend:socialReaders[0],book:"Tomorrow, and Tomorrow, and Tomorrow",cover:"https://covers.openlibrary.org/b/isbn/9780593466490-L.jpg",quote:"A beautiful story about friendship, love, and the games that shape us.",when:"3 days ago"},
    {friend:socialReaders[1],book:"Sapiens",cover:"https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",quote:"Fascinating and thought-provoking. A must-read for everyone.",when:"5 days ago"},
    {friend:socialReaders[2],book:"Daisy Jones & The Six",cover:"https://covers.openlibrary.org/b/isbn/9781524798628-L.jpg",quote:"Couldn't put it down—the characters felt so real.",when:"1 week ago"},
  ];
  const allFriends=[...socialReaders,{name:"Sara",avatar:"https://i.pravatar.cc/160?img=25"},{name:"Joshua",avatar:"https://i.pravatar.cc/160?img=15"},{name:"Lindis",avatar:"https://i.pravatar.cc/160?img=44"},{name:"Bibiotta",avatar:"https://i.pravatar.cc/160?img=49"}];
  return <section className="feature-page social-page">
    <div className="friends-page-heading"><div><p className="eyebrow">Your reading community</p><h2>Friends</h2><p>See what your friends have been reading and discover your next favorite book.</p></div><button className="primary"><Users size={17}/> Find friends</button></div>
    <section className="friends-showcase"><div className="feature-list-heading"><div><h3>Recently finished by friends</h3><p>Books your friends have completed lately.</p></div><button className="text-button">View all activity <ChevronRight size={16}/></button></div>
      <div className="friend-recommendations">{socialReaders.map(friend=><article key={friend.name}>
        <button className="friend-identity" onClick={()=>onOpenProfile(friend.name)}><img src={friend.avatar} alt={`${friend.name} profile`}/><span><strong>{friend.name}</strong><small>Recently finished · View profile</small></span><ChevronRight size={16}/></button>
        <div className="friend-book"><img src={friend.finishedCover} alt={`${friend.finished} cover`}/><div><h4>{friend.finished}</h4><strong className="friend-rating">★★★★★ <em>{friend.rating}</em></strong><p>“{friend.recommendation}”</p></div></div>
      </article>)}</div>
    </section>
    <div className="friends-insights"><section className="friends-showcase popular-circle"><div className="feature-list-heading"><div><h3>Popular in your circle</h3><p>Books that multiple friends have read and loved.</p></div><button className="text-button">View all <ChevronRight size={16}/></button></div><div className="popular-books">{popular.map(book=><article key={book.title}><img src={book.cover} alt={`${book.title} cover`}/><h4>{book.title}</h4><p>{book.author}</p><small>{book.friends}</small><strong>★★★★★ <em>{book.rating}</em></strong></article>)}</div></section>
      <section className="friends-showcase reviews-panel"><div className="feature-list-heading"><div><h3>Friends' recent reviews</h3><p>What your friends thought about their latest reads.</p></div><button className="text-button">View all <ChevronRight size={16}/></button></div><div className="friend-reviews">{reviews.map(review=><article key={review.friend.name}><button onClick={()=>onOpenProfile(review.friend.name)}><img src={review.friend.avatar} alt=""/><span><strong>{review.friend.name}</strong><small>reviewed</small></span></button><img src={review.cover} alt={`${review.book} cover`}/><div><h4>{review.book}</h4><strong>★★★★★ 4.5</strong></div><blockquote>“{review.quote}”</blockquote><time>{review.when}</time></article>)}</div></section></div>
    <section className="friends-showcase all-friends"><div className="feature-list-heading"><div><h3>All your friends (12)</h3><p>Your reading community.</p></div><button className="text-button">View all <ChevronRight size={16}/></button></div><div>{allFriends.map((friend,index)=><button onClick={()=>onOpenProfile(friend.name)} key={friend.name}><img src={friend.avatar} alt=""/><span><strong>{friend.name}</strong><small>{32-index*2} books</small></span></button>)}<button className="more-friends"><span>+4</span><small>more</small></button></div></section>
  </section>;
}

function LeaderboardPage({onOpenProfile}:{onOpenProfile:(name:string)=>void}) {
  const [readers,setReaders]=useState<Array<{name:string;username?:string;avatar:string;pages:number;books:number;time:string;last:string}>>(leaderboardReaders);
  useEffect(()=>{void fetch(`${AUTH_API}/api/leaderboard?period=all_time`).then(async response=>{if(!response.ok)return;const data=await response.json() as {entries:Array<{name:string;username:string;avatar_url:string|null;pages:number;books:number;minutes:number;last:string}>};setReaders(data.entries.map((reader,index)=>({name:reader.name,username:reader.username,avatar:reader.avatar_url||`https://i.pravatar.cc/160?img=${20+index}`,pages:reader.pages,books:reader.books,time:`${Math.floor(reader.minutes/60).toLocaleString()}h ${String(reader.minutes%60).padStart(2,"0")}m`,last:reader.last})));}).catch(()=>{});},[]);
  const max=readers[0]?.books||1;
  const podium=readers.length>=3?[readers[1],readers[0],readers[2]]:readers;
  const leader=readers[0];
  return <section className="feature-page leaderboard-page">
    <div className="leaderboard-hero"><div><p className="eyebrow accent">All readers · All time</p><h2>Leaderboard</h2><p>A friendly books-finished ranking. Pages and reading time add context—there are no streaks here.</p></div><div className="period-switch"><button>This month</button><button>This year</button><button className="active">All time</button></div></div>
    <div className="feature-metrics">{[["Top reader",leader?.name||"—","All-time standings"],["Books finished",String(leader?.books||0),"By the current leader"],["Pages read",(leader?.pages||0).toLocaleString(),"From finished books"]].map(([label,value,note],index)=><article key={label}><span className={`feature-number tone-${index+1}`}>{index+1}</span><div><p>{label}</p><strong>{value}</strong><small>{note}</small></div></article>)}</div>
    <section className="podium-panel"><div className="podium-title"><div><p className="eyebrow">All-time standings</p><h3>Books finished</h3></div><span><Medal size={17}/> Read at your own pace</span></div><div className="podium">{podium.map((reader,index)=>{const rank=podium.length>=3?(index===0?2:index===1?1:3):index+1;return <button className={`podium-person place-${rank}`} key={reader.name} onClick={()=>onOpenProfile(reader.username||reader.name)}><div className="podium-avatar"><img src={reader.avatar} alt={`${reader.name} profile`}/><span>{rank}</span></div><strong>{reader.name}</strong><small>{reader.books} books finished</small><div><b>{reader.pages.toLocaleString()} pages</b><b>{reader.time}</b></div></button>})}</div></section>
    <section className="leaderboard-table"><header><div><p className="eyebrow">All readers</p><h3>Full standings</h3></div><span>Ranked by books finished</span></header>{readers.map((reader,index)=><button key={reader.username||reader.name} onClick={()=>onOpenProfile(reader.username||reader.name)}><b className={`leader-rank rank-${index+1}`}>{index+1}</b><img src={reader.avatar} alt=""/><span className="leader-name"><strong>{reader.name}</strong><small>Recently finished {reader.last}</small></span><span className="leader-bar"><i style={{width:`${reader.books/max*100}%`}}/></span><strong className="leader-pages">{reader.books} books</strong><span className="leader-context">{reader.pages.toLocaleString()} pages · {reader.time}</span><ChevronRight size={17}/></button>)}</section>
  </section>;
}

function VisualGallery({page}:{page:string}) {
  const visual = visualContent[page];
  const isLibrary = page === "My Library";
  return <section className={`visual-section visual-${page.toLowerCase().replace(" ", "-")}`}>
    <div className="visual-heading"><div><p className="eyebrow">{isLibrary ? "Your next reads" : "Visual overview"}</p><h3>{visual.title}</h3><p>{visual.subtitle}</p></div>{isLibrary && <div className="shelf-tabs"><button className="selected">Want to read</button><button>Reading</button><button>Finished</button></div>}</div>
    <div className={isLibrary ? "visual-cards visual-cards-library" : "visual-cards"}>{visual.items.map((item) => <article className={item.image ? "visual-card with-cover" : "visual-card no-cover"} key={item.name}>
      {item.image ? <div className="visual-cover"><img src={item.image} alt={`${item.name} cover`} loading="lazy"/>{item.progress !== undefined && <span className="cover-progress">{item.progress}%</span>}</div> : <div className="visual-rank">{page === "Leaderboard" ? `#${item.badge}` : item.name.charAt(0)}</div>}
      <div className="visual-card-copy"><h4>{item.name}</h4><p>{item.byline}</p>{item.progress !== undefined && <div className="mini-progress"><span style={{width:`${item.progress}%`}}/></div>}<span className="visual-badge">{item.badge}</span></div>
    </article>)}</div>
    {isLibrary && <div className="finished-shelf"><div className="finished-heading"><div><p className="eyebrow">Reading history</p><h3>Finished this year</h3><p>31 books completed · newest first</p></div><button className="text-button">See all 31 <ChevronRight size={16}/></button></div>
      <div className="finished-books">{finishedBooks.map((book) => <article className="finished-book" key={book.name}><div className="finished-cover"><img src={book.image} alt={`${book.name} cover`} loading="lazy"/><span><Check size={12}/></span></div><h4>{book.name}</h4><p>{book.author}</p><div><small>{book.finished}</small><strong>{book.rating}</strong></div></article>)}</div>
    </div>}
  </section>;
}
