import { v4 as Uuidv4 } from 'uuid';
class Link {
    constructor(user_id, link) {
        this.link_id = Uuidv4()
        this.user_id = user_id
        this.name = link.name
        this.url = link.url
    }

    table_name() {
        return "links"
    }
}

export default Link