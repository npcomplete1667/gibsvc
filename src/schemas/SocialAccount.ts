import { v4 as Uuidv4 } from 'uuid';
import { Request} from 'express';
import {SchemaObject} from './index.js';

class SocialAccount implements SchemaObject{
    private id:string;
    private account_id:string;
    private platform:string;
    private username:string | null;
    private handle:string | null;
    private email:string| null;
    private image_url:string| null;

    constructor(
        id:string,
        account_id:string,
        platform:string,
        username:string| null,
        handle:string | null,
        email:string| null,
        image_url:string| null,
        ) {
        this.id = id;
        this.account_id = account_id;
        this.platform = platform;
        this.username = username;
        this.handle = handle;
        this.email = email;
        this.image_url = image_url;
    }

    table_name() {
        return "social_account"
    }
}

export default SocialAccount