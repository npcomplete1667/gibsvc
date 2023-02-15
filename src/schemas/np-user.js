import mongoose from "mongoose";

const npuserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    phone_number: String,
});

export default mongoose.model('NPUser', npuserSchema);