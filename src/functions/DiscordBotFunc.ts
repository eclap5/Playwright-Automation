import { app, InvocationContext } from "@azure/functions";
import { Channel, Client, Message, TextChannel } from "discord.js";
import LoggerHandler from "../handlers/loggerHandler";
import { TReservationData } from "../types/types";
import * as dotenv from "dotenv";
import { saveErrorData } from "../handlers/blobStorageHandler";

export async function DiscordBot(blob: Buffer, context: InvocationContext): Promise<void> {
    dotenv.config();
    LoggerHandler.setContext(context);
    LoggerHandler.log(`Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
    
    const botToken: string = process.env.DISCORD_BOT_TOKEN;
    const channelId: string = process.env.DISCORD_CHANNEL_ID;

    const client: Client = new Client({
        intents: ["Guilds", "GuildMessages"]
    });

    if (context.triggerMetadata.name === process.env.BLOB_NAME) {
        LoggerHandler.log(`Skipping blob "${context.triggerMetadata.name}".`);
        return;
    }

    const data: TReservationData = JSON.parse(blob.toString());
    const message: string = `Room: ${data.room}\nDate: ${data.date}\nReserved hours: ${data.reservedHours.join(', ')}`;

    try {
        await client.login(botToken);

        // Channel type can be instance of any type of Discord channel
        const channel: Channel = await client.channels.fetch(channelId);

        if (channel instanceof TextChannel) {
            await channel.send(message);
            LoggerHandler.log('Message sent successfully to Discord channel.');
        }
    } catch (error: any) {
        LoggerHandler.error(`Error occurred: ${error}`);
        await saveErrorData(String(error));
    }
}

app.storageBlob('DiscordBot', {
    path: 'reservation-data/{name}',
    connection: 'STORAGE_CONNECTION_STRING',
    handler: DiscordBot
});
