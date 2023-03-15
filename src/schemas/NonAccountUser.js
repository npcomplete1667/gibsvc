import { v4 as Uuidv4 } from 'uuid';
class NonAccountUser {
    constructor(request) {
        this.non_acc_id = Uuidv4()
        this.first_name = request.body.first_name
        this.last_name = request.body.last_name
        this.phone_number_country = request.body.phone_numberCountry
        this.phone_number = request.body.phone_number
    }

    table_name() {
        return "non_account_users"
    }
}

export default NonAccountUser