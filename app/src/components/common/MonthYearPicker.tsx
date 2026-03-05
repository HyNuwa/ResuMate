import type { ChangeEvent } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: number[] = [];
for (let y = CURRENT_YEAR + 5; y >= CURRENT_YEAR - 60; y--) {
  YEARS.push(y);
}

/**
 * Parse a "MMM YYYY" string (e.g. "Mar 2024") into {month, year} indices.
 * month: 0-based (0=Jan), year: number. Returns null parts if unparseable.
 */
function parseDate(value: string): { month: number | ''; year: number | '' } {
  if (!value || value === 'Present' || value === 'No expiry') {
    return { month: '', year: '' };
  }
  const parts = value.trim().split(' ');
  const monthIdx = MONTHS.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);
  return {
    month: monthIdx >= 0 ? monthIdx : '',
    year: isNaN(year) ? '' : year,
  };
}

/**
 * Format month index (0-based) and year into "MMM YYYY" string.
 */
function formatDate(month: number | '', year: number | ''): string {
  if (month === '' || year === '') return '';
  return `${MONTHS[month as number]} ${year}`;
}

interface MonthYearPickerProps {
  value: string;           // "MMM YYYY", "Present", "No expiry" or ""
  onChange: (value: string) => void;
  allowPresent?: boolean;  // Show "Present" toggle (for end dates)
  presentLabel?: string;   // Label for the toggle, default "Present"
  label?: string;
}

export function MonthYearPicker({
  value,
  onChange,
  allowPresent = false,
  presentLabel = 'Present',
}: MonthYearPickerProps) {
  const isPresent = value === presentLabel;
  const { month, year } = parseDate(value);

  const handleMonthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    onChange(formatDate(newMonth as number | '', year));
  };

  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    onChange(formatDate(month, newYear as number | ''));
  };

  const handlePresentToggle = () => {
    if (isPresent) {
      onChange('');
    } else {
      onChange(presentLabel);
    }
  };

  return (
    <div className="month-year-picker">
      {allowPresent && (
        <label className="present-toggle">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={handlePresentToggle}
          />
          <span>{presentLabel}</span>
        </label>
      )}
      {!isPresent && (
        <div className="picker-selects">
          <select
            className="input picker-select"
            value={month === '' ? '' : String(month)}
            onChange={handleMonthChange}
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={String(i)}>{m}</option>
            ))}
          </select>
          <select
            className="input picker-select"
            value={year === '' ? '' : String(year)}
            onChange={handleYearChange}
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
