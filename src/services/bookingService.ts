import { Page } from 'playwright';
import LoggerService from './loggerService';
import { compareMonths } from '../utils/dateUtils';

const createBooking = async (page: Page, date: string, time: string, room: string): Promise<void> => {
    const selectService = await page.waitForSelector('text="Student Union House"');
    await selectService.click();

    const difference: number = compareMonths(date);

    if (difference > 0) {
        for (let i = 0; i < difference; i++) {
            LoggerService.log("Selecting next month");
            const nextMonth = page.getByLabel('Next month');
            await nextMonth.click();
        }
    }

    const loadingIcon = page.getByLabel('Select a date.').locator('span');

    if (await loadingIcon.isVisible()) {
        LoggerService.log('Date picker is loading.');
        await loadingIcon.waitFor({ state: 'hidden' });
    }

    await page.getByLabel(date).click();

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

    LoggerService.log(`Booking created for ${date} at ${time} in ${room}.`);
};

export { createBooking };