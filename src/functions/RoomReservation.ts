import { app, InvocationContext, Timer } from "@azure/functions";
import { runAutomation } from "../services/automationService";
import LoggerService from "../services/loggerService";
import { getReservationDate, setReservationDate } from "./common/blobStorageHelper";
import { formatDate, addDays } from "../utils/dateUtils";

export async function RoomReservation(myTimer: Timer, context: InvocationContext): Promise<void> {
    LoggerService.setContext(context);
    LoggerService.log(`Timer function process triggered at ${new Date().toISOString()}`);

    try {
        LoggerService.log('Starting playwright automation.');

        let strDate: string = await getReservationDate();

        
        for (let i = 0; i < parseInt(process.env.DAYS); i++) {
            await runAutomation(formatDate(strDate));
            strDate = addDays(strDate, 1);
        }
        
        await setReservationDate(strDate);

        LoggerService.log('Playwright automation completed.');
    } catch (error) {
        LoggerService.error(`Error occurred: ${error}`);
    }
}

app.timer('RoomReservation', {
    schedule: process.env.TIMER,
    handler: RoomReservation
});
