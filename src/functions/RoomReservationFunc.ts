import { app, InvocationContext, Timer } from "@azure/functions";
import { runAutomation, initializeBrowserContext, terminateBrowserContext } from "../services/automationService";
import LoggerHandler from "../handlers/loggerHandler";
import { getReservationDate, setReservationDate, saveReservationData, saveErrorData } from "../handlers/blobStorageHandler";
import { formatDate, addDays } from "../utils/dateUtils";
import * as dotenv from "dotenv";
import { TPlaywrightObject, TReservationData, TResultMap } from "../types/types";
import { login } from "../services/authService";

export async function RoomReservation(myTimer: Timer, context: InvocationContext): Promise<void> {
    dotenv.config();
    
    LoggerHandler.setContext(context);
    LoggerHandler.log(`Timer function process triggered at ${new Date().toISOString()}`);

    try {
        LoggerHandler.log('Starting playwright automation.');

        let strDate: string = await getReservationDate();
        
        const playwrightObject: TPlaywrightObject = await initializeBrowserContext();

        playwrightObject.page = await login(playwrightObject.page);

        for (let i = 0; i < parseInt(process.env.TARGET_DAYS); i++) {
            const reservation: TResultMap = await runAutomation(playwrightObject.page, formatDate(strDate));

            const reservationData: TReservationData = {
                room: reservation.room,
                date: strDate,
                reservedHours: reservation.hours
            }; 

            const data: string = JSON.stringify(reservationData);
            await saveReservationData(data, strDate);

            strDate = addDays(strDate, 1);
            await setReservationDate(strDate);
        }
        
        await terminateBrowserContext(playwrightObject);

        LoggerHandler.log('Playwright automation completed.');
    } catch (error: any) {
        LoggerHandler.error(`Error occurred: ${error}`);
        await saveErrorData(String(error));
        throw error; // Rethrow the error to trigger retry policy
    }
}

app.timer('RoomReservation', {
    schedule: process.env.TIMER_INTERVAL,
    retry: {
        strategy: 'fixedDelay',
        delayInterval: {
            minutes: 15
        },
        maxRetryCount: 3
    },
    handler: RoomReservation
});
