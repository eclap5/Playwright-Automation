import { BrowserContext, Page } from 'playwright';
import LoggerService from './loggerService';

export const loadPage = async (context: BrowserContext): Promise<Page> => {
    LoggerService.log('Starting login process...');
    const page: Page = await context.newPage();

    await page.goto(process.env.URL);
    
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

    LoggerService.log('Login successful.');

    return page;
};