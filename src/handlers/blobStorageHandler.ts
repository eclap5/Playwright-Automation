import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import LoggerHandler from "./loggerHandler";
import { getCurrentDate } from "../utils/dateUtils";

const getDateConfigClient = (): BlockBlobClient => {
    const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
    const containerName: string = process.env.BLOB_STORAGE_CONTAINER_NAME;
    const blobName: string = process.env.BLOB_STORAGE_BLOB_NAME;

    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blockBlobClient: BlockBlobClient = blobClient.getBlockBlobClient();
    return blockBlobClient;
}

const setReservationDate = async (date: string): Promise<void> => {
    const blockBlobClient: BlockBlobClient = getDateConfigClient();
    await blockBlobClient.upload(date, date.length);
    LoggerHandler.log(`Date ${date} uploaded successfully to ${blockBlobClient.name}.`);
}

const getReservationDate = async (): Promise<string> => {
    const blockBlobClient: BlockBlobClient = getDateConfigClient();
    
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

const saveReservationData = async (data: string, date: string): Promise<void> => {
    const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
    const containerName: string = process.env.BLOB_STORAGE_CONTAINER_NAME;

    const folderName: string = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const blobName: string = `Reservation-${date}.json`;

    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(`${folderName}/${blobName}`);

    await blobClient.upload(data, data.length);
    LoggerHandler.log(`Reservation data uploaded successfully to ${blobClient.name}.`);
}

const saveErrorData = async (data: string): Promise<void> => {
    const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
    const containerName: string = process.env.BLOB_STORAGE_ERROR_CONTAINER_NAME;

    const blobName: string = `Error-${getCurrentDate()}.json`;

    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blobClient.upload(data, data.length);
    LoggerHandler.log(`Error message uploaded to ${blobClient.name}.`);
}

export { setReservationDate, getReservationDate, saveReservationData, saveErrorData };