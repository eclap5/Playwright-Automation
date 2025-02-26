import { Page } from "playwright";
import LoggerHandler from "../handlers/loggerHandler";
import { compareMonths } from "../utils/dateUtils";
import { rooms, hours } from "../utils/constants";
import { TResultMap } from "../types/types";

/**
 * Navigates to the selected date in the datepicker element.
 * @param page - Playwright Page object.
 * @param date - Selected date.
 */
const navigateToDate = async (page: Page, date: string): Promise<void> => {
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
}

/**
 * Maps through all rooms, and stores the rooms and their available hours into a dictionary.
 * @param page - Playwright Page object.
 * @returns A TResultMap[] List object which contains all available rooms and hours. 
 */
const mapRooms = async (page: Page): Promise<TResultMap[]> => {
    const map: TResultMap[] = [];

    let roomSelector = page.getByLabel('Select a staff member (optional). Selected staff: Anyone.');

    // Loop through all available rooms.
    for (const room of rooms) {
        await roomSelector.click();

        const selectRoom = page.getByText(room);
        await selectRoom.click();

        // Loop through all hours and checks the availability.
        for (const hour of hours) {
            const timeSlot = page.locator(`text="${hour}"`);

            if (await timeSlot.isVisible()) {
                let roomEntry: TResultMap | null = map.find((entry) => entry.room === room) || null;

                if (!roomEntry) {
                    roomEntry = {
                        room: room,
                        hours: []
                    };
                    map.push(roomEntry);
                }

                if (!roomEntry.hours.includes(hour)) {
                    roomEntry.hours.push(hour);
                }
            }
        }
        roomSelector = page.getByRole("button", { name: room })
    }
    return map;
}

/**
 * Selects the room based on most available hours.
 * @param page - Playwright Page object.
 * @param date - Selected date.
 * @returns The selected room as a string.
 */
const selectRoom = async (page: Page, date: string): Promise<string> => {
    LoggerHandler.log(`Selecting room for ${date}`);

    await page.goto(process.env.TARGET_URL);

    const selectService = await page.waitForSelector('text="Student Union House"');
    await selectService.click();

    await navigateToDate(page, date);
    const map: TResultMap[] = await mapRooms(page);

    // sort map by most available hours
    const room: string = map.reduce((maxItem, currentItem) => {
        return currentItem.hours.length > maxItem.hours.length ? currentItem : maxItem;
    }, map[0]).room;

    LoggerHandler.log(`Room selection complete with selected room: ${room}`);
    return room;
}

export { selectRoom };