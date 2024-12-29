import { InvocationContext } from '@azure/functions';
import { BrowserContext, Page } from 'playwright';

export const loadPage = async (context: BrowserContext, azureContext: InvocationContext): Promise<Page> => {
    azureContext.log('Starting login process...');
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

    azureContext.log('Login successful.');

    return page;
};