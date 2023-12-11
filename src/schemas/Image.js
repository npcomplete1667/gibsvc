import { v4 as Uuidv4 } from 'uuid';
class Image {
    constructor(user_id, image_type , s3_key) {
        this.image_id = Uuidv4()
        this.user_id = user_id
        this.image_type = image_type
        this.s3_key = s3_key
    }

    table_name() {
        return "images"
    }
}

export default Image

// image_type: 
//  profile image = 0