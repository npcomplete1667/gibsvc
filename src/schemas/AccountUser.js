import { v4 as Uuidv4 } from 'uuid';
class AccountUser {
    constructor(req) {
        this.acc_id = Uuidv4()
        this.profile_image_s3_key = req.file
        this.first_name = req.body.first_name
        this.last_name = req.body.last_name
        this.phone_number_country = req.body.phone_numberCountry
        this.phone_number = req.body.phone_number
    }

    table_name() {
        return "account_users"
    }
}

export default AccountUser