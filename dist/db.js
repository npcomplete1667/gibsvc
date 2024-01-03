import pool from "./AWS/Pool.js";
import HTTP_RES_CODE from './util/httpResCodes.js';
function usernameExists(username) {
    let query = `SELECT 1 FROM account WHERE username=$1`;
    return new Promise((resolve, reject) => {
        pool.query(query, [username], (error, query_results) => {
            if (error)
                throw error;
            resolve(query_results.rows.length > 0);
        });
    });
}
function checkPubkeyExists(wallet, resp) {
    let query = `SELECT 1 FROM ${wallet.table_name()} WHERE pubkey=$1`;
    let pubkey = wallet.getPubkey();
    return new Promise((resolve, reject) => {
        pool.query(query, [pubkey], (error, query_results) => {
            if (error)
                throw error;
            if (!query_results.rows.length) {
                resolve(false);
            }
            else {
                resolve(true);
                console.log("Pubkey:", pubkey, " already associated with another user");
                resp.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({ message: `Pubkey:${pubkey} already associated with another user` });
            }
        });
    });
}
function getPubkeyFromUsername(username) {
    let query = "SELECT w.pubkey, acc.pay_dev FROM wallet w JOIN account acc ON w.user_id = acc.id WHERE acc.username=$1";
    return new Promise((resolve, reject) => {
        pool.query(query, [username], (error, query_results) => {
            if (error)
                throw error;
            resolve([query_results.rows[0]["pubkey"], query_results.rows[0]["pay_dev"]]);
        });
    });
}
async function getTopSingleTransactions(to_wallet, txn_type, limit) {
    let query = "SELECT t.txn_hash, t.from_wallet, u.username, t.usd_amount FROM transaction t LEFT JOIN (SELECT a.username, w.pubkey FROM account a JOIN wallet w ON a.id = w.user_id) AS u ON u.pubkey=t.from_wallet WHERE t.to_wallet=$1 AND t.txn_type=$2 ORDER BY t.usd_amount DESC LIMIT $3";
    return await new Promise((resolve, reject) => {
        pool.query(query, [to_wallet, txn_type, limit], (error, query_results) => {
            if (error)
                throw error;
            console.log("query res=", query_results);
            let res = [];
            for (let i = 0; i < query_results.rows.length; i++) {
                res.push([
                    query_results.rows[i]["txn_hash"],
                    query_results.rows[i]["from_wallet"],
                    query_results.rows[i]["username"],
                    query_results.rows[i]["usd_amount"]
                ]);
            }
            console.log("getTopSingleTransactions result=", res);
            resolve(res);
        });
    });
}
async function getTopTotalTransactions(to_wallet, txn_type, limit) {
    let query = "SELECT t.from_wallet, u.username, SUM(t.usd_amount) FROM transaction t LEFT JOIN (SELECT a.username, w.pubkey FROM account a JOIN wallet w ON a.id = w.user_id) AS u ON u.pubkey=t.from_wallet WHERE t.to_wallet=$1 AND t.txn_type=$2 GROUP BY t.from_wallet, u.username ORDER BY SUM(t.usd_amount) DESC LIMIT $3";
    return await new Promise((resolve, reject) => {
        pool.query(query, [to_wallet, txn_type, limit], (error, query_results) => {
            if (error)
                throw error;
            let res = [];
            for (let i = 0; i < query_results.rows.length; i++) {
                res.push([query_results.rows[i]["from_wallet"], query_results.rows[i]["username"], query_results.rows[i]["sum"]]);
            }
            resolve(res);
        });
    });
}
async function getTokenUsdPrice(token_account) {
    let query = "SELECT usd_price, cg_id, update_time FROM currency  WHERE token_account=$1";
    let [usd_price, cg_id, update_time] = await new Promise((resolve, reject) => {
        pool.query(query, [token_account], (error, query_results) => {
            if (error)
                throw error;
            resolve([query_results.rows[0]["usd_price"], query_results.rows[0]["cg_id"], query_results.rows[0]["update_time"]]);
        });
    });
    if (new Date().getTime() - update_time.getTime() > 600000 || true) { //600000 = 10 minutes
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cg_id}&vs_currencies=usd&x_cg_demo_api_key=${process.env.COIN_GECKO_API_KEY}`);
        const data = await response.json();
        usd_price = data[cg_id]["usd"];
        query = "UPDATE currency SET usd_price=$1, update_time=$2 WHERE token_account=$3";
        pool.query(query, [usd_price, new Date(), token_account], (error, query_results) => {
            if (error)
                throw error;
            console.log(query_results.rows);
        });
    }
    return usd_price;
}
function createAddToDBQuery(input) {
    console.log("Adding to table:", input.table_name(), '\n', input);
    let props = Object.keys(input);
    let values = [];
    for (let i = 1; i < props.length + 1; i++) {
        values.push(`$${i}`);
    }
    const query = `INSERT into ${input.table_name()} (${props.join(', ')}) VALUES (${values.join(',')})`;
    console.log(query);
    return [query, Object.values(input)];
}
async function sqlTransaction(query_value_objects) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const obj in query_value_objects) {
            await client.query(query_value_objects[obj][0], query_value_objects[obj][1]);
        }
        await client.query('COMMIT');
    }
    catch (e) {
        await client.query('ROLLBACK');
        console.log("SQL Transaction Cancelled", e.message);
        throw e;
    }
    finally {
        client.release();
    }
}
export default {
    usernameExists,
    checkPubkeyExists,
    getPubkeyFromUsername,
    createAddToDBQuery,
    sqlTransaction,
    getTokenUsdPrice,
    getTopSingleTransactions,
    getTopTotalTransactions
};
