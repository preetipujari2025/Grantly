import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownUp, ArrowRight, ArrowUpRight, Bell, Bookmark, BookOpenCheck,
  CalendarDays, CalendarClock, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, FileText, Filter, GraduationCap, LayoutDashboard,
  Menu, MoreHorizontal, Search, Settings, SlidersHorizontal, Sparkles, Target,
  UserRound, X, ClipboardList, AlertCircle
} from 'lucide-react';

const scholarships = [
  {
    id: 1,
    name: 'National Merit Scholarship',
    org: 'National Education Foundation',
    amount: '₹50,000',
    amountNum: 50000,
    deadline: '2026-12-30',
    category: 'Merit-based',
    level: 'Undergraduate',
    state: 'All India',
    minMarks: 80,
    maxIncome: 800000,
    courses: ['All'],
    categories: ['All'],
    tags: ['Academic excellence', 'Undergraduate'],
    color: 'lilac',
    logo: 'N',
    featured: true,
    description: 'Financial support for academically strong undergraduate students pursuing higher education.'
  },
  {
    id: 2,
    name: 'Future Leaders Grant',
    org: 'Bright Futures Trust',
    amount: '₹75,000',
    amountNum: 75000,
    deadline: '2026-12-18',
    category: 'Need-based',
    level: 'Undergraduate',
    state: 'All India',
    minMarks: 65,
    maxIncome: 500000,
    courses: ['All'],
    categories: ['All'],
    tags: ['Financial need', 'Leadership'],
    color: 'peach',
    logo: 'F',
    featured: true,
    description: 'A need-based grant supporting motivated students with leadership potential.'
  },
  {
    id: 3,
    name: 'Women in STEM Award',
    org: 'STEM Forward India',
    amount: '₹1,00,000',
    amountNum: 100000,
    deadline: '2027-01-15',
    category: 'Women in STEM',
    level: 'Undergraduate',
    state: 'All India',
    minMarks: 70,
    maxIncome: 1000000,
    courses: ['Engineering', 'Science'],
    categories: ['All'],
    tags: ['STEM course', 'Undergraduate'],
    color: 'mint',
    logo: 'S',
    featured: false,
    description: 'Illustrative support for students pursuing science, technology, engineering and mathematics. Official criteria may include additional applicant requirements.'
  },
  {
    id: 4,
    name: 'Karnataka Student Support',
    org: 'Karnataka Learning Fund',
    amount: '₹30,000',
    amountNum: 30000,
    deadline: '2026-12-10',
    category: 'State scholarship',
    level: 'Undergraduate',
    state: 'Karnataka',
    minMarks: 60,
    maxIncome: 600000,
    courses: ['All'],
    categories: ['OBC', 'SC', 'ST', 'EWS'],
    tags: ['Karnataka', 'Undergraduate'],
    color: 'blue',
    logo: 'K',
    featured: false,
    description: 'Illustrative education assistance for eligible students in Karnataka. Confirm category and residency rules with the official provider.'
  },
  {
    id: 5,
    name: 'Academic Excellence Fellowship',
    org: 'The Scholar Initiative',
    amount: '₹60,000',
    amountNum: 60000,
    deadline: '2027-02-05',
    category: 'Merit-based',
    level: 'Postgraduate',
    state: 'All India',
    minMarks: 85,
    maxIncome: 1200000,
    courses: ['All'],
    categories: ['All'],
    tags: ['High achievers', 'Postgraduate'],
    color: 'lilac',
    logo: 'A',
    featured: false,
    description: 'A sample fellowship for high-achieving students entering postgraduate programmes.'
  },
  {
    id: 6,
    name: 'Digital India Learning Grant',
    org: 'Digital Learning Alliance',
    amount: '₹40,000',
    amountNum: 40000,
    deadline: '2027-01-08',
    category: 'Need-based',
    level: 'Undergraduate',
    state: 'All India',
    minMarks: 60,
    maxIncome: 450000,
    courses: ['All'],
    categories: ['All'],
    tags: ['Technology', 'Digital skills'],
    color: 'mint',
    logo: 'D',
    featured: false,
    description: 'Illustrative support for students building skills for a technology-enabled future.'
  }
];

const initialApps = [
  { id: 101, scholarshipId: 1, status: 'Under Review', applied: '2026-10-22' },
  { id: 102, scholarshipId: 4, status: 'Submitted', applied: '2026-10-28' },
  { id: 103, scholarshipId: 2, status: 'Draft', applied: '2026-11-02' }
];
const initialProfile = {
  name: 'Preeti',
  course: 'Engineering',
  year: '3rd year',
  state: 'Karnataka',
  marks: '82',
  income: '450000',
  category: 'General'
};
const applicationStatuses = ['Saved', 'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
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

const normalizeStatus = (status) => status === 'Under review' ? 'Under Review' : status;
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const parseDate = (date) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const daysLeft = (date) => {
  const deadline = parseDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((deadline - today) / 86400000);
};
const formatDate = (date) => parseDate(date).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
const studyLevel = (year) => year === 'Postgraduate' ? 'Postgraduate' : 'Undergraduate';

function evaluateScholarship(scholarship, profile) {
  const marks = Number(profile.marks);
  const income = Number(profile.income);
  const requirements = [
    { label: `Academic score of at least ${scholarship.minMarks}%`, pass: Number.isFinite(marks) && marks >= scholarship.minMarks },
    { label: `Annual family income at or below ${money(scholarship.maxIncome)}`, pass: Number.isFinite(income) && income <= scholarship.maxIncome },
    { label: scholarship.state === 'All India' ? 'Open to students across India' : `State: ${scholarship.state}`, pass: scholarship.state === 'All India' || scholarship.state === profile.state },
    { label: `Study level: ${scholarship.level}`, pass: scholarship.level === studyLevel(profile.year) },
    { label: scholarship.courses.includes('All') ? 'Open to all listed courses' : `Course: ${scholarship.courses.join(' or ')}`, pass: scholarship.courses.includes('All') || scholarship.courses.includes(profile.course) },
    { label: scholarship.categories.includes('All') ? 'Open to all listed categories' : `Category: ${scholarship.categories.join(', ')}`, pass: scholarship.categories.includes('All') || scholarship.categories.includes(profile.category) }
  ];
  const passed = requirements.filter((requirement) => requirement.pass);
  return {
    score: Math.round((passed.length / requirements.length) * 100),
    eligible: passed.length === requirements.length,
    passed,
    missing: requirements.filter((requirement) => !requirement.pass),
    requirements
  };
}

function CountUp({ value }) {
  const reducedMotion = useReducedMotion();
  const target = Number(value) || 0;
  const [count, setCount] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setCount(target);
      return undefined;
    }
    let frame;
    const started = performance.now();
    const duration = 700;
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, target]);

  return <>{count.toLocaleString('en-IN')}</>;
}

function PageIntro({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading subpage-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <motion.article className="stat-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value"><CountUp value={value} /></div>
      <div className="stat-note"><span className="stat-note-dot" />{note}</div>
    </motion.article>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-pill ${className}`}><i />{status}</span>;
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <button className="soft-btn" onClick={action}>Explore scholarships <ArrowRight size={15} /></button>}
    </div>
  );
}

function ScholarshipCard({ scholarship, profile, saved, onSave, onOpen }) {
  const match = evaluateScholarship(scholarship, profile);
  const remaining = daysLeft(scholarship.deadline);
  return (
    <motion.article
      className="scholarship-card"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
    >
      <div className="card-top">
        <div className={`org-logo ${scholarship.color}`}>{scholarship.logo}</div>
        <button className={`bookmark-btn ${saved ? 'is-saved' : ''}`} onClick={onSave} aria-label={saved ? 'Remove saved scholarship' : 'Save scholarship'}>
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-category">{scholarship.category}</div>
      <h3>{scholarship.name}</h3>
      <p className="card-org">{scholarship.org}</p>
      <div className="card-award"><small>DEMO AWARD VALUE</small><b>{scholarship.amount}</b></div>
      <div className="card-match">
        <div className="match-line"><span>Profile match</span><strong>{match.score}%</strong></div>
        <div className="match-track"><span style={{ width: `${match.score}%` }} /></div>
      </div>
      <div className="card-tags">{scholarship.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="card-bottom">
        <span className={remaining <= 14 ? 'closing-soon' : ''}>
          <Clock3 size={14} />{remaining < 0 ? 'Deadline passed' : remaining === 0 ? 'Closes today' : `${remaining} days left`}
        </span>
        <button onClick={onOpen}>View details <ArrowRight size={14} /></button>
      </div>
    </motion.article>
  );
}

function ScholarshipRow({ scholarship, profile, saved, onSave, onOpen }) {
  const match = evaluateScholarship(scholarship, profile);
  return (
    <div className="mini-scholarship">
      <div className={`org-logo ${scholarship.color}`}>{scholarship.logo}</div>
      <div className="mini-info"><b>{scholarship.name}</b><small>{scholarship.org}</small></div>
      <div className="mini-amount"><b>{scholarship.amount}</b><small>{match.score}% profile match</small></div>
      <button className={`bookmark-btn ${saved ? 'is-saved' : ''}`} onClick={onSave} aria-label={saved ? 'Remove saved scholarship' : 'Save scholarship'}>
        <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button className="arrow-icon" onClick={onOpen} aria-label={`View ${scholarship.name}`}><ArrowUpRight size={16} /></button>
    </div>
  );
}

function DeadlineRow({ scholarship, onOpen, compact = false }) {
  const remaining = daysLeft(scholarship.deadline);
  const date = parseDate(scholarship.deadline);
  return (
    <div className={`deadline-item ${compact ? '' : 'calendar-row'}`}>
      <div className="date-tile"><b>{date.getDate()}</b><small>{date.toLocaleString('en', { month: 'short' }).toUpperCase()}</small></div>
      <div className="deadline-info"><b>{scholarship.name}</b><small>{scholarship.org}{compact ? '' : ` · ${scholarship.amount}`}</small></div>
      <span className={`deadline-badge ${remaining <= 14 ? 'urgent' : ''}`}>{remaining === 0 ? 'Today' : `${remaining} days left`}</span>
      <button className="arrow-icon" onClick={onOpen} aria-label={`View ${scholarship.name}`}><ArrowUpRight size={16} /></button>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('Recommended');
  const [saved, setSaved] = useState(() => {
    const value = storage.read('grantly_saved', [3]);
    return Array.isArray(value) ? value : [3];
  });
  const [apps, setApps] = useState(() => {
    const value = storage.read('grantly_apps', initialApps);
    return Array.isArray(value) ? value.map((application) => ({ ...application, status: normalizeStatus(application.status) })) : initialApps;
  });
  const [profile, setProfile] = useState(() => {
    const value = storage.read('grantly_profile', initialProfile);
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...initialProfile, ...value } : initialProfile;
  });
  const [explored, setExplored] = useState(() => {
    const value = storage.read('grantly_explored', []);
    return Array.isArray(value) ? value.filter((id) => scholarships.some((scholarship) => scholarship.id === id)) : [];
  });
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const [matcherDone, setMatcherDone] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [appQuery, setAppQuery] = useState('');
  const reducedMotion = useReducedMotion();
  const deadlines = useMemo(() => scholarships.filter((scholarship) => daysLeft(scholarship.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline)), []);
  const matches = useMemo(() => scholarships
    .map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, profile) }))
    .filter(({ match }) => match.eligible), [profile]);
  const filteredScholarships = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return scholarships.filter((scholarship) => {
      const searchable = `${scholarship.name} ${scholarship.org} ${scholarship.category} ${scholarship.tags.join(' ')}`.toLowerCase();
      return searchable.includes(searchTerm) && (category === 'All categories' || scholarship.category === category);
    }).sort((a, b) => {
      if (sort === 'Amount: high to low') return b.amountNum - a.amountNum;
      if (sort === 'Deadline: soonest') return a.deadline.localeCompare(b.deadline);
      return Number(b.featured) - Number(a.featured);
    });
  }, [category, query, sort]);
  const progressCount = apps.filter((application) => !['Saved', 'Draft'].includes(application.status)).length;
  const progressPercent = apps.length ? Math.round((progressCount / apps.length) * 100) : 0;
  const progressSegments = useMemo(() => {
    let offset = 0;
    return applicationStatuses.map((status) => {
      const count = apps.filter((application) => application.status === status).length;
      const length = apps.length ? (258 * count) / apps.length : 0;
      const segment = { status, offset, length };
      offset += length;
      return segment;
    });
  }, [apps]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(window.__grantlyToast);
    window.__grantlyToast = window.setTimeout(() => setToast(''), 2800);
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
    setSelected(scholarship);
    if (explored.includes(scholarship.id)) return;
    const next = [...explored, scholarship.id];
    setExplored(next);
    if (!storage.write('grantly_explored', next)) notify('Could not save your explored scholarships in this browser.');
  };
  const updateProfile = (changes) => persistProfile({ ...profile, ...changes });
  const toggleSaved = (id) => {
    const isSaved = saved.includes(id);
    persistSaved(isSaved ? saved.filter((savedId) => savedId !== id) : [...saved, id]);
    notify(isSaved ? 'Removed from saved scholarships' : 'Scholarship saved to your list');
  };
  const updateStatus = (applicationId, status) => {
    persistApps(apps.map((application) => application.id === applicationId ? { ...application, status } : application));
    notify('Application status updated');
  };
  const apply = (scholarship) => {
    const existing = apps.find((application) => application.scholarshipId === scholarship.id);
    if (existing && !['Draft', 'Saved'].includes(existing.status)) {
      notify('This application is already in progress');
      return;
    }
    const applied = new Date().toISOString().slice(0, 10);
    const next = existing
      ? apps.map((application) => application.id === existing.id ? { ...application, status: 'Submitted', applied } : application)
      : [...apps, { id: Date.now(), scholarshipId: scholarship.id, status: 'Submitted', applied }];
    persistApps(next);
    setSelected(null);
    notify('Application added to your tracker');
  };
  const go = (nextPage) => {
    setPage(nextPage);
    setMobileOpen(false);
    setQuery('');
    setAppQuery('');
  };
  const openFilteredApplications = (status) => {
    setStatusFilter(status);
    go('My Applications');
  };
  const resetWorkspace = () => {
    const cleared = ['grantly_saved', 'grantly_apps', 'grantly_profile', 'grantly_explored'].every((key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Unable to reset ${key}.`, error);
        return false;
      }
    });
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
    if (!selected) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

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
            {scholarships.slice(0, 3).map((scholarship) => (
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
            {deadlines.slice(0, 3).map((scholarship) => <DeadlineRow key={scholarship.id} scholarship={scholarship} onOpen={() => openScholarship(scholarship)} compact />)}
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
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search scholarships, providers or keywords..." /></label>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>All categories</option><option>Merit-based</option><option>Need-based</option><option>Women in STEM</option><option>State scholarship</option>
        </select>
        <label className="sort-select"><ArrowDownUp size={15} /><select aria-label="Sort scholarships" value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Amount: high to low</option><option>Deadline: soonest</option></select></label>
        <button className="filter-button" onClick={() => { setCategory('All categories'); setSort('Recommended'); setQuery(''); }}><Filter size={16} />Reset</button>
      </div>
      <div className="results-meta"><span><b>{filteredScholarships.length}</b> demo opportunities</span><span><SlidersHorizontal size={14} />Based on the sample catalog</span></div>
      <motion.div layout className="scholarship-grid">
        <AnimatePresence mode="popLayout">
          {filteredScholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} profile={profile} saved={saved.includes(scholarship.id)} onSave={() => toggleSaved(scholarship.id)} onOpen={() => openScholarship(scholarship)} />
          ))}
        </AnimatePresence>
      </motion.div>
      {filteredScholarships.length === 0 && <EmptyState icon={Search} title="No scholarships found" text="Try another keyword or reset your filters." action={() => { setQuery(''); setCategory('All categories'); }} />}
      <p className="demo-disclaimer"><AlertCircle size={14} />All opportunities, award amounts and criteria are illustrative demo data. Verify details with the official provider.</p>
    </>
  );

  const renderMatcher = () => {
    const rankedMatches = scholarships.map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, profile) }))
      .sort((a, b) => b.match.score - a.match.score || a.scholarship.deadline.localeCompare(b.scholarship.deadline));
    const averageScore = rankedMatches.length ? Math.round(rankedMatches.reduce((sum, item) => sum + item.match.score, 0) / rankedMatches.length) : 0;
    return (
      <>
        <PageIntro eyebrow="A LITTLE MAGIC, A LOT OF CLARITY" title="Your scholarship matchmaker" subtitle="Tell us a little about yourself. We'll highlight opportunities that fit your profile." />
        <div className="matcher-layout">
          <section className="panel matcher-form">
            <div className="form-title"><div className="feature-icon"><Sparkles size={20} /></div><div><h3>Build your student profile</h3><p>Your details stay in this demo on this device.</p></div></div>
            <div className="form-grid">
              <Field label="Academic percentage"><input type="number" min="0" max="100" value={profile.marks} onChange={(event) => updateProfile({ marks: event.target.value })} /></Field>
              <Field label="Annual family income (₹)"><input type="number" min="0" value={profile.income} onChange={(event) => updateProfile({ income: event.target.value })} /></Field>
              <Field label="Course"><select value={profile.course} onChange={(event) => updateProfile({ course: event.target.value })}><option>Engineering</option><option>Arts</option><option>Science</option><option>Commerce</option><option>Medicine</option><option>Law</option></select></Field>
              <Field label="Year of study"><select value={profile.year} onChange={(event) => updateProfile({ year: event.target.value })}><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Postgraduate</option></select></Field>
              <Field label="State"><select value={profile.state} onChange={(event) => updateProfile({ state: event.target.value })}><option>Karnataka</option><option>Maharashtra</option><option>Tamil Nadu</option><option>Kerala</option><option>Delhi</option><option>Other</option></select></Field>
              <Field label="Student category"><select value={profile.category} onChange={(event) => updateProfile({ category: event.target.value })}><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select></Field>
            </div>
            <button className="primary-btn" onClick={() => { setMatcherDone(true); notify('Your sample matches are ready'); }}><Sparkles size={16} />Find my scholarships<ArrowRight size={16} /></button>
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
              <div><div className="eyebrow">YOUR RESULTS</div><h3>{matches.length} potential matches</h3><p>{averageScore}% average profile alignment across the sample catalog.</p></div>
              <div className="score-orb" aria-label={`${averageScore}% average profile match`}><strong>{averageScore}%</strong><small>average</small></div>
            </div>
            <div className="match-result-list">
              {rankedMatches.map(({ scholarship, match }) => (
                <article className="match-result" key={scholarship.id}>
                  <div className={`org-logo ${scholarship.color}`}>{scholarship.logo}</div>
                  <div className="match-result-main">
                    <div className="match-result-heading"><div><b>{scholarship.name}</b><small>{scholarship.org} · {scholarship.amount}</small></div><strong className={match.eligible ? 'eligible-score' : ''}>{match.score}% match</strong></div>
                    <div className="match-reasons">
                      {match.passed.slice(0, 3).map((requirement) => <span className="reason-good" key={requirement.label}><Check size={12} />{requirement.label}</span>)}
                      {match.missing.slice(0, 2).map((requirement) => <span className="reason-missing" key={requirement.label}><X size={12} />{requirement.label}</span>)}
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
            <div><h3>Application tracker</h3><p>Update and review your application journey.</p></div>
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
          <Field label="Full name"><input value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} /></Field>
          <Field label="Course"><select value={profile.course} onChange={(event) => updateProfile({ course: event.target.value })}><option>Engineering</option><option>Arts</option><option>Science</option><option>Commerce</option><option>Medicine</option><option>Law</option></select></Field>
          <Field label="Year of study"><select value={profile.year} onChange={(event) => updateProfile({ year: event.target.value })}><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Postgraduate</option></select></Field>
          <Field label="State"><select value={profile.state} onChange={(event) => updateProfile({ state: event.target.value })}><option>Karnataka</option><option>Maharashtra</option><option>Tamil Nadu</option><option>Kerala</option><option>Delhi</option><option>Other</option></select></Field>
          <Field label="Academic score (%)"><input type="number" min="0" max="100" value={profile.marks} onChange={(event) => updateProfile({ marks: event.target.value })} /></Field>
          <Field label="Annual family income (₹)"><input type="number" min="0" value={profile.income} onChange={(event) => updateProfile({ income: event.target.value })} /></Field>
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

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><GraduationCap size={22} /></div><span>grant<span className="brand-light">ly</span><i>.</i></span></div>
        <div className="workspace"><div className="workspace-avatar">{profile.name?.[0] || 'P'}</div><div><strong>Personal workspace</strong><small>Student account</small></div><ChevronDown size={15} /></div>
        <nav aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.title}><div className="nav-label">{group.title}</div>{group.items.map((item) => <button key={item.id} onClick={() => go(item.id)} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined}><item.icon size={18} /><span>{item.id}</span>{item.id === 'Smart Matcher' && <span className="new-pill">NEW</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18} /></div><strong>Need a little help?</strong><p>Explore our guide to make the most of GRANTLY.</p><button onClick={() => notify('Help guide coming soon')}>View help center <ArrowUpRight size={14} /></button></div>
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
            <button className="icon-button notification" onClick={() => go('Deadlines')} aria-label="View deadlines"><Bell size={19} /><i /></button>
            <button className="top-avatar" onClick={() => go('My Profile')} aria-label="Open profile">{profile.name?.[0] || 'P'}</button>
          </div>
        </header>
        <div className="content-wrap">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={page} className="page-transition" initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
              {pageContent}
            </motion.div>
          </AnimatePresence>
          <footer className="page-footer"><span>© 2026 GRANTLY · Scholarship opportunities, thoughtfully organized.</span><span><Sparkles size={13} />A demo experience built for your next chapter</span></footer>
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
            <motion.section className="scholarship-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" initial={reducedMotion ? false : { opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.2 }}>
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
              <div className="modal-match"><div><strong>{evaluateScholarship(selected, profile).score}% profile match</strong><span>{evaluateScholarship(selected, profile).eligible ? 'All sample criteria match your profile.' : `${evaluateScholarship(selected, profile).missing.length} sample criteria need review.`}</span></div><div className="match-track"><span style={{ width: `${evaluateScholarship(selected, profile).score}%` }} /></div></div>
              <div className="modal-note"><AlertCircle size={16} /><span>Demo information and simplified eligibility only. Confirm all criteria, award values and deadlines with the official provider before applying.</span></div>
              <div className="modal-actions"><button className="soft-btn" onClick={() => toggleSaved(selected.id)}><Bookmark size={16} />{saved.includes(selected.id) ? 'Saved' : 'Save scholarship'}</button><button className="primary-btn" onClick={() => apply(selected)}>Add to applications <ArrowRight size={16} /></button></div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><CheckCircle2 size={17} />{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

export default App;
