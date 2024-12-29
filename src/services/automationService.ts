import { Browser, BrowserContext, Page, chromium } from "playwright";
import { createBooking } from "./bookingService";
import { hours } from "../utils/constants";
import { loadPage } from "./authService";
import LoggerService from "../common/loggerService";
import * as dotenv from "dotenv";

dotenv.config();

const runAutomation = async (date: string) => {
    const room: string = 'Yo Saimaa (6)';
    
    const startTime: number = new Date().getTime();

    LoggerService.log(`Starting automation for ${date}`);

    const browser: Browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await browser.newContext();
    context.setDefaultTimeout(600000);

    const page: Page = await loadPage(context);

    for (let i = 0; i < hours.length; i++) {
        await createBooking(page, date, hours[i], room);
    }

    await context.close();
    await browser.close();

    const endTime: number = new Date().getTime();

    LoggerService.log(`Workflow completed. Execution time: ${endTime - startTime}ms.`);
};

export { runAutomation };