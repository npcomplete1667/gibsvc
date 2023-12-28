import { v4 as Uuidv4 } from 'uuid';
class User {
    id;
    username;
    constructor(req) {
        this.id = Uuidv4();
        this.username = req.body.username;
    }
    table_name() {
        return "user";
    }
    getId() {
        return this.id;
    }
}
export default User;
