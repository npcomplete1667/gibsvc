import { v4 as Uuidv4 } from 'uuid';
class Account {
    id;
    username;
    pay_dev;
    constructor(req) {
        this.id = Uuidv4();
        this.username = req.body.username;
        this.pay_dev = req.body.pay_dev;
    }
    table_name() {
        return "account";
    }
    getId() {
        return this.id;
    }
    getUsername() {
        return this.username;
    }
}
export default Account;
