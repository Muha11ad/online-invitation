export function ddmmyyyyToInputDate(ddmmyyyy: string): string {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(ddmmyyyy.trim());
  if (!match) {
    return "";
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function inputDateToDdmmyyyy(inputDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inputDate.trim());
  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
