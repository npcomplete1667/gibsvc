import { v4 as Uuidv4 } from 'uuid';
class User {
    constructor(req) {
        this.user_id = req.params.user_id || Uuidv4()
        this.first_name = req.body.first_name
        this.last_name = req.body.last_name
        this.phone_number_country = req.body.phone_numberCountry
        this.phone_number = req.body.phone_number
        this.email = req.body.email
        this.has_account = req.body.has_account
    }

    table_name() {
        return "users"
    }
}

export default User