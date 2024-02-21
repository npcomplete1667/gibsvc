import { Router } from 'express'
import Multer from 'multer'
import DB from './db.js';
import { Base64 } from 'aws-sdk/clients/ecr.js';
import {HTTP_RES_CODE, SolanaPay} from "./util/index.js"
import {Account, Wallet, Transaction, SocialAccount} from './schemas/index.js'
import pool from "./AWS/Pool.js";
import pg from "pg"






const router = Router()
//This allows you to temporarily hold the image in storage so you can modify it before sending it to s3
const storage = Multer.memoryStorage()
const upload = Multer({ storage: storage })



router.get('/', ((req, res) => { res.send("connected to api") }))

//THIS IS GOOD, it just uses getAccountId which was removed so need to fix
// router.post('/create-sol-transfer-transaction', 
//     ( async (request, response) => { 
//         console.log(`/create-sol-transfer-transaction req.body=${request.body}`)
//         const {from_wallet,to_username,amount} = request.body;

//         if(!await DB.usernameExists(to_username)){
//             console.log("Username",to_username," does not exist")
//             response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({message:`Username ${to_username} does not exist`})
//             return
//         }
        
//         //nit: this could be optimized.  wait for account_id but then call the other two at the same time after
//         const account_id = await DB.getAccountId(to_username)
//         const to_wallet = await DB.getPubkey(account_id)
//         const pay_dev = await DB.getPayDev(account_id)
//         const base64Transaction:Base64 = await SolanaPay.createSolTransferTransaction(from_wallet, to_wallet, amount, pay_dev)

//         response.status(HTTP_RES_CODE.SUCCESS_OK).send({message: base64Transaction})
//         }
//     )
// )

router.post('/save-user', 
    ( async (request, response) => { 
        console.log(`/save-user req.body=${request.body}`)
        const account = new Account(request);
        const wallet = new Wallet(request, account.getId());
    
        try{
            await DB.sqlTransaction([DB.createAddToDBQuery(account), DB.createAddToDBQuery(wallet)])
            response.status(HTTP_RES_CODE.SUCCESS_CREATED).send({"message": "Successfully Saved Account"})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)



router.post('/save-transaction', 
    ( async (request, response) => { 
        console.log(`/save-transaction req.body=${request.body}`)
        const usd_price = await DB.getTokenUsdPrice(request.body.token_account)
        const transaction = new Transaction(request, usd_price);

        try{
            const [query, values] = DB.createAddToDBQuery(transaction)
            pool.query(query, values)
            response.status(HTTP_RES_CODE.SUCCESS_CREATED).send({"message": "Successfully Saved Transaction"})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)

// router.post('/save-single-image', upload.single('img'), Controller.processSaveImage)



router.get('/get-top-single-transactions/:to_username/:txn_type/:limit',
    ( async (request, response) => {
        const {to_username, txn_type, limit} = request.params
        console.log(`/get-top-single-transactions/${to_username}/${txn_type}/${limit}`)
        try{
            const to_wallet = await DB.getPubkey(to_username)
            const topSingles = await DB.getTopSingleTransactions(to_wallet, txn_type, parseInt(limit))

            response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": topSingles})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)



router.get('/get-top-total-transactions/:to_username/:txn_type/:limit', 
    ( async (request, response) => { 
        const {to_username, txn_type, limit} = request.params
        console.log(`/get-top-total-transactions/${to_username}/${txn_type}/${limit}`)
        try{
            const to_wallet = await DB.getPubkey(to_username)
            const topTotals = await DB.getTopTotalTransactions(to_wallet, txn_type, parseInt(limit))
    
            response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": topTotals})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)


router.get('/get-pubkey/:account_id', 
    ( async (request, response) => { 
        const {account_id} = request.params
        console.log(`/get-pubkey/${account_id}`)
        try{
            const pubkey = await DB.getPubkey(account_id)
            response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": pubkey})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)



router.get('/get-username/:account_id', 
    ( async (request, response) => { 
        const {account_id} = request.params
        console.log(`/get-username/${account_id}`)
        try{
            const username = await DB.getUsername(account_id)
            response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": username})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)


router.get('/get-account-id/:pubkey', 
    ((request, response) => { 
        const {pubkey} = request.params
        console.log(`/get-account-id/${pubkey}`)

        const query = "SELECT user_id from wallet WHERE pubkey=$1"
        pool.query(query, [pubkey], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(query_results.rowCount){
                response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": query_results.rows[0]["user_id"]})
            } else {
                response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":`Could not get user id for pubkey=${pubkey}`});
            }
        })
}))


router.get('/get-social-account/:account_id/:platform', 
    ( async (request, response) => { 
        const {account_id, platform} = request.params
        console.log(`/get-social-account/${account_id}/${platform}`)
        try{
            const social_account = await DB.getSocialAccount(account_id, platform)
            response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": social_account})
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)

router.get('/get-account/:account_id/', ((request, response) => { 
    const {account_id} = request.params 
    console.log(`/get-account/${account_id}`)

    try{
        const query = "SELECT username, pay_dev, pfp_provider FROM account WHERE id=$1"
        pool.query(query, [account_id], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            if(query_results.rowCount){
                console.log(query_results.rows[0])
                response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": query_results.rows[0]})
            }else {
                response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Unable to get account information`})
            }
        })
    } catch(e:any){
        response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":`Error:${e.message}`});
    }
}))

router.put('/update-username/:account_id/:new_username', 
    ((request, response) => {
        const {account_id, new_username} = request.params 
        console.log(`/update-username/${account_id}/${new_username}`)

        try{
            const query = "UPDATE account SET username=$1 WHERE id=$2"
            pool.query(query, [new_username, account_id], (error:Error, query_results:pg.QueryResult) => {
                if (error) throw error;
                console.log(query_results, query_results.rowCount)

                if(query_results.rowCount){
                    response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": `Username for account_id=${account_id} successfully updated to ${new_username}`})
                }else {
                    response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Unsuccessful username update for ${account_id}`})
                }
            })
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":`Error:${e.message}`});
        }
}))


router.put('/update-account/:account_id/:username/:pay_dev/:pfp_provider', 
    ((request, response) => {
        const {account_id, username, pay_dev, pfp_provider} = request.params 
        console.log(`/update-username/${account_id}/${username}/${pay_dev}/${pfp_provider}`)

        try{
            const query = "UPDATE account SET username=$1, pay_dev=$2, pfp_provider=$3 WHERE id=$4"
            pool.query(query, [username,pay_dev, pfp_provider, account_id], (error:Error, query_results:pg.QueryResult) => {
                if (error) throw error;
                console.log(query_results, query_results.rowCount)

                if(query_results.rowCount){
                    response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": `Username for account_id=${account_id} successfully updated to ${username}`})
                }else {
                    response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Unsuccessful username update for ${account_id}`})
                }
            })
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":`Error:${e.message}`});
        }
}))


router.put('/update-pfp-provider/:account_id/:pfp_provider', 
    ((request, response) => {
        const {account_id, pfp_provider} = request.params 
        console.log(`/update-pfp-provider/${account_id}/${pfp_provider}`)

        try{
            const query = "UPDATE account SET pfp_provider=$1 WHERE id=$2"
            pool.query(query, [pfp_provider, account_id], (error:Error, query_results:pg.QueryResult) => {
                if (error) throw error;
                console.log(query_results, query_results.rowCount)

                if(query_results.rowCount){
                    response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": `pfp_provider for account_id=${account_id} successfully updated to ${pfp_provider}`})
                }else {
                    response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Unsuccessful pfp_provider update for ${account_id}`})
                }
            })
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":`Error:${e.message}`});
        }
}))

router.put('/update-pfp-provider/:account_id/:pfp_provider', 
    ((request, response) => {
        const {account_id, pfp_provider} = request.params 
        console.log(`/update-pfp-provider/${account_id}/${pfp_provider}`)
        try{
            const query = "UPDATE account SET pfp_provider=$2 WHERE id=$1"
            pool.query(query, [account_id, pfp_provider], (error:Error, query_results:pg.QueryResult) => {
                if (error) throw error;

                if(!query_results.rowCount){
                    response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Unsuccessful pfp_provider update for ${account_id}`})
                }

                if(query_results.rowCount){
                    response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": `pfp_provider for account_id=${account_id} successfully updated to ${pfp_provider}`})
                }
            })
        } catch (e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Error:${e.message}`})
        }
    }))

router.put('/save-social-account', 
    ( async (request, response) => { 
        console.log(`/add-social-account request.body=${request.body}`)
        
        try{
            const {id,account_id,platform,username,handle,email,image_url} = request.body;
            const social_account = new SocialAccount(id,account_id,platform,username,handle,email,image_url)
            let [query, values] = DB.createAddToDBQuery(social_account)
            query += " ON CONFLICT (id) DO UPDATE SET username=$4, handle=$5,email=$6, image_url=$7"
            console.log(query)
            pool.query(query, values, (error:Error, query_results:pg.QueryResult) => {
                if (error) throw error;
                if(query_results.rowCount){
                    response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": `Success Adding Social Account: account_id=${account_id}, platform=${platform}`})
                }else {
                    response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Error adding ${platform} account`})
                }
            })
        } catch(e:any){
            response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message":e.message});
        }
    }
    )
)

router.get('/search-username/:search_query', 
((request, response) => {
    const {search_query} = request.params 
    console.log(`/search-username/${search_query}`)
    try{
        const query = "SELECT a.username, s.image_url, (SELECT handle FROM social_account t WHERE t.platform = 'twitter' AND t.account_id=a.id) AS twitter_handle, (SELECT id FROM social_account d WHERE d.platform = 'discord' AND d.account_id=a.id) AS discord_id FROM account a LEFT JOIN(select id, account_id, handle, platform, image_url FROM social_account) s ON a.id = s.account_id AND s.platform = a.pfp_provider WHERE a.username LIKE $1 LIMIT 10"
        pool.query(query, [`%${search_query}%`], (error:Error, query_results:pg.QueryResult) => {
            if (error) throw error;
            console.log(query_results.rows)
            response.status(HTTP_RES_CODE.SUCCESS_OK).send({"message": query_results.rows})
            }
        )
    } catch (e:any){
        response.status(HTTP_RES_CODE.ERROR_BAD_REQUEST).send({"message": `Error:${e.message}`})
    }
}))


export default router
