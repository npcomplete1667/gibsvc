// import Pool from '../External/Pool.js'
// import Queries from './queries.js'
import { Base64 } from 'aws-sdk/clients/ecr.js';
import HTTP_RES_CODE from '../util/httpResCodes.js'
// import { getS3FileUrl } from '../External/S3.js'
// import Connection from '../schemas/Connection.js'
import SolanaPay from "../util/SolanaPay.js"
import { Request, Response } from 'express';
import DB from '../db.js';
import Account from '../schemas/Account.js';
import Wallet from '../schemas/Wallet.js';
import pool from "../AWS/Pool.js";



const processCreateSolTransferTransaction = async (request: Request, response: Response) =>  {
    console.log("processCreateSolTransferTransaction called with parameters: req.body=",request.body)
    const from_wallet:string = request.body.from_wallet;
    const to_username:string = request.body.to_username;
    const amount:number = request.body.amount;

    if(!await DB.usernameExists(to_username)){
        console.log("Username",to_username," does not exist")
        response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({message:`Username ${to_username} does not exist`})
        return
    }

    
    // const transactionDescription = req.body.transactionDescription
    // add this info to the db, add the transaction description so you can write what it did
    const [to_wallet, pay_dev]= await DB.getPubkeyFromUsername(to_username)
    console.log(to_wallet)


    const base64Transaction:Base64 = await SolanaPay.createSolTransferTransaction(from_wallet, to_wallet, amount, pay_dev)

    response.status(HTTP_RES_CODE.SUCCESS_OK).send({message: base64Transaction})
}



const processSaveUser = async (request: Request, response: Response) =>  {
    console.log("processSaveUser called with parameters: req.body=",request.body)
    const account = new Account(request);
    const wallet = new Wallet(request, account.getId());

    try{
        await DB.sqlTransaction([DB.createAddToDBQuery(account), DB.createAddToDBQuery(wallet)])
        response.status(HTTP_RES_CODE.SUCCESS_CREATED).send({"message": "Successfully Saved Account"})
    } catch(e:any){
        response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
    }
}



// async function processReturnForm(req, res) {
//     console.log('Processing Return Form')
//     const user = new Account(req);
//     const user_connection = new Connection(req.body.user1_id, user.user_id)


//     if (!(await Queries.phoneNumberExists(user))) {
//         Queries.addToDB(user)
//     }

//     Queries.addToDB(user_connection)

//     res.status(HTTP_RES_CODE.SUCCESS_CREATED).send("Non Acc Account Created Successfully!")
// }


export default {
    processCreateSolTransferTransaction,
    processSaveUser,
}
