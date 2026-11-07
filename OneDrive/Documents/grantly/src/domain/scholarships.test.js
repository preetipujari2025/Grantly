import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addTrackedApplication,
  daysLeft,
  evaluateScholarship,
  filterScholarships,
  initialApps,
  initialProfile,
  normalizeApplications,
  normalizeProfile,
  normalizeSavedScholarships,
  rankScholarships,
  scholarships,
  updateApplicationStatus,
  upcomingScholarships
} from './scholarships.ts';

test('matcher explains passing criteria and identifies a complete sample match', () => {
  const result = evaluateScholarship(scholarships[0], initialProfile);

  assert.equal(result.score, 100);
  assert.equal(result.eligible, true);
  assert.equal(result.missing.length, 0);
  assert.equal(result.passed.length, result.requirements.length);
});

test('missing or out-of-range academic and income values cannot count as eligible', () => {
  const result = evaluateScholarship(scholarships[0], {
    ...initialProfile,
    marks: '',
    income: '-1'
  });

  assert.equal(result.eligible, false);
  assert.match(result.missing[0].label, /Academic score/);
  assert.match(result.missing[1].label, /Annual family income/);
});

test('category and amount filters return only matching opportunities', () => {
  const result = filterScholarships(initialProfile, {
    query: '',
    category: 'Merit-based',
    minimumAmount: '50000',
    eligibility: 'all',
    sort: 'Amount: high to low'
  });

  assert.deepEqual(result.map(({ name }) => name), [
    'Academic Excellence Fellowship',
    'National Merit Scholarship'
  ]);
});

test('provider search and deadline sorting are deterministic', () => {
  const result = filterScholarships(initialProfile, {
    query: 'Karnataka Learning Fund',
    category: 'All categories',
    minimumAmount: '0',
    eligibility: 'all',
    sort: 'Deadline: soonest'
  });

  assert.deepEqual(result.map(({ id }) => id), [4]);
});

test('recommendations rank full matches ahead of near matches, with deadline tie-breaking', () => {
  const ranked = rankScholarships(initialProfile);

  assert.deepEqual(ranked.slice(0, 4).map(({ scholarship }) => scholarship.id), [2, 1, 6, 3]);
  assert.equal(ranked[0].match.eligible, true);
  assert.ok(ranked[3].match.score > ranked[4].match.score);
});

test('deadline calculations include today and exclude expired opportunities', () => {
  const today = new Date(2026, 11, 10, 15);

  assert.equal(daysLeft('2026-12-10', today), 0);
  assert.equal(daysLeft('2026-12-09', today), -1);
  assert.deepEqual(upcomingScholarships(today).map(({ id }) => id), [4, 2, 1, 6, 3, 5]);
});

test('adding a scholarship tracks it as Saved, never as submitted', () => {
  const applications = addTrackedApplication(initialApps, 3, '2026-11-07');

  assert.ok(applications);
  assert.deepEqual(applications.at(-1), {
    id: 104,
    scholarshipId: 3,
    status: 'Saved',
    applied: '2026-11-07',
    history: [{ status: 'Saved', date: '2026-11-07' }]
  });
  assert.equal(addTrackedApplication(applications, 3, '2026-11-07'), null);
});

test('status updates append history and preserve unchanged records', () => {
  const next = updateApplicationStatus(initialApps, 103, 'Submitted', '2026-11-07');

  assert.equal(next[2].status, 'Submitted');
  assert.deepEqual(next[2].history, [{ status: 'Submitted', date: '2026-11-07' }]);
  assert.equal(updateApplicationStatus(next, 103, 'Submitted', '2026-11-08')[2], next[2]);
});

test('local storage normalization ignores malformed profile and record fields', () => {
  const profile = normalizeProfile({
    name: '<img src=x onerror=alert(1)>',
    course: 'Unknown course',
    marks: 'Infinity',
    income: '450000'
  });
  const apps = normalizeApplications([
    ...initialApps,
    { id: 104, scholarshipId: 4, status: 'Saved', applied: '2026-11-06' },
    { id: 104, scholarshipId: 999, status: 'Submitted', applied: '2026-11-07' },
    { id: 105, scholarshipId: 3, status: 'not a status', applied: '2026-11-07' }
  ]);

  assert.equal(profile.name, '<img src=x onerror=alert(1)>');
  assert.equal(profile.course, initialProfile.course);
  assert.equal(profile.marks, initialProfile.marks);
  assert.equal(apps.length, initialApps.length);
  assert.deepEqual(normalizeSavedScholarships([3, 3, 999, '1']), [3]);
});

test('profile normalization preserves editable empty fields and spaces in names', () => {
  const profile = normalizeProfile({
    name: 'Preeti Pujari ',
    course: '',
    year: '',
    state: '',
    category: '',
    marks: '-1',
    income: ''
  });

  assert.equal(profile.name, 'Preeti Pujari ');
  assert.equal(profile.course, '');
  assert.equal(profile.year, '');
  assert.equal(profile.state, '');
  assert.equal(profile.category, '');
  assert.equal(profile.marks, '-1');
  assert.equal(profile.income, '');
});

test('an incomplete study year is reported as a missing matching requirement', () => {
  const result = evaluateScholarship(scholarships[0], {
    ...initialProfile,
    year: ''
  });

  assert.equal(result.eligible, false);
  assert.ok(result.missing.some(({ label }) => label === 'Study level: Undergraduate'));
});
