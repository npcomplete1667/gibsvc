import { v4 as Uuidv4 } from 'uuid';
class UserConnection {
    constructor(user1_id, user2_id) {
        this.connection_id = Uuidv4(),
            this.user1_id = user1_id,
            this.user2_id = user2_id
    }

    table_name() {
        return "user_connections"
    }
}

export default UserConnection