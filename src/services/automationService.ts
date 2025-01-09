import { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { createBooking } from "./bookingService";
import { hours } from "../utils/constants";
import LoggerHandler from "../handlers/loggerHandler";
import { TPlaywrightObject } from "../types/types";
import { saveErrorData } from "../handlers/blobStorageHandler";

const runAutomation = async (page: Page, date: string, room: string): Promise<string[]> => {    
    const startTime: number = new Date().getTime();

    LoggerHandler.log(`Starting automation for ${date}`);

    if (!page.url().includes(process.env.TARGET_URL)) {
        LoggerHandler.log('Page not loaded. Redirecting.');
        await page.goto(process.env.TARGET_URL);
    }

    const reservedHours: string[] = [];

    for (let i = 0; i < hours.length; i++) {
        try {
            await createBooking(page, date, hours[i], room);
            reservedHours.push(hours[i]);
        } catch (error: any) {
            const msg: string = `Error occurred while creating reservation for ${date} at ${hours[i]} in room ${room}: ${error}`;
            LoggerHandler.error(msg);
            await saveErrorData(msg);
        }
    }

    const endTime: number = new Date().getTime();

    LoggerHandler.log(`Workflow completed. Execution time: ${endTime - startTime}ms.`);

    return hours;
};

const initializeBrowserContext = async (): Promise<TPlaywrightObject> => {
    chromium.use(StealthPlugin());
    
    const browser: Browser = await chromium.launch({ 
        headless: process.env.NODE_ENV === 'production' ? true : false
    });
    const context: BrowserContext = await browser.newContext();
    
    context.setDefaultTimeout(600000);
    let page: Page = await context.newPage();

    LoggerHandler.log('Playwright objects initialized.');

    return { page, context, browser };
}

const terminateBrowserContext = async (playwrightObject: TPlaywrightObject): Promise<void> => {
    await playwrightObject.page.close();
    await playwrightObject.context.close();
    await playwrightObject.browser.close();

    LoggerHandler.log('Playwright objects terminated.');
}

export { runAutomation, initializeBrowserContext, terminateBrowserContext };