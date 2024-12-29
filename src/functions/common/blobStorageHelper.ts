import { BlobDownloadResponseParsed, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import LoggerService from "../../services/loggerService";

const blobServiceClient: BlobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
const containerName: string = process.env.BLOB_STORAGE_CONTAINER_NAME;
const blobName: string = process.env.BLOB_STORAGE_BLOB_NAME;

const setReservationDate = async (date: string): Promise<void> => {
    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blockBlobClient: BlockBlobClient = blobClient.getBlockBlobClient();
    
    await blockBlobClient.upload(date, date.length);
    LoggerService.log(`Date ${date} uploaded successfully to ${blobName}.`);
}

const getReservationDate = async (): Promise<string> => {
    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blockBlobClient: BlockBlobClient = blobClient.getBlockBlobClient();
    
    const downloadBlockBlobResponse: BlobDownloadResponseParsed = await blockBlobClient.download();
    const downloaded: string = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    
    LoggerService.log(`Date ${downloaded} downloaded successfully from ${blobName}.`);
    
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