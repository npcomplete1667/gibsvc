import { Request} from 'express';
import {SchemaObject} from './index.js';


class Wallet implements SchemaObject{
    private pubkey:string;
    private user_id:string;
    private verified:boolean;

    constructor(req:Request, user_id:string) {
        this.pubkey = req.body.pubkey
        this.user_id = user_id
        this.verified = req.body.verified
    }

    table_name() {
        return "wallet"
    }

    getPubkey(){
        return this.pubkey;
    }
}

export default Wallet