// Public holidays, excluding compensatory rest days/exemptions for public employees.
// Sources checked 2026-10-27:
// https://www.gov.mo/en/public-holidays/year-2026/
// https://www.gov.mo/en/public-holidays/year-2027/
const PUBLIC_HOLIDAYS = {
  2026: new Set([
    '2026-01-01', '2026-02-17', '2026-02-18', '2026-02-19',
    '2026-04-03', '2026-04-04', '2026-04-05', '2026-05-01',
    '2026-05-24', '2026-06-19', '2026-09-26', '2026-10-01',
    '2026-10-02', '2026-10-18', '2026-11-02', '2026-12-08',
    '2026-12-20', '2026-12-22', '2026-12-24', '2026-12-25',
  ]),
  2027: new Set([
    '2027-01-01', '2027-02-06', '2027-02-07', '2027-02-08',
    '2027-03-26', '2027-03-27', '2027-04-05', '2027-05-01',
    '2027-05-13', '2027-06-09', '2027-09-16', '2027-10-01',
    '2027-10-02', '2027-10-08', '2027-11-02', '2027-12-08',
    '2027-12-20', '2027-12-22', '2027-12-24', '2027-12-25',
  ]),
};

export const isCalendarKnown = (year) => Object.hasOwn(PUBLIC_HOLIDAYS, year);

export const isPublicHoliday = (date) => {
  const year = Number(date.slice(0, 4));
  // null distinguishes an unreviewed year from a confirmed working day.
  return isCalendarKnown(year) ? PUBLIC_HOLIDAYS[year].has(date) : null;
};
