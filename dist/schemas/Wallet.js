class Wallet {
    pubkey;
    user_id;
    verified;
    constructor(req, user_id) {
        this.pubkey = req.body.pubkey;
        this.user_id = user_id;
        this.verified = req.body.verified;
    }
    table_name() {
        return "wallet";
    }
    getPubkey() {
        return this.pubkey;
    }
}
export default Wallet;
