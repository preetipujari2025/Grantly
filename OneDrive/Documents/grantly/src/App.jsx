import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownUp, ArrowRight, ArrowUpRight, Bell, Bookmark, BookOpenCheck,
  CalendarDays, CalendarClock, Check, CheckCircle2, ChevronDown, Clock3,
  CircleHelp, FileText, Filter, GraduationCap, LayoutDashboard,
  Menu, MoreHorizontal, Search, Settings, SlidersHorizontal, Sparkles, Target,
  UserRound, X, ClipboardList, AlertCircle
} from 'lucide-react';
import {
  DeadlineRow,
  EmptyState,
  Field,
  PageIntro,
  ScholarshipCard,
  ScholarshipRow,
  StatCard,
  StatusBadge
} from './components/ScholarshipComponents.jsx';
import {
  addTrackedApplication,
  applicationStatuses,
  daysLeft,
  evaluateScholarship,
  filterScholarships,
  formatDate,
  initialApps,
  initialProfile,
  money,
  normalizeApplications,
  normalizeProfile,
  normalizeSavedScholarships,
  normalizeStatus,
  rankScholarships,
  scholarships,
  updateApplicationStatus,
  upcomingScholarships
} from './domain/scholarships.ts';

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'Dashboard', icon: LayoutDashboard },
      { id: 'Discover', icon: Search },
      { id: 'Smart Matcher', icon: Sparkles }
    ]
  },
  {
    title: 'MY SPACE',
    items: [
      { id: 'My Applications', icon: ClipboardList },
      { id: 'Saved Scholarships', icon: Bookmark },
      { id: 'Deadlines', icon: CalendarDays }
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { id: 'My Profile', icon: UserRound },
      { id: 'Settings', icon: Settings }
    ]
  }
];

const storage = {
  read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error(`Unable to read ${key} from local storage.`, error);
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Unable to save ${key} to local storage.`, error);
      return false;
    }
  }
};

const localDateISO = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const [page, setPage] = useState('Dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('Recommended');
  const [minimumAmount, setMinimumAmount] = useState('0');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [saved, setSaved] = useState(() => normalizeSavedScholarships(storage.read('grantly_saved', [3])));
  const [apps, setApps] = useState(() => normalizeApplications(storage.read('grantly_apps', initialApps)));
  const [profile, setProfile] = useState(() => normalizeProfile(storage.read('grantly_profile', initialProfile)));
  const [explored, setExplored] = useState(() => {
    const value = storage.read('grantly_explored', []);
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => Number.isSafeInteger(id) && scholarships.some((scholarship) => scholarship.id === id)))]
      : [];
  });
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [matcherDone, setMatcherDone] = useState(false);
  const [matcherLoading, setMatcherLoading] = useState(false);
  const [matcherErrors, setMatcherErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [appQuery, setAppQuery] = useState('');
  const [today, setToday] = useState(() => new Date());
  const modalRef = useRef(null);
  const notificationRef = useRef(null);
  const matcherTimer = useRef(null);
  const toastTimer = useRef(null);
  const reducedMotion = useReducedMotion();
  const deadlines = useMemo(() => upcomingScholarships(today), [today]);
  const rankedScholarships = useMemo(() => rankScholarships(profile), [profile]);
  const matches = rankedScholarships.filter(({ match }) => match.eligible);
  const filteredScholarships = useMemo(() => filterScholarships(profile, {
    query,
    category,
    minimumAmount,
    eligibility: eligibilityFilter,
    sort
  }), [category, eligibilityFilter, minimumAmount, profile, query, sort]);
  const progressCount = apps.filter((application) => !['Saved', 'Draft'].includes(application.status)).length;
  const progressPercent = apps.length ? Math.round((progressCount / apps.length) * 100) : 0;
  const urgentDeadlines = deadlines.filter((scholarship) => daysLeft(scholarship.deadline, today) <= 14);
  const progressSegments = useMemo(() => {
    const segments = applicationStatuses.map((status) => {
      const count = apps.filter((application) => application.status === status).length;
      const length = apps.length ? (258 * count) / apps.length : 0;
      return { status, length };
    });
    return segments.map((segment, index) => ({
      ...segment,
      offset: segments.slice(0, index).reduce((total, previous) => total + previous.length, 0)
    }));
  }, [apps]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  };
  const persistSaved = (next) => {
    setSaved(next);
    if (!storage.write('grantly_saved', next)) notify('Could not save your changes in this browser.');
  };
  const persistApps = (next) => {
    setApps(next);
    if (!storage.write('grantly_apps', next)) notify('Could not save your changes in this browser.');
  };
  const persistProfile = (next) => {
    setProfile(next);
    if (!storage.write('grantly_profile', next)) notify('Could not save your changes in this browser.');
  };
  const openScholarship = (scholarship) => {
    setNotificationOpen(false);
    setHelpOpen(false);
    setSelected(scholarship);
    if (explored.includes(scholarship.id)) return;
    const next = [...explored, scholarship.id];
    setExplored(next);
    if (!storage.write('grantly_explored', next)) notify('Could not save your explored scholarships in this browser.');
  };
  const updateProfile = (changes) => {
    window.clearTimeout(matcherTimer.current);
    setMatcherLoading(false);
    setMatcherDone(false);
    persistProfile(normalizeProfile({ ...profile, ...changes }));
  };
  const findMatches = () => {
    const marksValue = String(profile.marks ?? '');
    const incomeValue = String(profile.income ?? '');
    const marks = marksValue.trim() === '' ? Number.NaN : Number(marksValue);
    const income = incomeValue.trim() === '' ? Number.NaN : Number(incomeValue);
    const errors = {};
    if (!Number.isFinite(marks) || marks < 0 || marks > 100) errors.marks = 'Enter an academic percentage from 0 to 100.';
    if (!Number.isFinite(income) || income < 0) errors.income = 'Enter a valid non-negative annual income.';
    if (!profile.course) errors.course = 'Choose a course.';
    if (!profile.year) errors.year = 'Choose your year of study.';
    if (!profile.state) errors.state = 'Choose a state.';
    if (!profile.category) errors.category = 'Choose a student category.';
    setMatcherErrors(errors);
    if (Object.keys(errors).length) {
      setMatcherDone(false);
      setMatcherLoading(false);
      return;
    }
    window.clearTimeout(matcherTimer.current);
    setMatcherLoading(true);
    matcherTimer.current = window.setTimeout(() => {
      setMatcherDone(true);
      setMatcherLoading(false);
      notify('Your sample matches are ready');
    }, reducedMotion ? 0 : 350);
  };
  const toggleSaved = (id) => {
    const isSaved = saved.includes(id);
    persistSaved(isSaved ? saved.filter((savedId) => savedId !== id) : [...saved, id]);
    notify(isSaved ? 'Removed from saved scholarships' : 'Scholarship saved to your list');
  };
  const updateStatus = (applicationId, status) => {
    const nextStatus = normalizeStatus(status);
    if (!nextStatus || apps.find((application) => application.id === applicationId)?.status === nextStatus) return;
    persistApps(updateApplicationStatus(apps, applicationId, nextStatus, localDateISO()));
    notify('Application status updated');
  };
  const trackScholarship = (scholarship) => {
    const next = addTrackedApplication(apps, scholarship.id, localDateISO());
    if (!next) {
      notify('This scholarship is already in your application tracker');
      return;
    }
    persistApps(next);
    setSelected(null);
    notify('Added to your tracker as Saved. Update the status after applying with the provider.');
  };
  const go = (nextPage) => {
    setPage(nextPage);
    setMobileOpen(false);
    setNotificationOpen(false);
    setQuery('');
    setAppQuery('');
  };
  const openFilteredApplications = (status) => {
    setStatusFilter(status);
    go('My Applications');
  };
  const resetWorkspace = () => {
    if (!window.confirm('Reset your saved scholarships, applications, profile, and explored history?')) return;
    let cleared = true;
    for (const key of ['grantly_saved', 'grantly_apps', 'grantly_profile', 'grantly_explored']) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Unable to reset ${key}.`, error);
        cleared = false;
      }
    }
    if (!cleared) {
      notify('Some demo data could not be removed from this browser.');
      return;
    }
    setSaved([3]);
    setApps(initialApps);
    setProfile(initialProfile);
    setExplored([]);
    notify('Demo workspace restored');
  };

  useEffect(() => {
    if (!selected && !helpOpen) return undefined;
    const previousFocus = document.activeElement;
    const focusFrame = window.requestAnimationFrame(() => modalRef.current?.querySelector('button')?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
        setHelpOpen(false);
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusable = [...modalRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [helpOpen, selected]);

  useEffect(() => () => {
    window.clearTimeout(matcherTimer.current);
    window.clearTimeout(toastTimer.current);
  }, []);
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = window.setTimeout(() => setToday(new Date()), midnight.getTime() - now.getTime());
    return () => window.clearTimeout(timer);
  }, [today]);
  useEffect(() => {
    if (!notificationOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setNotificationOpen(false);
        notificationRef.current?.querySelector('button')?.focus();
      }
    };
    window.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationOpen]);

  const renderDashboard = () => (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" />YOUR PERSONAL SPACE</div>
          <h1>Good morning, {profile.name || 'there'} <span className="wave">✳</span></h1>
          <p>Here's what's happening with your scholarship journey today.</p>
        </div>
        <button className="primary-btn" onClick={() => go('Discover')}><Search size={16} />Explore scholarships<ArrowRight size={16} /></button>
      </div>

      <section className="hero-banner">
        <div className="hero-glow" />
        <div className="hero-copy">
          <div className="hero-chip"><Sparkles size={13} />YOUR NEXT CHAPTER STARTS HERE</div>
          <h2>Big dreams.<br /><em>Real opportunities.</em></h2>
          <p>Discover funding that moves you closer to the future you're working for.</p>
          <button className="hero-btn" onClick={() => go('Smart Matcher')}>Find my matches <ArrowRight size={16} /></button>
        </div>
        <motion.div
          className="hero-art"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.88, rotateY: -14, y: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 12}px`);
            event.currentTarget.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 12}px`);
          }}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty('--pointer-x', '0px');
            event.currentTarget.style.setProperty('--pointer-y', '0px');
          }}
        >
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-spark spark-a">✦</div><div className="hero-spark spark-b">✧</div>
          <motion.div className="hero-document" animate={reducedMotion ? undefined : { y: [0, -7, 0], rotate: [5, 7, 5] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="doc-cap"><GraduationCap size={25} /></div>
            <div className="doc-seal">GRANTLY<br /><span>AWARD</span></div>
            <div className="doc-line wide" /><div className="doc-line" /><div className="doc-line short" />
            <div className="doc-stamp"><Check size={17} /></div>
          </motion.div>
          <motion.div className="floating-coin coin-one" animate={reducedMotion ? undefined : { y: [0, -11, 0], rotateY: [0, 180, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>₹</motion.div>
          <motion.div className="floating-coin coin-two" animate={reducedMotion ? undefined : { y: [0, 8, 0], rotate: [0, 12, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}><Sparkles size={17} /></motion.div>
          <motion.div className="floating-coin coin-three" animate={reducedMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>₹</motion.div>
          <div className="hero-label"><span className="label-check"><Check size={12} /></span><span><b>Opportunity unlocked</b><small>Your future looks bright</small></span></div>
          <div className="hero-notification"><Bell size={13} /><span>New match found</span><i /></div>
        </motion.div>
        <div className="hero-decoration" />
      </section>

      <section className="stats-grid">
        <StatCard icon={Search} label="Scholarships explored" value={explored.length} note={`Of ${scholarships.length} demo opportunities`} tone="purple" />
        <StatCard icon={Target} label="Your matches" value={matches.length} note="Meet the sample criteria" tone="mint" />
        <StatCard icon={ClipboardList} label="Applications tracked" value={apps.length} note={`${apps.filter((application) => application.status === 'Under Review').length} under review`} tone="peach" />
        <StatCard icon={CalendarClock} label="Upcoming deadlines" value={deadlines.length} note="Open opportunities in this list" tone="blue" />
      </section>

      <div className="dashboard-grid">
        <section className="panel recommendations">
          <div className="panel-heading">
            <div><div className="eyebrow">PICKED FOR YOU</div><h3>Scholarships worth a look</h3><p>Illustrative opportunities to explore.</p></div>
            <button className="text-link" onClick={() => go('Discover')}>View all <ArrowUpRight size={15} /></button>
          </div>
          <div className="mini-scholarship-list">
            {rankedScholarships.slice(0, 3).map(({ scholarship }) => (
              <ScholarshipRow key={scholarship.id} scholarship={scholarship} profile={profile} saved={saved.includes(scholarship.id)} onSave={() => toggleSaved(scholarship.id)} onOpen={() => openScholarship(scholarship)} />
            ))}
          </div>
        </section>

        <section className="panel progress-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">YOUR ACTIVITY</div><h3>Application progress</h3><p>Keep your momentum going.</p></div>
            <button className="dots-btn" onClick={() => go('My Applications')} aria-label="View all applications"><MoreHorizontal size={19} /></button>
          </div>
          <div className="progress-summary">
            <div className="progress-ring">
              <svg viewBox="0 0 100 100" role="img" aria-label={`${progressPercent}% of applications submitted or beyond`}>
                <circle cx="50" cy="50" r="41" />
                {progressSegments.filter((segment) => segment.length > 0).map((segment) => (
                  <circle
                    className={`ring-value ${segment.status.toLowerCase().replace(/\s+/g, '-')}`}
                    cx="50"
                    cy="50"
                    r="41"
                    key={segment.status}
                    style={{
                      strokeDasharray: `${segment.length} ${258 - segment.length}`,
                      strokeDashoffset: -segment.offset
                    }}
                  />
                ))}
              </svg>
              <div><b>{progressPercent}%</b><small>progress</small></div>
            </div>
            <div className="progress-legend">
              {applicationStatuses.map((status) => (
                <button className="legend-row" key={status} onClick={() => openFilteredApplications(status)}>
                  <i className={`legend-dot ${status.toLowerCase().replace(/\s+/g, '-')}`} /><span>{status}</span><b>{apps.filter((application) => application.status === status).length}</b>
                </button>
              ))}
            </div>
          </div>
          <button className="progress-footer" onClick={() => go('My Applications')}>View application tracker <ArrowRight size={14} /></button>
        </section>

        <section className="panel deadline-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">DON'T MISS OUT</div><h3>Coming up next</h3></div>
            <button className="text-link" onClick={() => go('Deadlines')}>See calendar <ArrowUpRight size={15} /></button>
          </div>
          <div className="deadline-list">
            {deadlines.map((scholarship) => <DeadlineRow key={scholarship.id} scholarship={scholarship} onOpen={() => openScholarship(scholarship)} compact />)}
            {deadlines.length === 0 && <p className="inline-empty">No upcoming deadlines in the sample list.</p>}
          </div>
        </section>
      </div>
    </>
  );

  const renderDiscover = () => (
    <>
      <PageIntro eyebrow="EXPLORE WHAT'S POSSIBLE" title="Find your next opportunity" subtitle="A world of possibilities, all in one place. Find the funding that fits your journey." />
      <div className="filter-bar">
        <label className="search-field"><Search size={17} /><input aria-label="Search scholarships, providers or keywords" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search scholarships, providers or keywords..." /></label>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>All categories</option><option>Merit-based</option><option>Need-based</option><option>Women in STEM</option><option>State scholarship</option>
        </select>
        <select aria-label="Minimum scholarship amount" value={minimumAmount} onChange={(event) => setMinimumAmount(event.target.value)}>
          <option value="0">Any amount</option><option value="30000">₹30,000+</option><option value="50000">₹50,000+</option><option value="75000">₹75,000+</option><option value="100000">₹1,00,000+</option>
        </select>
        <select aria-label="Filter by eligibility" value={eligibilityFilter} onChange={(event) => setEligibilityFilter(event.target.value)}>
          <option value="all">Any match</option><option value="eligible">Meets all criteria</option><option value="strong">Strong match (80%+)</option>
        </select>
        <label className="sort-select"><ArrowDownUp size={15} /><select aria-label="Sort scholarships" value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Deadline: soonest</option><option>Amount: high to low</option><option>Amount: low to high</option></select></label>
        <button className="filter-button" onClick={() => { setCategory('All categories'); setSort('Recommended'); setQuery(''); setMinimumAmount('0'); setEligibilityFilter('all'); }}><Filter size={16} />Clear filters</button>
      </div>
      <div className="results-meta"><span><b>{filteredScholarships.length}</b> demo opportunities</span><span><SlidersHorizontal size={14} />Based on the sample catalog</span></div>
      <div className="scholarship-grid">
        {filteredScholarships.map((scholarship) => (
          <ScholarshipCard key={scholarship.id} scholarship={scholarship} profile={profile} saved={saved.includes(scholarship.id)} onSave={() => toggleSaved(scholarship.id)} onOpen={() => openScholarship(scholarship)} />
        ))}
      </div>
      {filteredScholarships.length === 0 && <EmptyState icon={Search} title="No scholarships found" text="Try another keyword or clear your filters." action={() => { setQuery(''); setCategory('All categories'); setMinimumAmount('0'); setEligibilityFilter('all'); setSort('Recommended'); }} />}
      <p className="demo-disclaimer"><AlertCircle size={14} />All opportunities, award amounts and criteria are illustrative demo data. Verify details with the official provider.</p>
    </>
  );

  const renderMatcher = () => {
    const averageScore = rankedScholarships.length ? Math.round(rankedScholarships.reduce((sum, item) => sum + item.match.score, 0) / rankedScholarships.length) : 0;
    return (
      <>
        <PageIntro eyebrow="A LITTLE MAGIC, A LOT OF CLARITY" title="Your scholarship matchmaker" subtitle="Tell us a little about yourself. We'll highlight opportunities that fit your profile." />
        <div className="matcher-layout">
          <section className="panel matcher-form">
            <div className="form-title"><div className="feature-icon"><Sparkles size={20} /></div><div><h3>Build your student profile</h3><p>Your details stay in this demo on this device.</p></div></div>
            <div className="form-grid">
              <Field label="Academic percentage"><input type="number" min="0" max="100" step="0.1" value={profile.marks} aria-invalid={Boolean(matcherErrors.marks)} aria-describedby={matcherErrors.marks ? 'marks-error' : undefined} onChange={(event) => { updateProfile({ marks: event.target.value }); setMatcherErrors((errors) => ({ ...errors, marks: '' })); }} />{matcherErrors.marks && <small className="field-error" id="marks-error">{matcherErrors.marks}</small>}</Field>
              <Field label="Annual family income (₹)"><input type="number" min="0" step="1000" value={profile.income} aria-invalid={Boolean(matcherErrors.income)} aria-describedby={matcherErrors.income ? 'income-error' : undefined} onChange={(event) => { updateProfile({ income: event.target.value }); setMatcherErrors((errors) => ({ ...errors, income: '' })); }} />{matcherErrors.income && <small className="field-error" id="income-error">{matcherErrors.income}</small>}</Field>
              <Field label="Course"><select value={profile.course} aria-invalid={Boolean(matcherErrors.course)} aria-describedby={matcherErrors.course ? 'course-error' : undefined} onChange={(event) => { updateProfile({ course: event.target.value }); setMatcherErrors((errors) => ({ ...errors, course: '' })); }}><option value="">Choose course</option><option>Engineering</option><option>Arts</option><option>Science</option><option>Commerce</option><option>Medicine</option><option>Law</option></select>{matcherErrors.course && <small className="field-error" id="course-error">{matcherErrors.course}</small>}</Field>
              <Field label="Year of study"><select value={profile.year} aria-invalid={Boolean(matcherErrors.year)} aria-describedby={matcherErrors.year ? 'year-error' : undefined} onChange={(event) => { updateProfile({ year: event.target.value }); setMatcherErrors((errors) => ({ ...errors, year: '' })); }}><option value="">Choose year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Postgraduate</option></select>{matcherErrors.year && <small className="field-error" id="year-error">{matcherErrors.year}</small>}</Field>
              <Field label="State"><select value={profile.state} aria-invalid={Boolean(matcherErrors.state)} aria-describedby={matcherErrors.state ? 'state-error' : undefined} onChange={(event) => { updateProfile({ state: event.target.value }); setMatcherErrors((errors) => ({ ...errors, state: '' })); }}><option value="">Choose state</option><option>Karnataka</option><option>Maharashtra</option><option>Tamil Nadu</option><option>Kerala</option><option>Delhi</option><option>Other</option></select>{matcherErrors.state && <small className="field-error" id="state-error">{matcherErrors.state}</small>}</Field>
              <Field label="Student category"><select value={profile.category} aria-invalid={Boolean(matcherErrors.category)} aria-describedby={matcherErrors.category ? 'category-error' : undefined} onChange={(event) => { updateProfile({ category: event.target.value }); setMatcherErrors((errors) => ({ ...errors, category: '' })); }}><option value="">Choose category</option><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select>{matcherErrors.category && <small className="field-error" id="category-error">{matcherErrors.category}</small>}</Field>
            </div>
            {Object.values(matcherErrors).some(Boolean) && <p className="validation-summary" role="alert">Check the highlighted fields before finding matches.</p>}
            <button className="primary-btn" onClick={findMatches} disabled={matcherLoading} aria-busy={matcherLoading}>{matcherLoading ? <><span className="loading-spinner" />Finding matches…</> : <><Sparkles size={16} />Find my scholarships<ArrowRight size={16} /></>}</button>
            <p className="fine-print"><AlertCircle size={13} />This uses simplified sample criteria and is not an official eligibility decision.</p>
          </section>
          <aside className="matcher-aside">
            <div className="matcher-art">
              <div className="matcher-orbit">✦</div><div className="matcher-big-icon"><Target size={42} /></div>
              <h3>Not just any scholarship.<br /><em>Your scholarship.</em></h3>
              <p>We'll compare your profile with the sample opportunities in GRANTLY.</p>
            </div>
            <div className="matcher-tip"><Sparkles size={17} /><span><b>Pro tip</b><small>Keep your academic details up to date for more relevant results.</small></span></div>
          </aside>
        </div>
        {matcherDone && (
          <section className="panel match-results">
            <div className="panel-heading">
              <div><div className="eyebrow">YOUR RESULTS</div><h3>{matches.length} sample-eligible scholarships</h3><p>{averageScore}% average profile alignment across the sample catalog. Near matches include missing criteria below.</p></div>
              <div className="score-orb" style={{ '--score': `${averageScore}%` }} role="img" aria-label={`${averageScore}% average profile match`}><strong>{averageScore}%</strong><small>average</small></div>
            </div>
            <div className="match-result-list">
              {rankedScholarships.map(({ scholarship, match }) => (
                <article className="match-result" key={scholarship.id}>
                  <div className={`org-logo ${scholarship.color}`}>{scholarship.logo}</div>
                  <div className="match-result-main">
                    <div className="match-result-heading"><div><b>{scholarship.name}</b><small>{scholarship.org} · {scholarship.amount}</small></div><strong className={match.eligible ? 'eligible-score' : ''}>{match.score}% match</strong></div>
                    <div className="match-reasons">
                      {match.passed.map((requirement) => <span className="reason-good" key={requirement.label}><Check size={12} />{requirement.label}</span>)}
                      {match.missing.map((requirement) => <span className="reason-missing" key={requirement.label}><X size={12} />{requirement.label}</span>)}
                    </div>
                  </div>
                  <button className="soft-btn match-view" onClick={() => openScholarship(scholarship)}>Details <ArrowRight size={14} /></button>
                </article>
              ))}
            </div>
          </section>
        )}
      </>
    );
  };

  const renderApplications = () => {
    const filteredApplications = apps.filter((application) => {
      const scholarship = scholarships.find((item) => item.id === application.scholarshipId);
      const matchesStatus = statusFilter === 'All' || application.status === statusFilter;
      const searchable = `${scholarship?.name || ''} ${scholarship?.org || ''} ${application.status}`.toLowerCase();
      return matchesStatus && searchable.includes(appQuery.trim().toLowerCase());
    });
    return (
      <>
        <PageIntro eyebrow="YOUR PROGRESS, ALL IN ONE PLACE" title="My applications" subtitle="Keep an eye on every opportunity you're pursuing." />
        <section className="stats-grid compact-stats">
          <StatCard icon={FileText} label="Total applications" value={apps.length} note="Across all opportunities" tone="purple" />
          <StatCard icon={CheckCircle2} label="Submitted" value={apps.filter((application) => application.status === 'Submitted').length} note="Successfully sent" tone="mint" />
          <StatCard icon={Clock3} label="Under review" value={apps.filter((application) => application.status === 'Under Review').length} note="Awaiting a decision" tone="blue" />
          <StatCard icon={BookOpenCheck} label="Drafts" value={apps.filter((application) => application.status === 'Draft').length} note="Ready when you are" tone="peach" />
        </section>
        <section className="panel table-panel">
          <div className="panel-heading tracker-heading">
            <div><h3>Application tracker</h3><p>Track progress manually; submit applications with scholarship providers.</p></div>
            <label className="tracker-search"><Search size={15} /><input aria-label="Search applications" value={appQuery} onChange={(event) => setAppQuery(event.target.value)} placeholder="Search applications" /></label>
            <select className="small-select" aria-label="Filter application status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{applicationStatuses.map((status) => <option key={status}>{status}</option>)}</select>
          </div>
          <div className="application-list">
            {filteredApplications.map((application) => {
              const scholarship = scholarships.find((item) => item.id === application.scholarshipId);
              if (!scholarship) return null;
              return (
                <article className="application-row" key={application.id}>
                  <div className={`org-logo ${scholarship.color}`}>{scholarship.logo}</div>
                  <div className="application-name"><b>{scholarship.name}</b><small>{scholarship.org} · Added {formatDate(application.applied)}</small></div>
                  <StatusBadge status={application.status} />
                  <select className="status-select" aria-label={`Update status for ${scholarship.name}`} value={application.status} onChange={(event) => updateStatus(application.id, event.target.value)}>{applicationStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                  <button className="arrow-icon" onClick={() => openScholarship(scholarship)} aria-label={`View ${scholarship.name}`}><ArrowUpRight size={16} /></button>
                </article>
              );
            })}
            {filteredApplications.length === 0 && <EmptyState icon={ClipboardList} title={apps.length ? 'No applications match' : 'Your tracker is ready'} text={apps.length ? 'Try another search or status filter.' : 'Explore scholarships and add your first application.'} action={apps.length ? undefined : () => go('Discover')} />}
          </div>
        </section>
      </>
    );
  };

  const renderSaved = () => {
    const savedScholarships = scholarships.filter((scholarship) => saved.includes(scholarship.id));
    return (
      <>
        <PageIntro eyebrow="KEEP GOOD THINGS CLOSE" title="Saved scholarships" subtitle="Your shortlist of opportunities to come back to." />
        <div className="results-meta"><span><b>{savedScholarships.length}</b> saved opportunities</span><button className="text-link" onClick={() => go('Discover')}>Discover more <ArrowRight size={14} /></button></div>
        {savedScholarships.length ? (
          <div className="scholarship-grid">
            {savedScholarships.map((scholarship) => <ScholarshipCard key={scholarship.id} scholarship={scholarship} profile={profile} saved onSave={() => toggleSaved(scholarship.id)} onOpen={() => openScholarship(scholarship)} />)}
          </div>
        ) : <EmptyState icon={Bookmark} title="Your shortlist is waiting" text="Save scholarships that catch your eye and they'll appear here." action={() => go('Discover')} />}
      </>
    );
  };

  const renderDeadlines = () => (
    <>
      <PageIntro eyebrow="STAY ONE STEP AHEAD" title="Deadline calendar" subtitle="A clear view of the dates that matter for your next opportunity." />
      <section className="panel calendar-panel">
        <div className="panel-heading"><div><h3>Upcoming scholarship deadlines</h3><p>{deadlines.length} open sample opportunities, sorted by closing date.</p></div><div className="calendar-legend"><span><i />Upcoming</span><span><i />Closing soon</span></div></div>
        {deadlines.length ? deadlines.map((scholarship) => <DeadlineRow key={scholarship.id} scholarship={scholarship} onOpen={() => openScholarship(scholarship)} />) : <EmptyState icon={CalendarDays} title="You're all caught up" text="There are no upcoming deadlines in the current sample list." />}
      </section>
      <p className="demo-disclaimer"><AlertCircle size={14} />Dates are illustrative demo data. Confirm each deadline with its official provider.</p>
    </>
  );

  const renderProfile = () => (
    <>
      <PageIntro eyebrow="THIS IS YOUR STORY" title="Your student profile" subtitle="Keep your details current so GRANTLY can surface relevant opportunities." />
      <section className="panel profile-panel">
        <div className="profile-cover"><div className="profile-avatar-large">{profile.name?.[0] || 'P'}</div><div><h3>{profile.name || 'Student profile'}</h3><p>{profile.course} · {profile.year}</p></div><span className="profile-complete">SAVED ON THIS DEVICE</span></div>
        <div className="form-grid profile-fields">
          <Field label="Full name"><input maxLength={80} value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} /></Field>
          <Field label="Course"><select value={profile.course} onChange={(event) => updateProfile({ course: event.target.value })}><option>Engineering</option><option>Arts</option><option>Science</option><option>Commerce</option><option>Medicine</option><option>Law</option></select></Field>
          <Field label="Year of study"><select value={profile.year} onChange={(event) => updateProfile({ year: event.target.value })}><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Postgraduate</option></select></Field>
          <Field label="State"><select value={profile.state} onChange={(event) => updateProfile({ state: event.target.value })}><option>Karnataka</option><option>Maharashtra</option><option>Tamil Nadu</option><option>Kerala</option><option>Delhi</option><option>Other</option></select></Field>
          <Field label="Academic score (%)"><input type="number" min="0" max="100" step="0.1" value={profile.marks} onChange={(event) => updateProfile({ marks: event.target.value })} /></Field>
          <Field label="Annual family income (₹)"><input type="number" min="0" step="1" value={profile.income} onChange={(event) => updateProfile({ income: event.target.value })} /></Field>
          <Field label="Student category"><select value={profile.category} onChange={(event) => updateProfile({ category: event.target.value })}><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select></Field>
        </div>
        <div className="profile-footer"><span><CheckCircle2 size={15} />Changes save automatically on this device.</span><button className="primary-btn" onClick={() => notify('Profile details saved')}>Done <Check size={15} /></button></div>
      </section>
    </>
  );

  const renderSettings = () => (
    <>
      <PageIntro eyebrow="MAKE IT YOURS" title="Settings" subtitle="A few simple controls for your GRANTLY demo workspace." />
      <section className="panel settings-panel">
        <div className="settings-title"><div className="feature-icon"><Settings size={19} /></div><div><h3>Workspace preferences</h3><p>Your demo data remains on this device.</p></div></div>
        <div className="setting-row"><div><b>Local demo data</b><p>Your saved scholarships, profile and application tracker are stored in this browser.</p></div><span className="match-tag">ENABLED</span></div>
        <div className="setting-row"><div><b>Reduced motion</b><p>GRANTLY respects your device's motion accessibility preference.</p></div><span className="setting-state">{reducedMotion ? 'On' : 'System default'}</span></div>
        <div className="setting-row"><div><b>Reset demo data</b><p>Restore the sample profile, saved scholarship, explored list and application tracker.</p></div><button className="soft-btn" onClick={resetWorkspace}>Reset workspace</button></div>
      </section>
    </>
  );

  const pageContent = {
    Dashboard: renderDashboard,
    Discover: renderDiscover,
    'Smart Matcher': renderMatcher,
    'My Applications': renderApplications,
    'Saved Scholarships': renderSaved,
    Deadlines: renderDeadlines,
    'My Profile': renderProfile,
    Settings: renderSettings
  }[page]?.();
  const selectedApplication = selected ? apps.find((application) => application.scholarshipId === selected.id) : null;
  const applicationHistory = selectedApplication
    ? (selectedApplication.history?.length ? selectedApplication.history : [{ status: selectedApplication.status, date: selectedApplication.applied }])
    : [];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><GraduationCap size={22} /></div><span>grant<span className="brand-light">ly</span><i>.</i></span></div>
        <button className="workspace" onClick={() => go('My Profile')} aria-label="Open student profile"><div className="workspace-avatar">{profile.name?.[0] || 'P'}</div><div><strong>Personal workspace</strong><small>Student account</small></div><ChevronDown size={15} /></button>
        <nav aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.title}><div className="nav-label">{group.title}</div>{group.items.map((item) => <button key={item.id} onClick={() => go(item.id)} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined}><item.icon size={18} /><span>{item.id}</span>{item.id === 'Smart Matcher' && <span className="new-pill">NEW</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18} /></div><strong>Need a little help?</strong><p>Explore our guide to make the most of GRANTLY.</p><button onClick={() => { setSelected(null); setHelpOpen(true); }}>View help center <ArrowUpRight size={14} /></button></div>
          <div className="sidebar-user"><div className="avatar">{profile.name?.[0] || 'P'}</div><div><strong>{profile.name || 'Student'}</strong><small>Student</small></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
          <div className="top-actions">
            <label className="global-search"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); if (page !== 'Discover') setPage('Discover'); }} placeholder="Search scholarships..." aria-label="Search scholarships" /><kbd>⌕</kbd></label>
            <div className="notification-wrap" ref={notificationRef}>
              <button className="icon-button notification" onClick={() => setNotificationOpen((open) => !open)} aria-label="Notifications" aria-expanded={notificationOpen} aria-controls="notification-panel">
                <Bell size={19} />{urgentDeadlines.length > 0 && <i />}
              </button>
              <AnimatePresence>
                {notificationOpen && (
                  <motion.section id="notification-panel" className="notification-panel" aria-label="Deadline notifications" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                    <div className="notification-heading"><div><strong>Deadline reminders</strong><small>{urgentDeadlines.length ? `${urgentDeadlines.length} closing soon` : 'No urgent deadlines'}</small></div><CalendarClock size={17} /></div>
                    {urgentDeadlines.length ? urgentDeadlines.slice(0, 3).map((scholarship) => (
                      <button className="notification-item" key={scholarship.id} onClick={() => openScholarship(scholarship)}>
                        <span className="notification-icon"><CalendarDays size={15} /></span>
                        <span><b>{scholarship.name}</b><small>{daysLeft(scholarship.deadline) === 0 ? 'Closes today' : `${daysLeft(scholarship.deadline)} days remaining`}</small></span>
                      </button>
                    )) : <p className="notification-empty">You’re all caught up. We’ll highlight upcoming deadlines here.</p>}
                    <button className="notification-footer" onClick={() => go('Deadlines')}>View all deadlines <ArrowRight size={14} /></button>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
            <button className="top-avatar" onClick={() => go('My Profile')} aria-label="Open profile">{profile.name?.[0] || 'P'}</button>
          </div>
        </header>
        <div className="content-wrap">
          <div key={page} className="page-transition">
            {pageContent}
          </div>
          <footer className="page-footer"><span>© {new Date().getFullYear()} GRANTLY · Scholarship opportunities, thoughtfully organized.</span><span><Sparkles size={13} />A demo experience built for your next chapter</span></footer>
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
            <motion.section ref={modalRef} className="scholarship-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" initial={reducedMotion ? false : { opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close details"><X size={19} /></button>
              <div className={`modal-logo org-logo ${selected.color}`}>{selected.logo}</div>
              <div className="eyebrow">DEMO SCHOLARSHIP DETAILS</div>
              <h2 id="modal-title">{selected.name}</h2><p className="modal-org">{selected.org}</p>
              <div className="modal-amount"><span>Illustrative award</span><b>{selected.amount}</b></div>
              <p className="modal-description">{selected.description}</p>
              <div className="modal-facts">
                <div><small>Application deadline</small><b>{formatDate(selected.deadline)}</b></div>
                <div><small>Minimum academic score</small><b>{selected.minMarks}%</b></div>
                <div><small>Family income limit</small><b>{money(selected.maxIncome)} / year</b></div>
                <div><small>Study level</small><b>{selected.level}</b></div>
                <div><small>Course requirement</small><b>{selected.courses.join(', ')}</b></div>
                <div><small>Category requirement</small><b>{selected.categories.join(', ')}</b></div>
              </div>
              {selectedApplication && (
                <div className="application-history">
                  <div className="application-history-heading"><div><strong>Application timeline</strong><small>Latest status: {selectedApplication.status}</small></div><StatusBadge status={selectedApplication.status} /></div>
                  <ol>{applicationHistory.map((entry, index) => <li key={`${entry.status}-${entry.date}-${index}`}><span className="timeline-dot" /><span><b>{entry.status}</b><small>{formatDate(entry.date)}</small></span></li>)}</ol>
                </div>
              )}
              <div className="modal-match"><div><strong>{evaluateScholarship(selected, profile).score}% profile match</strong><span>{evaluateScholarship(selected, profile).eligible ? 'All sample criteria match your profile.' : `${evaluateScholarship(selected, profile).missing.length} sample criteria need review.`}</span></div><div className="match-track"><span style={{ width: `${evaluateScholarship(selected, profile).score}%` }} /></div></div>
              <div className="modal-note"><AlertCircle size={16} /><span>Demo information and simplified eligibility only. Adding this opportunity only tracks it here; it does not submit an application. Confirm all criteria, award values and deadlines with the official provider.</span></div>
              <div className="modal-actions"><button className="soft-btn" onClick={() => toggleSaved(selected.id)}><Bookmark size={16} />{saved.includes(selected.id) ? 'Saved' : 'Save scholarship'}</button><button className="primary-btn" onClick={() => trackScholarship(selected)} disabled={Boolean(selectedApplication)}>{selectedApplication ? 'Already tracking' : 'Add to tracker'} <ArrowRight size={16} /></button></div>
            </motion.section>
          </motion.div>
        )}
        {helpOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}>
            <motion.section ref={modalRef} className="scholarship-modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" initial={reducedMotion ? false : { opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}>
              <button className="modal-close" onClick={() => setHelpOpen(false)} aria-label="Close help"><X size={19} /></button>
              <div className="modal-logo help-icon"><CircleHelp size={20} /></div>
              <div className="eyebrow">GRANTLY QUICK GUIDE</div>
              <h2 id="help-title">Make the most of your workspace</h2>
              <div className="help-guide-list">
                <p><b>Discover:</b> Search by scholarship or provider, then narrow the sample catalog by category, award amount and profile match.</p>
                <p><b>Smart Matcher:</b> Update your profile to compare your details with illustrative criteria. Scores are not official decisions.</p>
                <p><b>Applications:</b> Save opportunities, track applications and update their status. Changes are stored in this browser.</p>
                <p><b>Deadlines:</b> Check the upcoming list and reminders, then confirm dates with each official provider.</p>
              </div>
              <div className="modal-actions"><button className="primary-btn" onClick={() => { setHelpOpen(false); go('Discover'); }}>Explore scholarships <ArrowRight size={15} /></button></div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><CheckCircle2 size={17} />{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

export default App;
