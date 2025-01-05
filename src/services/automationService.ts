import { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { createBooking } from "./bookingService";
import { hours } from "../utils/constants";
import { loadPage } from "./authService";
import LoggerHandler from "../handlers/loggerHandler";

const runAutomation = async (date: string) => {
    const room: string = 'Yo Saimaa (6)';
    
    const startTime: number = new Date().getTime();

    LoggerHandler.log(`Starting automation for ${date}`);

    chromium.use(StealthPlugin());

    const browser: Browser = await chromium.launch({ 
        headless: process.env.NODE_ENV === 'production' ? true : false,
        args: ['--no-sandbox']
    });
    const context: BrowserContext = await browser.newContext();
    context.setDefaultTimeout(600000);

    let page: Page = await context.newPage();
    page = await loadPage(page);

    for (let i = 0; i < hours.length; i++) {
        await createBooking(page, date, hours[i], room);
    }

    await context.close();
    await browser.close();

    const endTime: number = new Date().getTime();

    LoggerHandler.log(`Workflow completed. Execution time: ${endTime - startTime}ms.`);
};

export { runAutomation };