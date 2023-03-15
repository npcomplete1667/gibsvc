import Pool from './DBSetup.js'
import HTTP_RES_CODE from './httpResCodes.js'
import { sendFileToServer, getS3FileUrl } from './S3.js'
import AccountUser from './schemas/AccountUser.js'
import Link from './schemas/Link.js'
import ImageUtil from './util/ImageUtil.js'

const get_all_acc_users = "SELECT * FROM account_users";


const get_user_connection_by_id =
    "SELECT n.non_acc_id, first_name, last_name, phone_number_country, phone_number \
FROM non_account_users n \
INNER JOIN user_connections u ON u.user2_id = n.non_acc_id \
WHERE u.user1_id=$1";



const non_acc_add_user = "INSERT into non_account_users (non_acc_id, first_name, last_name, phone_number_country, phone_number) VALUES ($1,$2,$3,$4, $5)";

const acc_add_user = "INSERT into account_users (acc_id, profile_image_S3_key, first_name, last_name, phone_number_country, phone_number) VALUES ($1,$2,$3,$4, $5,$6)";


const remove_acc_user = "DELETE from account_users WHERE acc_id = $1";


const remove_acc_user_connections = "DELETE from user_connections WHERE user1_id = $1";

const delete_non_acc_connection_of_acc_user = "DELETE from user_connections WHERE user1_id=$1 AND user2_id=$2 ";

function getAllAccUsers(req, res) {
    console.log('getting all users')
    Pool.query(get_all_acc_users, async (error, query_results) => {
        if (error) throw error;
        for (const element of query_results.rows) {
            console.log(element)
            element.profile_image_s3_key = await getS3FileUrl(element.profile_image_s3_key)
        }
        res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows);
    })
}

function getUserById(user_id){
    return new Promise((resolve, reject) => {
        Pool.query("SELECT * FROM account_users WHERE acc_id=$1", [user_id], (error, query_results) => {
            if (error) throw error;
            resolve(query_results.rows[0])
        })
    })
}

function getUserLinks(user_id){
    return new Promise((resolve, reject) => {
        Pool.query("SELECT name, url FROM links WHERE acc_id=$1", [user_id], (error, query_results) => {
            if (error) throw error;
            resolve(query_results.rows)
        })
    })
}

function phoneNumberExists(user) {
    let query = `SELECT u FROM ${user.table_name()} u WHERE u.phone_number=$1`
    return new Promise((resolve, reject) => {
        Pool.query(query, [user.phone_number], (error, query_results) => {
            if (error) throw error;
            if (!query_results.rows.length) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

async function addToDB(input) {
    console.log("Adding to table:", input.table_name(), '\n', input)
    let props = Object.keys(input)
    let values = []
    for (let i = 1; i < props.length + 1; i++) {
        values.push(`$${i}`)
    }

    const query = `INSERT into ${input.table_name()} (${props.join(', ')}) VALUES (${values.join(',')})`

    Pool.query(query, Object.values(input), (error, query_results) => {
        if (error) throw error;
    })
}

function getUserConnections(req, res) {
    console.log('getting non acc users by acc id')
    const acc_id = req.params.acc_id;
    Pool.query(get_user_connection_by_id, [acc_id], (error, query_results) => {
        if (error) throw error;
        res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows)
    })
}

function deleteUserConnection(req, res) {
    const { acc_id, non_acc_id } = req.body;
    runQuery(res, delete_non_acc_connection_of_acc_user, [acc_id, non_acc_id])
}

function deleteUser(req, res) {
    console.log('deleting user')
    const acc_id = req.params.acc_id;
    Pool.query(remove_acc_user, [acc_id], (error) => {
        if (error) throw error;
    })
    Pool.query(remove_acc_user_connections, [acc_id], (error) => {
        if (error) throw error;
        res.status(HTTP_RES_CODE.SUCCESS_OK).send("User removed successfully!")
    })
}

async function addAccUserInfo(req, res) {
    console.log("adding user")
    let acc_user = new AccountUser(req);
    console.log(acc_user)
    console.log(req.file)
    if (acc_user.profile_image_s3_key) {
        const image_key = await ImageUtil.processImage(req).then(value => {
            return value
        })

        acc_user.profile_image_s3_key = image_key
    }
    else {
        acc_user.profile_image_s3_key = "default_profile_image.jpg"
    }


    addToDB(acc_user)
    //Adding to tables
    for (const link of JSON.parse(req.body.links)) {
        addToDB(new Link(acc_user.acc_id, link))
    }
}

function updateUser(req, res) {
    console.log('updating user')
    const user_id = parseInt(req.params.id);
    const { first_name, last_name, phone_number, profile_image } = req.body;


    Pool.query(update_user, [first_name, last_name, phone_number, profile_image, user_id], (error, query_results) => {
        if (error) throw error;
        res.status(HTTP_RES_CODE.SUCCESS_OK).send("User updated successfully!")
    })

}

function runQuery(res, query, params) {
    //const acc_id = req.params.acc_id;
    Pool.query(query, params, (error, query_results) => {
        if (error) throw error;
        res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows)
    })
}


export default {
    non_acc_add_user,
    acc_add_user,
    get_user_connection_by_id,
    get_all_acc_users,
    remove_acc_user,
    remove_acc_user_connections,
    delete_non_acc_connection_of_acc_user,
    runQuery,
    phoneNumberExists,
    addToDB,
    getAllAccUsers,
    getUserConnections,
    deleteUserConnection,
    deleteUser,
    updateUser,
    addAccUserInfo,
    getUserById,
    getUserLinks
    // update_user,
    // remove_user,
}