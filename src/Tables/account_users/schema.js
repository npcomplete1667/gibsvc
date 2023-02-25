import { v4 as Uuidv4 } from 'uuid';
class AccountUser {
    constructor(request) {
        this.userId = Uuidv4(),
            this.first_name = request.body.first_name,
            this.last_name = request.body.last_name,
            this.phone_number = request.body.phone_number,
            this.profile_image = request.body.profile_image
    }
}

export default AccountUser