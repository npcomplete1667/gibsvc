import DB from '../db.js';
var Type;
(function (Type) {
    Type["Tip"] = "Tip";
    Type["Transfer"] = "Transfer";
    Type["Request"] = "Request";
})(Type || (Type = {}));
class Transaction {
    txn_hash;
    txn_type;
    datetime;
    from_wallet;
    to_wallet;
    description;
    token_account;
    amount;
    usd_amount;
    constructor(req, to_wallet, usd_price) {
        this.txn_hash = req.body.txn_hash;
        this.txn_type = req.body.txn_type;
        this.datetime = new Date();
        this.from_wallet = req.body.from_wallet;
        this.to_wallet = to_wallet;
        this.description = req.body.description;
        this.token_account = req.body.token_account;
        this.amount = req.body.amount;
        this.usd_amount = usd_price * req.body.amount;
    }
    table_name() {
        return "transaction";
    }
    async getUsdAmount() {
        return await DB.getTokenUsdPrice(this.token_account) * this.amount;
    }
}
export default Transaction;
