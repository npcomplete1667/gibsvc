// import { S3Client } from "@aws-sdk/client-s3";
// import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
// import ImageUtil from "../util/ImageUtil.js";

// export const S3 = new S3Client({
//     region: process.env.S3_REGION,
//     credentials: {
//         accessKeyId: process.env.S3_ACCESS_KEY,
//         secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     },
// })

// export async function sendFileToServer(fileBuffer, fileType) {
//     const fileName = ImageUtil.generateFileName()
//     const uploadParams = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Body: fileBuffer,
//         Key: fileName,
//         ContentType: fileType
//     }

//     await S3.send(new PutObjectCommand(uploadParams))

//     return fileName
// }

// export async function getS3FileUrl(fileName) {
//     return await getSignedUrl(
//         S3,
//         new GetObjectCommand({
//             Bucket: process.env.S3_BUCKET_NAME,
//             Key: fileName,
//             expiresIn: 600,
//             ResponseContentDisposition: 'attachment; filename ="profile_image.jpg"'
//         })
//     )
// }

// //helpers



