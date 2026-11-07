import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  Clock3
} from 'lucide-react';
import {
  daysLeft,
  evaluateScholarship,
  formatDate,
  money,
  parseDate
} from '../domain/scholarships.ts';

export function CountUp({ value }) {
  const reducedMotion = useReducedMotion();
  const target = Number(value) || 0;
  const [count, setCount] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) return undefined;
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

  return <>{(reducedMotion ? target : count).toLocaleString('en-IN')}</>;
}

export function PageIntro({ eyebrow, title, subtitle, action }) {
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

export function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <motion.article className="stat-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value"><CountUp value={value} /></div>
      <div className="stat-note"><span className="stat-note-dot" />{note}</div>
    </motion.article>
  );
}

export function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-pill ${className}`}><i />{status}</span>;
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <button className="soft-btn" onClick={action}>Explore scholarships <ArrowRight size={15} /></button>}
    </div>
  );
}

export function ScholarshipCard({ scholarship, profile, saved, onSave, onOpen }) {
  const match = evaluateScholarship(scholarship, profile);
  const remaining = daysLeft(scholarship.deadline);
  return (
    <article className="scholarship-card">
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
      <div className="card-eligibility">
        <span><Check size={11} />{scholarship.minMarks}% minimum score</span>
        <span><Check size={11} />Income up to {money(scholarship.maxIncome)}</span>
      </div>
      <div className="card-tags">{scholarship.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="card-bottom">
        <span className="card-deadline"><CalendarDays size={13} />{formatDate(scholarship.deadline)}</span>
        <span className={remaining <= 14 ? 'closing-soon card-countdown' : 'card-countdown'}>
          <Clock3 size={13} />{remaining < 0 ? 'Closed' : remaining === 0 ? 'Today' : `${remaining}d`}
        </span>
        <button onClick={onOpen}>View details <ArrowRight size={14} /></button>
      </div>
    </article>
  );
}

export function ScholarshipRow({ scholarship, profile, saved, onSave, onOpen }) {
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

export function DeadlineRow({ scholarship, onOpen, compact = false }) {
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

export function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
