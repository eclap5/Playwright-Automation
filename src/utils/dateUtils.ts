const formatDate = (strDate: string, locale: string = 'en-US'): string => {
    const date: Date = new Date(strDate);
    const formattedDate: string = new Intl.DateTimeFormat(locale, { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
     }).format(date);
    return `${formattedDate}.`;
};

const formatDateISO = (date: string): string => {
    return new Date(date).toISOString();
};


export { formatDate, formatDateISO }