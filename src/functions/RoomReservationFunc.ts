import { app, InvocationContext, Timer } from "@azure/functions";
import { runAutomation } from "../services/automationService";
import LoggerHandler from "../handlers/loggerHandler";
import { getReservationDate, setReservationDate } from "../handlers/blobStorageHandler";
import { formatDate, addDays } from "../utils/dateUtils";
import * as dotenv from "dotenv";

export async function RoomReservation(myTimer: Timer, context: InvocationContext): Promise<void> {
    dotenv.config();
    
    LoggerHandler.setContext(context);
    LoggerHandler.log(`Timer function process triggered at ${new Date().toISOString()}`);

    try {
        LoggerHandler.log('Starting playwright automation.');

        let strDate: string = await getReservationDate();
        
        for (let i = 0; i < parseInt(process.env.DAYS); i++) {
            await runAutomation(formatDate(strDate));
            strDate = addDays(strDate, 1);
        }
        
        await setReservationDate(strDate);

        LoggerHandler.log('Playwright automation completed.');
    } catch (error) {
        LoggerHandler.error(`Error occurred: ${error}`);
    }
}

app.timer('RoomReservation', {
    schedule: process.env.TIMER,
    handler: RoomReservation
});
