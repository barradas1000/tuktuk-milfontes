export const safeParseDate = (dateInput: string | number | Date | null | undefined): Date | null => {
  if (!dateInput) {
    return null;
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
};

export const isValidDate = (date: any): date is Date => date instanceof Date && !isNaN(date.getTime());