import Pool from './DBSetup.js'
import Queries from './queries.js'
import HTTP_RES_CODE from './httpResCodes.js'
import { getS3FileUrl } from './S3.js'
import NonAccountUser from './schemas/NonAccountUser.js'

import UserConnection from './schemas/UserConnection.js'

import https from 'https'


async function processReturnForm(req, res) {
    console.log('Processing Return Form')
    const nonAccUser = new NonAccountUser(req);
    console.log("HEY", nonAccUser)
    const user_connection = new UserConnection(req.body.user1_id, nonAccUser.non_acc_id)
    console.log(user_connection)


    if (!(await Queries.phoneNumberExists(nonAccUser))) {
        Queries.addToDB(nonAccUser)
    }

    Queries.addToDB(user_connection)

    res.status(HTTP_RES_CODE.SUCCESS_CREATED).send("Non Acc User Created Successfully!")
}


async function getAccUserById(req, res) {
    console.log('getting acc user by id')
    const acc_id = req.params.acc_id;
    const user = await Queries.getUserById(acc_id)
    //at this point its an image_url but is put into the s3Key spot
    if (user.profile_image_s3_key)
        user.profile_image_s3_key = await getS3FileUrl(user.profile_image_s3_key);
    user.links = await Queries.getUserLinks(acc_id)

    user.vCard = await addVCardToUser(user)
    res.status(HTTP_RES_CODE.SUCCESS_OK).json(user)
}

async function addVCardToUser(user) {
    const vCardImage = await makeVCardImage(user.profile_image_s3_key)
    let vCardLinks = []
    for (const link of user.links) {
        vCardLinks.push(`URL;TYPE=${link.name}:${link.url}`)
    }
    let vCard =
        `BEGIN:VCARD
VERSION:3.0
FN;CHARSET=UTF-8:${user.first_name} ${user.last_name}
N;CHARSET=UTF-8:${user.last_name};${user.first_name};;;
TEL;TYPE=CELL:${user.phone_number}
${vCardLinks.join('\n')}
${vCardImage}
N:${user.last_name};${user.first_name};;;;
END:VCARD`

    return "data:text/x-vcard;base64," + Buffer.from(vCard).toString('base64')

}

function makeVCardImage(image_url) {
    return new Promise((resolve, reject) => {
        https.get(image_url, (image_resp) => {
            image_resp.setEncoding('base64');

            let body = "PHOTO;ENCODING=b;TYPE=" + image_resp.headers["content-type"].slice(6).toUpperCase() + ":";
            image_resp.on('data', (data) => { body += data });
            image_resp.on('end', () => {
                resolve(body)
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
    })
}




export default {
    processReturnForm,
    getAccUserById,

}
