import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import LoggerHandler from "./loggerHandler";

const getClient = (): BlockBlobClient => {
    const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
    const containerName: string = process.env.BLOB_STORAGE_CONTAINER_NAME;
    const blobName: string = process.env.BLOB_STORAGE_BLOB_NAME;

    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blockBlobClient: BlockBlobClient = blobClient.getBlockBlobClient();
    return blockBlobClient;
}

const setReservationDate = async (date: string): Promise<void> => {
    const blockBlobClient: BlockBlobClient = getClient();
    await blockBlobClient.upload(date, date.length);
    LoggerHandler.log(`Date ${date} uploaded successfully to ${blockBlobClient.name}.`);
}

const getReservationDate = async (): Promise<string> => {
    const blockBlobClient: BlockBlobClient = getClient();
    
    const downloadBlockBlobResponse: BlobDownloadResponseParsed = await blockBlobClient.download();
    const downloaded: string = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    
    LoggerHandler.log(`Date ${downloaded} downloaded successfully from ${blockBlobClient.name}.`);
    
    return downloaded;
}

const streamToString = async (readableStream: NodeJS.ReadableStream): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        readableStream.on("data", chuck => chunks.push(chuck));
        readableStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        readableStream.on("error", reject);
    });
}

export { setReservationDate, getReservationDate };