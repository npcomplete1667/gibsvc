import pg from "pg"
import pool from "./AWS/Pool.js";
import SchemaObject from "./schemas/SchemaObject.js";
import Account from "./schemas/Account.js";
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


function getPubkeyFromUsername(username:string) : Promise<[string, boolean]> {
    let query = "SELECT w.pubkey, acc.pay_dev FROM wallet w JOIN account acc ON w.user_id = acc.id WHERE acc.username=$1"
    return new Promise((resolve, reject) => {
        pool.query(query, [username], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            resolve([query_results.rows[0]["pubkey"], query_results.rows[0]["pay_dev"]])
        })
    })
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

// function createAddToDBQuery(input:SchemaObject) : boolean {
//     console.log("Adding to table:", input.table_name(), '\n', input)
//     let props = Object.keys(input)
//     let values = []
//     for (let i = 1; i < props.length + 1; i++) {
//         values.push(`$${i}`)
//     }

//     const query =`INSERT into ${input.table_name()} (${props.join(', ')}) VALUES (${values.join(',')})`

//     console.log(query)
//     pool.query(query, Object.values(input),
//         (error:Error) => { if (error){
//             console.log("addToDB pool Error:",error)
//             throw error
//         } })
//     return true
// }

export default{
    usernameExists,
    checkPubkeyExists,
    getPubkeyFromUsername,
    createAddToDBQuery,
    sqlTransaction
}