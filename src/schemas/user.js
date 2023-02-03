import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    phone_number: String
});

export default mongoose.model('User', userSchema);