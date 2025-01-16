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

type TResultMap = {
    room: string;
    hours: string[];
}

export { TReservationData, TPlaywrightObject, TResultMap };