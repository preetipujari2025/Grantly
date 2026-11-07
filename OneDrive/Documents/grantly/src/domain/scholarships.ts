export interface Scholarship {
  id: number;
  name: string;
  org: string;
  amount: string;
  amountNum: number;
  deadline: string;
  category: string;
  level: 'Undergraduate' | 'Postgraduate';
  state: string;
  minMarks: number;
  maxIncome: number;
  courses: string[];
  categories: string[];
  tags: string[];
  color: string;
  logo: string;
  featured: boolean;
  description: string;
}

export interface StudentProfile {
  name: string;
  course: string;
  year: string;
  state: string;
  marks: string;
  income: string;
  category: string;
}

export const applicationStatuses = [
  'Saved',
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected'
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export interface ApplicationHistoryEntry {
  status: ApplicationStatus;
  date: string;
}

export interface ScholarshipApplication {
  id: number;
  scholarshipId: number;
  status: ApplicationStatus;
  applied: string;
  history?: ApplicationHistoryEntry[];
}

export interface EligibilityRequirement {
  label: string;
  pass: boolean;
}

export interface EligibilityResult {
  score: number;
  eligible: boolean;
  passed: EligibilityRequirement[];
  missing: EligibilityRequirement[];
  requirements: EligibilityRequirement[];
}

export interface RankedScholarship {
  scholarship: Scholarship;
  match: EligibilityResult;
}

export interface ScholarshipFilters {
  query: string;
  category: string;
  minimumAmount: string;
  eligibility: 'all' | 'eligible' | 'strong';
  sort: string;
}

const courses = ['Engineering', 'Arts', 'Science', 'Commerce', 'Medicine', 'Law'] as const;
const years = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate'] as const;
const states = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Kerala', 'Delhi', 'Other'] as const;
const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'] as const;

export const scholarships: Scholarship[] = [
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

export const initialApps: ScholarshipApplication[] = [
  { id: 101, scholarshipId: 1, status: 'Under Review', applied: '2026-10-22' },
  { id: 102, scholarshipId: 4, status: 'Submitted', applied: '2026-10-28' },
  { id: 103, scholarshipId: 2, status: 'Draft', applied: '2026-11-02' }
];

export const initialProfile: StudentProfile = {
  name: 'Preeti',
  course: 'Engineering',
  year: '3rd year',
  state: 'Karnataka',
  marks: '82',
  income: '450000',
  category: 'General'
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function isOption<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.some((option) => option === value);
}

function normalizeText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength);
}

function normalizeNumberText(value: unknown, fallback: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;
  const text = String(value).trim();
  if (text === '') return '';
  return /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(text) && Number.isFinite(Number(text)) ? text : fallback;
}

export function normalizeProfile(value: unknown): StudentProfile {
  if (!isRecord(value)) return initialProfile;
  const fallback = initialProfile;
  const course = normalizeText(value.course, fallback.course, 40).trim();
  const year = normalizeText(value.year, fallback.year, 30).trim();
  const state = normalizeText(value.state, fallback.state, 40).trim();
  const category = normalizeText(value.category, fallback.category, 30).trim();
  return {
    name: normalizeText(value.name, fallback.name, 80),
    course: course === '' ? '' : isOption(course, courses) ? course : fallback.course,
    year: year === '' ? '' : isOption(year, years) ? year : fallback.year,
    state: state === '' ? '' : isOption(state, states) ? state : fallback.state,
    marks: normalizeNumberText(value.marks, fallback.marks),
    income: normalizeNumberText(value.income, fallback.income),
    category: category === '' ? '' : isOption(category, categories) ? category : fallback.category
  };
}

export function normalizeSavedScholarships(value: unknown): number[] {
  if (!Array.isArray(value)) return [3];
  const scholarshipIds = new Set(scholarships.map(({ id }) => id));
  return [...new Set(value.filter((id): id is number => isSafeInteger(id) && scholarshipIds.has(id)))];
}

export function normalizeStatus(value: unknown): ApplicationStatus | null {
  if (typeof value !== 'string') return null;
  return applicationStatuses.find((status) => status.toLowerCase() === value.trim().toLowerCase()) ?? null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizeApplications(value: unknown): ScholarshipApplication[] {
  if (!Array.isArray(value)) return initialApps;
  const scholarshipIds = new Set(scholarships.map(({ id }) => id));
  const seenApplicationIds = new Set<number>();
  const seenScholarshipIds = new Set<number>();
  const normalized: ScholarshipApplication[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const id = candidate.id;
    const scholarshipId = candidate.scholarshipId;
    if (!isSafeInteger(id)
      || !isSafeInteger(scholarshipId)
      || !scholarshipIds.has(scholarshipId)
      || !isIsoDate(candidate.applied)) continue;

    const status = normalizeStatus(candidate.status);
    if (!status || seenApplicationIds.has(id) || seenScholarshipIds.has(scholarshipId)) continue;

    const history = Array.isArray(candidate.history)
      ? candidate.history.slice(-50).flatMap((entry) => {
        if (!isRecord(entry) || !isIsoDate(entry.date)) return [];
        const historyStatus = normalizeStatus(entry.status);
        return historyStatus ? [{ status: historyStatus, date: entry.date }] : [];
      })
      : undefined;

    seenApplicationIds.add(id);
    seenScholarshipIds.add(scholarshipId);
    normalized.push({
      id,
      scholarshipId,
      status,
      applied: candidate.applied,
      ...(history?.length ? { history } : {})
    });
  }
  return normalized;
}

export function money(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function daysLeft(date: string, referenceDate = new Date()): number {
  const [year, month, day] = date.split('-').map(Number);
  const deadlineUtc = Date.UTC(year, month - 1, day);
  const todayUtc = Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return Math.ceil((deadlineUtc - todayUtc) / 86400000);
}

export function formatDate(date: string): string {
  return parseDate(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function studyLevel(year: string): Scholarship['level'] {
  return year === 'Postgraduate' ? 'Postgraduate' : 'Undergraduate';
}

function profileNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

export function evaluateScholarship(scholarship: Scholarship, profile: StudentProfile): EligibilityResult {
  const marks = profileNumber(profile.marks);
  const income = profileNumber(profile.income);
  const requirements: EligibilityRequirement[] = [
    { label: `Academic score of at least ${scholarship.minMarks}%`, pass: Number.isFinite(marks) && marks >= 0 && marks <= 100 && marks >= scholarship.minMarks },
    { label: `Annual family income at or below ${money(scholarship.maxIncome)}`, pass: Number.isFinite(income) && income >= 0 && income <= scholarship.maxIncome },
    { label: scholarship.state === 'All India' ? 'Open to students across India' : `State: ${scholarship.state}`, pass: scholarship.state === 'All India' || scholarship.state === profile.state },
    { label: `Study level: ${scholarship.level}`, pass: Boolean(profile.year) && scholarship.level === studyLevel(profile.year) },
    { label: scholarship.courses.includes('All') ? 'Open to all listed courses' : `Course: ${scholarship.courses.join(' or ')}`, pass: scholarship.courses.includes('All') || scholarship.courses.includes(profile.course) },
    { label: scholarship.categories.includes('All') ? 'Open to all listed categories' : `Category: ${scholarship.categories.join(', ')}`, pass: scholarship.categories.includes('All') || scholarship.categories.includes(profile.category) }
  ];
  const passed = requirements.filter(({ pass }) => pass);
  return {
    score: Math.round((passed.length / requirements.length) * 100),
    eligible: passed.length === requirements.length,
    passed,
    missing: requirements.filter(({ pass }) => !pass),
    requirements
  };
}

export function rankScholarships(profile: StudentProfile): RankedScholarship[] {
  return scholarships
    .map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, profile) }))
    .sort((a, b) => b.match.score - a.match.score || a.scholarship.deadline.localeCompare(b.scholarship.deadline));
}

export function upcomingScholarships(referenceDate = new Date()): Scholarship[] {
  return scholarships
    .filter((scholarship) => daysLeft(scholarship.deadline, referenceDate) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
}

export function filterScholarships(
  profile: StudentProfile,
  filters: ScholarshipFilters
): Scholarship[] {
  const searchTerm = filters.query.trim().toLowerCase();
  const minimumAmount = Number(filters.minimumAmount);
  return scholarships.filter((scholarship) => {
    const searchable = `${scholarship.name} ${scholarship.org} ${scholarship.category} ${scholarship.tags.join(' ')}`.toLowerCase();
    const match = evaluateScholarship(scholarship, profile);
    const amountMatches = scholarship.amountNum >= minimumAmount;
    const eligibilityMatches = filters.eligibility === 'all'
      || (filters.eligibility === 'eligible' && match.eligible)
      || (filters.eligibility === 'strong' && match.score >= 80);
    return searchable.includes(searchTerm)
      && (filters.category === 'All categories' || scholarship.category === filters.category)
      && amountMatches
      && eligibilityMatches;
  }).sort((a, b) => {
    if (filters.sort === 'Amount: high to low') return b.amountNum - a.amountNum;
    if (filters.sort === 'Amount: low to high') return a.amountNum - b.amountNum;
    if (filters.sort === 'Deadline: soonest') return a.deadline.localeCompare(b.deadline);
    return Number(b.featured) - Number(a.featured);
  });
}

export function addTrackedApplication(
  applications: ScholarshipApplication[],
  scholarshipId: number,
  date: string
): ScholarshipApplication[] | null {
  if (!scholarships.some((scholarship) => scholarship.id === scholarshipId)
    || applications.some((application) => application.scholarshipId === scholarshipId)
    || !isIsoDate(date)) return null;
  const id = applications.reduce((largest, application) => Math.max(largest, application.id), 0) + 1;
  return [...applications, {
    id,
    scholarshipId,
    status: 'Saved',
    applied: date,
    history: [{ status: 'Saved', date }]
  }];
}

export function updateApplicationStatus(
  applications: ScholarshipApplication[],
  applicationId: number,
  status: ApplicationStatus,
  date: string
): ScholarshipApplication[] {
  if (!normalizeStatus(status) || !isIsoDate(date)) return applications;
  return applications.map((application) => {
    if (application.id !== applicationId || application.status === status) return application;
    return {
      ...application,
      status,
      history: [...(application.history ?? []), { status, date }]
    };
  });
}
