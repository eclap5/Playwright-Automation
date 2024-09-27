import { Browser, BrowserContext, Page, chromium } from "playwright";
import { formatDate } from "./src/helper";
import { hours } from "./src/constants";
import dotenv from "dotenv";

dotenv.config();

const automation = async () => {
    const date: string = '2024-09-27';
    const room: string = 'Yo Saimaa (6)';
    
    const startTime: number = new Date().getTime();

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

    console.log(`Workflow completed. Execution time: ${endTime - startTime}ms.`);
};

const loadPage = async (context: BrowserContext) => {
    const page: Page = await context.newPage();

    await page.goto('https://outlook.office365.com/owa/calendar/StudentUnionHousereservations@lut.onmicrosoft.com/bookings/');
    
    const emailInput = await page.waitForSelector('input[name="loginfmt"]');
    await emailInput.fill(`${process.env.EMAIL}`);

    const nextButton = await page.waitForSelector('text="Next"');
    await nextButton.click();

    const passwordInput = await page.waitForSelector('input[id="passwordInput"]');
    await passwordInput.fill(`${process.env.PASSWORD}`);

    const signInButton = await page.waitForSelector('text="Sign in"');
    await signInButton.click();

    const isMyDeviceButton = await page.waitForSelector('text="Yes, this is my device"');
    await isMyDeviceButton.click();

    const staySignedInButton = await page.waitForSelector('text="Yes"');
    await staySignedInButton.click();

    return page;
};

const createBooking = async (page: Page, date: string, time: string, room: string) => {
    const selectService = await page.waitForSelector('text="Student Union House"');
    await selectService.click();

    const loadingIcon = page.getByLabel('Select a date.').locator('span');

    if (await loadingIcon.isVisible()) {
        console.log('Date picker is loading.');
        await loadingIcon.waitFor({ state: 'hidden' });
    }

    await page.getByLabel(formatDate(date)).click();

    const roomSelector = await page.waitForSelector('text="Anyone"');
    await roomSelector.click();

    const selectRoom = await page.waitForSelector(`text="${room}"`);
    await selectRoom.click();

    await page.locator(`text="${time}"`).click();

    const fullNameInput = page.getByPlaceholder('First and last name *'); 
    if (fullNameInput.filter({ hasNotText: `${process.env.FULL_NAME}` })) {
        await fullNameInput.fill(`${process.env.FULL_NAME}`);
    }

    const emailInput = page.getByPlaceholder('Email *');
    if (emailInput.filter({ hasNotText: `${process.env.EMAIL}` })) {
        await emailInput.fill(`${process.env.EMAIL}`);
    }

    const bookButton = await page.waitForSelector('text="Book"');
    await bookButton.click();

    const okButton = await page.waitForSelector('text="OK"');
    await okButton.click();

    await page.getByRole('button', { name: 'New booking' }).click();

    console.log(`Booking created for ${date} at ${time} in ${room}.`);
};

automation();