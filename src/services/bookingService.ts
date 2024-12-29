import { Page } from 'playwright';
import { formatDate } from '../utils/dateUtils';
import { InvocationContext } from '@azure/functions';

const createBooking = async (page: Page, date: string, time: string, room: string, azureContext: InvocationContext): Promise<void> => {
    const selectService = await page.waitForSelector('text="Student Union House"');
    await selectService.click();

    const loadingIcon = page.getByLabel('Select a date.').locator('span');

    if (await loadingIcon.isVisible()) {
        azureContext.log('Date picker is loading.');
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

    azureContext.log(`Booking created for ${date} at ${time} in ${room}.`);
};

export { createBooking };