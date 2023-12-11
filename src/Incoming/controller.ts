// import Pool from '../External/Pool.js'
// import Queries from './queries.js'
import { Base64 } from 'aws-sdk/clients/ecr.js';
import HTTP_RES_CODE from '../util/httpResCodes.js'
// import { getS3FileUrl } from '../External/S3.js'
// import User from '../schemas/User.js'
// import Connection from '../schemas/Connection.js'
import SolanaPay from "../util/SolanaPay.js"
import { Request, Response } from 'express';


const processCreateSolTransferTransaction = async (req: Request, resp: Response) =>  {
    const fromWallet = req.body.fromWallet
    const toWallet = req.body.toWallet
    const amount = req.body.amount

    console.log("processCreateSolTransferTransaction called with parameters: fromWallet=",fromWallet," ,toWallet=",toWallet," ,amount=", amount)

    // const transactionDescription = req.body.transactionDescription
    //add this info to the db, add the transaction description so you can write what it did

    const base64Transaction:Base64 = await SolanaPay.createSolTransferTransaction(fromWallet, toWallet, amount)

    resp.status(HTTP_RES_CODE.SUCCESS_CREATED).send({transaction: base64Transaction})
}



// async function processReturnForm(req, res) {
//     console.log('Processing Return Form')
//     const user = new User(req);
//     const user_connection = new Connection(req.body.user1_id, user.user_id)


//     if (!(await Queries.phoneNumberExists(user))) {
//         Queries.addToDB(user)
//     }

//     Queries.addToDB(user_connection)

//     res.status(HTTP_RES_CODE.SUCCESS_CREATED).send("Non Acc User Created Successfully!")
// }


export default {
    processCreateSolTransferTransaction
}
