import { Page } from 'playwright';
import LoggerHandler from '../handlers/loggerHandler';
import { getKeyVaultSecret } from '../handlers/credentialHandler';

const login = async (page: Page): Promise<Page> => {
    LoggerHandler.log('Starting login process.');
    
    try {
        const email: string = process.env.NODE_ENV === 'production' ? await getKeyVaultSecret('user-email') : process.env.EMAIL;
        const password: string = process.env.NODE_ENV === 'production' ? await getKeyVaultSecret('user-password') : process.env.PASSWORD;
        
        LoggerHandler.log(`Navigating to ${process.env.TARGET_URL}`);
        try {
            await page.goto(process.env.TARGET_URL, { 
                waitUntil: 'domcontentloaded', 
                timeout: 60000 
            });
            
            // Initial load state wait for page to be ready
            await page.waitForLoadState('networkidle')
                .catch(() => LoggerHandler.log('Network did not reach idle state, continuing anyway'));
            
            await page.waitForTimeout(2000);
            
            LoggerHandler.log(`Current URL after navigation: ${page.url()}`);
        } catch (navigationError) {
            LoggerHandler.warn(`Initial navigation issue: ${navigationError.message}`);
        }
        
        const emailInput = await page.waitForSelector('input[name="loginfmt"]');
        await emailInput.fill(email);

        const nextButton = await page.waitForSelector('text="Next"');
        await nextButton.click();
        
        // Wait after clicking Next - this triggers navigation to password screen
        await page.waitForLoadState('networkidle');

        const passwordInput = await page.waitForSelector('input[id="passwordInput"]');
        await passwordInput.fill(password);

        const signInButton = await page.waitForSelector('text="Sign in"');
        await signInButton.click();
        
        // Wait after sign in - this triggers navigation to device confirmation
        await page.waitForLoadState('networkidle');

        const isMyDeviceButton = await page.waitForSelector('text="Yes, this is my device"');
        await isMyDeviceButton.click();

        const staySignedInButton = await page.waitForSelector('text="Yes"');
        await staySignedInButton.click();

        // Wait for login to be confirmed
        await page.waitForLoadState('networkidle');

        LoggerHandler.log('Login successful.');
        LoggerHandler.log(`Final URL after login: ${page.url()}`);

        return page;
    } catch (error: any) {
        const msg: string = `Error occurred while logging in: ${error}`;
        LoggerHandler.error(msg);
        throw new Error(msg);
    }
}

export { login };