import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import LoggerHandler from "./loggerHandler";
import { getCurrentDate, getYearMonthFolderName } from "../utils/dateUtils";

const getBlobClient = (containerName: string, blobName: string): BlockBlobClient => {
    const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient;
}

const setReservationDate = async (date: string): Promise<void> => {
    const blockBlobClient: BlockBlobClient = getBlobClient(process.env.CONTAINER_NAME, process.env.BLOB_NAME);
    await blockBlobClient.upload(date, date.length);
    LoggerHandler.log(`Date ${date} uploaded successfully to ${blockBlobClient.name}.`);
}

const getReservationDate = async (): Promise<string> => {
    const blockBlobClient: BlockBlobClient = getBlobClient(process.env.CONTAINER_NAME, process.env.BLOB_NAME);
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
    const folderName: string = getYearMonthFolderName();
    const blobName: string = `Reservation-${date}.json`;
    const blobClient: BlockBlobClient = getBlobClient(process.env.CONTAINER_NAME, `${folderName}/${blobName}`);

    await blobClient.upload(data, data.length);
    LoggerHandler.log(`Reservation data uploaded successfully to ${blobClient.name}.`);
}

const saveErrorData = async (data: string): Promise<void> => {
    const blobName: string = `Error-${getCurrentDate()}.json`;
    const blobClient: BlockBlobClient = getBlobClient(process.env.ERROR_CONTAINER_NAME, blobName);

    await blobClient.upload(data, data.length);
    LoggerHandler.log(`Error message uploaded to ${blobClient.name}.`);
}

export { setReservationDate, getReservationDate, saveReservationData, saveErrorData };