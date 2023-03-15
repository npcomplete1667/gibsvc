import Crypto from 'crypto'
import Sharp from 'sharp'
import { sendFileToServer } from '../S3.js'

async function processImage(req) {
    if (!req.file) { return '' }
    const resizedImage = await resizeImage(1920, 1080, req.file)
    const imageFileName = await sendFileToServer(resizedImage, req.file.mimetype)

    return imageFileName
}

async function resizeImage(_height, _width, image) {
    return await Sharp(image.buffer)
        .resize({ height: _height, width: _width, fit: "contain" })
        .toBuffer()
}

function generateFileName(bytes = 32) {
    return Crypto.randomBytes(bytes).toString('hex')
}

export default {
    processImage,
    resizeImage,
    generateFileName
}