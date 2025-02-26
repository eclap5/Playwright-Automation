import { Page } from "playwright";
import LoggerHandler from "../handlers/loggerHandler";
import { compareMonths } from "../utils/dateUtils";
import { rooms, hours } from "../utils/constants";
import { TResultMap } from "../types/types";

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

const mapRooms = async (page: Page): Promise<TResultMap[]> => {
    const map: TResultMap[] = [];

    let roomSelector = await page.waitForSelector('text="Anyone"');

    for (const room of rooms) {
        await roomSelector.click();

        const selectRoom = await page.waitForSelector(`text="${room}"`);
        await selectRoom.click();

        for (const hour of hours) {
            const timeSlot = page.locator(`text="${hour}"`);

            if (await timeSlot.isVisible()) {
                let roomEntry: TResultMap = map.find((entry) => entry.room === hour);

                if (!roomEntry) {
                    const roomEntry: TResultMap = {
                        room: hour,
                        hours: []
                    };
                    map.push(roomEntry);
                }

                if (!roomEntry.hours.includes(hour)) {
                    roomEntry.hours.push(hour);
                }
            }
        }
        roomSelector = await page.waitForSelector(`text="${room}"`);
        await roomSelector.click();
    }
    return map;
}

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