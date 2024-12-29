import { BrowserContext, Page } from 'playwright';
import LoggerService from '../common/loggerService';
import { getKeyVaultSecret } from '../common/credentialHandler';

export const loadPage = async (context: BrowserContext): Promise<Page> => {
    LoggerService.log('Starting login process.');

    const email: string = process.env.NODE_ENV === 'production' ? await getKeyVaultSecret('user-email') : process.env.EMAIL;
    const password: string = process.env.NODE_ENV === 'production' ? await getKeyVaultSecret('user-password') : process.env.PASSWORD;

    const page: Page = await context.newPage();

    await page.goto(process.env.URL);
    
    const emailInput = await page.waitForSelector('input[name="loginfmt"]');
    await emailInput.fill(email);

    const nextButton = await page.waitForSelector('text="Next"');
    await nextButton.click();

    const passwordInput = await page.waitForSelector('input[id="passwordInput"]');
    await passwordInput.fill(password);

    const signInButton = await page.waitForSelector('text="Sign in"');
    await signInButton.click();

    const isMyDeviceButton = await page.waitForSelector('text="Yes, this is my device"');
    await isMyDeviceButton.click();

    const staySignedInButton = await page.waitForSelector('text="Yes"');
    await staySignedInButton.click();

    LoggerService.log('Login successful.');

    return page;
};