
import { Request} from 'express';
import DB from '../db.js';

enum Type{
    Tip = "Tip",
    Transfer = "Transfer",
    Request = "Request"
}

class Transaction {
    private txn_hash:string;
    private txn_type:string;
    private datetime:Date;
    private from_wallet:string;
    private to_wallet:string;
    private description:string;
    private token_account:string;
    private amount:number;
    private usd_amount:number;


    constructor(req:Request, to_wallet:string, usd_price:number) {
        this.txn_hash = req.body.txn_hash;
        this.txn_type = req.body.txn_type;
        this.datetime = new Date();
        this.from_wallet = req.body.from_wallet;
        this.to_wallet = to_wallet;
        this.description = req.body.description;
        this.token_account = req.body.token_account;
        this.amount = req.body.amount;
        this.usd_amount = usd_price * req.body.amount;
    }

    table_name() {
        return "transaction"
    }

    async getUsdAmount(): Promise<number>{
        return await DB.getTokenUsdPrice(this.token_account) * this.amount
    }
}

export default Transaction