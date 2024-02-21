
import { Request} from 'express';
import { v4 as Uuidv4 } from 'uuid';
import DB from '../db.js';

enum Type{
    Tip = "Tip",
    Transfer = "Transfer",
    Request = "Request"
}

class Transaction {
    private id:string;
    private txn_type:string;
    private to_wallet:string;
    private token_account:string;
    private amount:number;
    private usd_amount:number;
    private description:string;
    private from_wallet:string;
    private txn_hash:string;
    private datetime:Date;




    constructor(req:Request, usd_price:number) {
        this.id = Uuidv4();
        this.txn_type = req.body.txn_type;
        this.to_wallet = req.body.to_wallet;
        this.token_account = req.body.token_account;
        this.amount = req.body.amount;
        this.usd_amount = usd_price * req.body.amount;
        this.description = req.body.description;
        this.from_wallet = req.body.from_wallet;
        this.txn_hash = req.body.txn_hash;
        this.datetime = new Date()
    }

    table_name() {
        return "transaction"
    }

    async getUsdAmount(): Promise<number>{
        return await DB.getTokenUsdPrice(this.token_account) * this.amount
    }
}

export default Transaction