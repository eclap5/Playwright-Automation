const formatDate = (strDate: string, locale: string = 'en-US'): string => {
    const date: Date = new Date(strDate);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    }

    const formattedDate: string = new Intl.DateTimeFormat(locale, options).format(date);
    return `${formattedDate}.`;
};

// Adds days to a date string preserving the original format 'YYYY-MM-DD'.
const addDays = (strDate: string, days: number): string => {
    const date = new Date(strDate);
    date.setDate(date.getDate() + days);

    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const compareMonths = (month: string): number => {
    const today: Date = new Date();
    const currentMonth: number = today.getMonth() + 1;
    const currentYear: number = today.getFullYear();

    const targetDate: Date = new Date(month);
    const targetMonth: number = targetDate.getMonth() + 1;
    const targetYear: number = targetDate.getFullYear();
    
    const difference: number = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
    return difference;
}

export { formatDate, addDays, compareMonths };