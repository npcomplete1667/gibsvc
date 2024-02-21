import pg from "pg"
import pool from "./AWS/Pool.js";
import {SchemaObject} from "./schemas/index.js";
import { Response} from 'express';
import HTTP_RES_CODE from './util/httpResCodes.js'
import Wallet from "./schemas/Wallet.js";


function usernameExists(username:string) : Promise<boolean> {
    let query = `SELECT 1 FROM account WHERE username=$1`
    return new Promise((resolve, reject) => {
        pool.query(query, [username], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            resolve(query_results.rows.length > 0)
        })
    })
}

function checkPubkeyExists(wallet:Wallet, resp:Response) : Promise<boolean> {
    let query = `SELECT 1 FROM ${wallet.table_name()} WHERE pubkey=$1`
    let pubkey = wallet.getPubkey()
    return new Promise((resolve, reject) => {
        pool.query(query, [pubkey], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if (!query_results.rows.length) {
                resolve(false)
            } else {
                resolve(true)
                console.log("Pubkey:",pubkey," already associated with another user")
                resp.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({message:`Pubkey:${pubkey} already associated with another user`})
            }
        })
    })
}

function getPubkey(account_id:string) : Promise<string> {
    let query = "SELECT pubkey FROM wallet WHERE account_id=$1"
    return new Promise((resolve, reject) => {
        pool.query(query, [account_id], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(!query_results.rowCount) reject(`Unable to get pubkey for account_id=${account_id}`);

            resolve(query_results.rows[0]["pubkey"],)
        })
    })
}

function getPayDev(account_id:string) : Promise<boolean> {
    let query = "SELECT pay_dev FROM account WHERE id=$1"
    return new Promise((resolve, reject) => {
        pool.query(query, [account_id], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(!query_results.rowCount) reject(`Unable to get pay_dev for account_id=${account_id}`);

            resolve(query_results.rows[0]["pubkey"],)
        })
    })
}


function getUsername(account_id:string) : Promise<string> {
    const query = "SELECT username FROM account WHERE id=$1"
    return new Promise((resolve, reject) => {
        pool.query(query, [account_id], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(!query_results.rowCount) reject(`Unable to get username for account_id=${account_id}`);
            resolve(query_results.rows[0]["username"])
        })
    })
}

function getSocialAccount(account_id:string, platform:string) : Promise<string[]> {
    const query = "SELECT id, username, handle, image_url FROM social_account WHERE platform=$1 AND account_id=$2"
    return new Promise((resolve, reject) => {
        pool.query(query, [platform, account_id], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(!query_results.rowCount) reject(`No Social Account found for platform=${platform}, account_id=${account_id}`);
            console.log(query_results.rows[0])
            resolve(query_results.rows[0])
        })
    })
}

// function getAccountId(pubkey:string) : Promise<string> {
//     const query = "SELECT w.user_id from wallet w WHERE w.pubkey=$1"
//     return new Promise((resolve, reject) => {
//         pool.query(query, [pubkey], (error:Error, query_results:pg.QueryResult) => {
//             if (error) throw error;
//             if(!query_results.rowCount) reject(`Could not get user id for pubkey=${pubkey}`);
//             resolve(query_results.rows[0]["user_id"])
//         })
//     })
// }



async function getTopSingleTransactions(to_wallet:string, txn_type:string, limit:number) : Promise<[string, string, string, number][]> {
    let query = "SELECT t.txn_hash, t.from_wallet, u.username, t.usd_amount FROM transaction t LEFT JOIN (SELECT a.username, w.pubkey FROM account a JOIN wallet w ON a.id = w.user_id) AS u ON u.pubkey=t.from_wallet WHERE t.to_wallet=$1 AND t.txn_type=$2 ORDER BY t.usd_amount DESC LIMIT $3"
    return await new Promise((resolve, reject) => {
        pool.query(query, [to_wallet,txn_type, limit], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            console.log("query res=", query_results)
            let res: [string, string, string, number][] = [];
            for (let i = 0; i < query_results.rows.length; i++) {
                res.push([
                    query_results.rows[i]["txn_hash"], 
                    query_results.rows[i]["from_wallet"],
                    query_results.rows[i]["username"],
                    query_results.rows[i]["usd_amount"]
                ])
            }
            console.log("getTopSingleTransactions result=", res)
            resolve(res)
        })
    })
}

async function getTopTotalTransactions(to_wallet:string, txn_type:string, limit:number) : Promise<[string, string, number][]> {
    let query = "SELECT t.from_wallet, u.username, SUM(t.usd_amount) FROM transaction t LEFT JOIN (SELECT a.username, w.pubkey FROM account a JOIN wallet w ON a.id = w.user_id) AS u ON u.pubkey=t.from_wallet WHERE t.to_wallet=$1 AND t.txn_type=$2 GROUP BY t.from_wallet, u.username ORDER BY SUM(t.usd_amount) DESC LIMIT $3"
    return await new Promise((resolve, reject) => {
        pool.query(query, [to_wallet, txn_type, limit], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            let res: [string, string, number][] = [];
            for (let i = 0; i < query_results.rows.length; i++) {
                res.push([query_results.rows[i]["from_wallet"], query_results.rows[i]["username"], query_results.rows[i]["sum"]])
            }
            resolve(res)
        })
    })
}


async function getTokenUsdPrice(token_account:string) : Promise<number> {
    console.log("getTokenUsdPrice: token_account=",token_account)
    let query = "SELECT usd_price, cg_id, update_time FROM currency  WHERE token_account=$1"
    let [usd_price, cg_id, update_time] : [number, string, Date] = await new Promise((resolve, reject) => {
        pool.query(query, [token_account], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(!query_results.rowCount) throw Error("Unsupported Currency")
            resolve([query_results.rows[0]["usd_price"], query_results.rows[0]["cg_id"], query_results.rows[0]["update_time"]])
        })
    })
    if (update_time === undefined || new Date().getTime() - update_time.getTime() > 600000){ //600000 = 10 minutes
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cg_id}&vs_currencies=usd&x_cg_demo_api_key=${process.env.COIN_GECKO_API_KEY}`);
        const data = await response.json();
        usd_price = data[cg_id]["usd"]
        query = "UPDATE currency SET usd_price=$1, update_time=$2 WHERE token_account=$3"
        pool.query(query, [usd_price,new Date(),token_account], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            console.log(query_results.rows)
        })
    } 
    return usd_price
}


function createAddToDBQuery(input:SchemaObject) : [string, any[]] {
    console.log("Adding to table:", input.table_name(), '\n', input)
    let props = Object.keys(input)
    let values = []
    for (let i = 1; i < props.length + 1; i++) {
        values.push(`$${i}`)
    }

    const query =`INSERT into ${input.table_name()} (${props.join(', ')}) VALUES (${values.join(',')})`

    console.log(query)
    return [query, Object.values(input)]
}


async function sqlTransaction(query_value_objects:[string, any[]][]){
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        for (const obj in query_value_objects){
            await client.query(query_value_objects[obj][0], query_value_objects[obj][1])
        }
        await client.query('COMMIT')
    } catch (e:any) {
        await client.query('ROLLBACK')
        console.log("SQL Transaction Cancelled", e.message)
        throw e
    } finally {
        client.release()
    }
}


export default{
    usernameExists,
    checkPubkeyExists,
    createAddToDBQuery,
    sqlTransaction,
    getTokenUsdPrice,
    getTopSingleTransactions,
    getTopTotalTransactions,
    getPubkey,
    getPayDev,
    // getAccountId,
    getUsername,
    getSocialAccount,
}