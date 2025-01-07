import { Page, BrowserContext, Browser } from 'playwright';

type TReservationData = {
    room: string;
    date: string;
    reservedHours: string[];
};

type TPlaywrightObject = {
    page: Page;
    context: BrowserContext;
    browser: Browser;
};

export { TReservationData, TPlaywrightObject };