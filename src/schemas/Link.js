import { v4 as Uuidv4 } from 'uuid';
class Link {
    constructor(acc_id, link) {
        this.link_id = Uuidv4()
        this.acc_id = acc_id
        this.name = link.link_name
        this.url = link.link_url
    }

    table_name() {
        return "links"
    }
}

export default Link