import { Page } from "playwright";
import LoggerHandler from "../handlers/loggerHandler";
import { compareMonths } from "../utils/dateUtils";
import { rooms, hours } from "../utils/constants";
import { TResultMap } from "../types/types";


const selectRoom = async (page: Page, date: string): Promise<string> => {
    LoggerHandler.log(`Selecting room for ${date}`);

    const map: TResultMap[] = [];

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

    let roomSelector = await page.waitForSelector('text="Anyone"');

    for (let i = 0; i < rooms.length; i++) {
        await roomSelector.click();

        const selectRoom = await page.waitForSelector(`text="${rooms[i]}"`);
        await selectRoom.click();

        for (let j = 0; j < hours.length; j++) {
            const timeSlot = page.locator(`text="${hours[j]}"`);

            if (await timeSlot.isVisible()) {
                let roomEntry: TResultMap = map.find((entry) => entry.room === rooms[i]);

                if (!roomEntry) {
                    roomEntry = {
                        room: rooms[i],
                        hours: []
                    };
                    map.push(roomEntry);
                }

                if (!roomEntry.hours.includes(hours[j])) {
                    roomEntry.hours.push(hours[j]);
                }
            }
        }
        roomSelector = await page.waitForSelector(`text="${rooms[i]}"`);
        await roomSelector.click();
    }

    // sort map by most available hours
    const room: string = map.reduce((maxItem, currentItem) => {
        return currentItem.hours.length > maxItem.hours.length ? currentItem : maxItem;
    }, map[0]).room;

    LoggerHandler.log(`Room selection complete with selected room: ${room}`);
    return room;
}

export { selectRoom };