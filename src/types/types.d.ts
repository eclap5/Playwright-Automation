import { Page, BrowserContext, Browser } from 'playwright';

export type TReservationData = {
    room: string;
    date: string;
    reservedHours: string[];
};

export type TPlaywrightObject = {
    page: Page;
    context: BrowserContext;
    browser: Browser;
};

export type TResultMap = {
    room: string;
    hours: string[];
};
