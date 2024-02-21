import { v4 as Uuidv4 } from 'uuid';
import { Request} from 'express';
import {SchemaObject} from './index.js';

class Account implements SchemaObject{
    private id:string;
    private username:string;
    private pay_dev:boolean;

    constructor(req:Request) {
        this.id = Uuidv4();
        this.username = req.body.username;
        this.pay_dev = req.body.pay_dev;

    }

    table_name() {
        return "account"
    }

    getId(){
        return this.id;
    }

    getUsername(){
        return this.username;
    }
}

export default Account