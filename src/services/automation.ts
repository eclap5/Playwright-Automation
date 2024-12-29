import { Browser, BrowserContext, Page, chromium } from "playwright";
import { InvocationContext } from "@azure/functions";
import { createBooking } from "./bookingService";
import { hours } from "../utils/constants";
import { loadPage } from "./authService";
import * as dotenv from "dotenv";

dotenv.config();

const runAutomation = async (azureContext: InvocationContext) => {
    const date: string = '2024-09-30';
    const room: string = 'Yo Saimaa (6)';
    
    const startTime: number = new Date().getTime();

    const browser: Browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await browser.newContext();
    context.setDefaultTimeout(600000);

    const page: Page = await loadPage(context, azureContext);

    for (let i = 0; i < hours.length; i++) {
        await createBooking(page, date, hours[i], room, azureContext);
    }

    await context.close();
    await browser.close();

    const endTime: number = new Date().getTime();

    azureContext.log(`Workflow completed. Execution time: ${endTime - startTime}ms.`);
};

export { runAutomation };