import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    phone_number: String,
    email: String,
    social_media_links: {
        linked_in: String,
        facebook: String,
        instagram: String,
        tiktok: String,
        youtube: String,
        twitter: String,
        discord: String,
        weChat: String,
        whatsApp: String,
        telegram: String,
        twitch: String,
        pintrest: String,
    },
    music_media: {
        spotify: String,
        apple_music: String,
        sound_cloud: String
    },
    payment: {
        venmo: String,
        paypal: String,
        cash_app: String,
        zelle: String
    },
    other: {
        linktree: String,
        calendly: String,
        etsy: String,
        shopify: String,
        openSea: String,
        google_review: String,
        app_link: String,
        booksy: String,
    }

});

export default mongoose.model('User', userSchema);