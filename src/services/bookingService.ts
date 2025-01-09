import { Page } from 'playwright';
import LoggerHandler from '../handlers/loggerHandler';
import { compareMonths } from '../utils/dateUtils';
import { getKeyVaultSecret } from '../handlers/credentialHandler';

const createBooking = async (page: Page, date: string, time: string, room: string): Promise<boolean> => {
    const fullName: string = process.env.NODE_ENV === 'production' ? await getKeyVaultSecret('user-fullname') : process.env.FULL_NAME;
    const email: string = process.env.NODE_ENV === 'production' ? await getKeyVaultSecret('user-email') : process.env.EMAIL;

    await page.goto(process.env.TARGET_URL);

    const selectService = await page.waitForSelector('text="Student Union House"');
    await selectService.click();

    const difference: number = compareMonths(date);

    if (difference > 0) {
        for (let i = 0; i < difference; i++) {
            LoggerHandler.log("Selecting next month");
            const nextMonth = page.getByLabel('Next month');
            await nextMonth.click();
        }
    }

    const loadingIcon = page.getByLabel('Select a date.').locator('span');

    if (await loadingIcon.isVisible()) {
        LoggerHandler.log('Date picker is loading.');
        await loadingIcon.waitFor({ state: 'hidden' });
    }

    const dateSlot = page.getByLabel(date);
    if (!(await dateSlot.isEnabled())) {
        const msg: string = `Unavailable: Date ${date} is not available.`;
        LoggerHandler.log(msg);
        throw new Error(msg);
    }
    await dateSlot.click();


    const roomSelector = await page.waitForSelector('text="Anyone"');
    await roomSelector.click();

    const selectRoom = await page.waitForSelector(`text="${room}"`);
    await selectRoom.click();

    const timeSlot = page.locator(`text="${time}"`);
    if (!(await timeSlot.isVisible())) {
        LoggerHandler.log(`Time slot ${time} is not available for ${date} in room ${room}.`);
        return false;
    }
    await timeSlot.click();

    const fullNameInput = page.getByPlaceholder('First and last name *'); 
    if (fullNameInput.filter({ hasNotText: fullName })) {
        await fullNameInput.fill(fullName);
    }

    const emailInput = page.getByPlaceholder('Email *');
    if (emailInput.filter({ hasNotText: email })) {
        await emailInput.fill(email);
    }

    const bookButton = await page.waitForSelector('text="Book"');
    await bookButton.click();

    const okButton = await page.waitForSelector('text="OK"');
    await okButton.click();

    await page.getByRole('button', { name: 'New booking' }).click();

    LoggerHandler.log(`Booking created for ${date} at ${time} in ${room}.`);
    return true;
};

export { createBooking };