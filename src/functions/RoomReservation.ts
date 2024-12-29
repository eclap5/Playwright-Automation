import { app, InvocationContext, Timer } from "@azure/functions";
import { runAutomation } from "../services/automation";

export async function RoomReservation(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log(`Timer function process executed at ${new Date().toISOString()}`);

    try {
        context.log('Starting playwright automation...');
        await runAutomation(context);
        context.log('Playwright automation completed.');
    } catch (error) {
        context.error(`Error occurred: ${error}`);
    }
}

app.timer('RoomReservation', {
    schedule: process.env.TIMER,
    handler: RoomReservation
});
