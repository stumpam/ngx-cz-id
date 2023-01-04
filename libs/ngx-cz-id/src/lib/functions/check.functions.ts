import { padStart } from '../functions/format.functions';

export function isValidCzId(id: string): boolean {
  const normalizedId = id.replace('/', '');
  const { year, month, day, num } = splitIdString(normalizedId);
  const historicId = normalizedId.length === 9;

  return checkId(year, month, day, num, historicId);
}

export function dateFromCzId(id: string): Date | undefined {
  const { year, month, day } = splitIdString(id.replace('/', ''));

  const dateYear = convertYear(+year);
  const dateMonth = convertMonth(+month);

  const date = new Date(`${dateYear}-${dateMonth}-${padStart(day)}`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * If historicId attribute is set to true (usually that czech id has just 9 numbers) it assumes, that
 * person is older than 1954
 */
export function checkId(
  year: string,
  month: string,
  day: string,
  num: string,
  historicId: boolean = false,
): boolean {
  const y = +year;
  const m = +month;
  const d = +day;
  const n = +num;

  if (
    !(y >= 0 && y <= 99) ||
    !(
      (m >= 1 && m <= 12) ||
      (m >= 21 && m <= 32) ||
      (m >= 51 && m <= 62) ||
      (m >= 71 && m <= 82)
    ) ||
    !(d >= 1 && d <= 31) ||
    !(n >= 0 && n <= 9999)
  ) {
    return false;
  }

  const dateYear = convertYear(y, historicId);
  const dateMonth = convertMonth(m);

  if (Number.isNaN(Date.parse(`${dateYear}-${dateMonth}-${padStart(day)}`))) {
    return false;
  }

  return historicId ? true : checkSum(year, month, day, num);
}

function checkSum(
  year: string,
  month: string,
  day: string,
  num: string,
): boolean {
  const mod = +`${year}${month}${day}${num.slice(0, 3)}` % 11;
  const lastNum = Number.parseInt(num.slice(3), 10);

  return mod === 10 ? lastNum === 0 : lastNum === mod;
}

export function convertYear(y: number, historicId = false): string {
  return historicId || y > new Date().getFullYear() - 2000
    ? '19' + padStart(y)
    : '20' + padStart(y);
}

export function convertMonth(m: number): string {
  let month = m;
  switch (true) {
    case m >= 1 && m <= 12: {
      month = m;
      break;
    }
    case m >= 21 && m <= 32: {
      month = m - 20;
      break;
    }
    case m >= 51 && m <= 62: {
      month = m - 50;
      break;
    }
    case m >= 71 && m <= 82: {
      month = m - 70;
    }
  }
  return padStart(month);
}

export function splitIdString(str: string) {
  const year = str?.slice(0, 2);
  return {
    year,
    month: str?.slice(2, 4),
    day: str?.slice(4, 6),
    num: str?.slice(6),
  };
}
