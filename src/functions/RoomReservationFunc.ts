import { app, InvocationContext, Timer } from "@azure/functions";
import { runAutomation, initializeBrowserContext, terminateBrowserContext } from "../services/automationService";
import LoggerHandler from "../handlers/loggerHandler";
import { getReservationDate, setReservationDate, saveReservationData, saveErrorData } from "../handlers/blobStorageHandler";
import { formatDate, addDays } from "../utils/dateUtils";
import * as dotenv from "dotenv";
import { TPlaywrightObject, TReservationData } from "../types/types";
import { login } from "../services/authService";

export async function RoomReservation(myTimer: Timer, context: InvocationContext): Promise<void> {
    dotenv.config();
    
    LoggerHandler.setContext(context);
    LoggerHandler.log(`Timer function process triggered at ${new Date().toISOString()}`);

    try {
        LoggerHandler.log('Starting playwright automation.');

        let strDate: string = await getReservationDate();
        const room: string = process.env.TARGET_ROOM;
        
        const playwrightObject: TPlaywrightObject = await initializeBrowserContext();

        playwrightObject.page = await login(playwrightObject.page);

        for (let i = 0; i < parseInt(process.env.DAYS); i++) {
            const reservedHours: string[] = await runAutomation(playwrightObject.page, formatDate(strDate), room);

            const reservationData: TReservationData = {
                room: room,
                date: strDate,
                reservedHours: reservedHours
            }; 

            const data: string = JSON.stringify(reservationData);
            await saveReservationData(data, strDate);

            strDate = addDays(strDate, 1);
            await setReservationDate(strDate);
        }
        
        await terminateBrowserContext(playwrightObject);

        LoggerHandler.log('Playwright automation completed.');
    } catch (error) {
        LoggerHandler.error(`Error occurred: ${error}`);
        await saveErrorData(error);
    }
}

app.timer('RoomReservation', {
    schedule: process.env.TIMER_INTERVAL,
    handler: RoomReservation
});
