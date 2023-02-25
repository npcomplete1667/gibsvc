import Pool from '../../../DBSetup.js'
import Queries from './queries.js'
import HTTP_RES_CODE from '../../httpResCodes.js'
import { sendFileToServer } from '../../../S3.js'
import AccountUser from './schema.js'
import Sharp from 'sharp'


async function resizeImage(_height, _width, image) {
    return await Sharp(image.buffer)
        .resize({ height: _height, width: _width, fit: "contain" })
        .toBuffer()
}

async function processImage(req) {
    const resizedImage = await resizeImage(1920, 1080, req.file)
    const imageFileName = await sendFileToServer(resizedImage, req.file.mimetype)

    return imageFileName
}

function getAllUsers(req, res) {
    console.log('getting all users')
    Pool.query(Queries.get_all_users, (error, query_results) => {
        if (error) throw error;
        res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows);
    })
}

function getUserById(req, res) {
    console.log('getting user by id')
    const user_id = parseInt(req.params.id);
    Pool.query(Queries.get_user_by_id, [user_id], (error, query_results) => {
        if (error) throw error;
        res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows)
    })
}

function addUser(req, res) {
    console.log("adding user")
    const user = new AccountUser(req);

    //check if phone_number already exists
    Pool.query(Queries.check_if_phone_number_exists, [phone_number], (error, query_results) => {
        if (error) throw error
        if (query_results.rows.length) {
            res.send("Phone Number already exists.")
        } else {
            //if new phone number, then add new user
            Pool.query(Queries.add_user, [first_name, last_name, phone_number, profile_image], (error, query_results) => {
                if (error) throw error;
                res.status(HTTP_RES_CODE.SUCCESS_CREATED).send("User Created Successfully!")
                console.log("User created")
            })
        }
    })
}

function updateUser(req, res) {
    console.log('updating user')
    const user_id = parseInt(req.params.id);
    const { first_name, last_name, phone_number, profile_image } = req.body;

    if (checkUserExists(user_id)) {
        //If user exists, delete them
        Pool.query(Queries.update_user, [first_name, last_name, phone_number, profile_image, user_id], (error, query_results) => {
            if (error) throw error;
            res.status(HTTP_RES_CODE.SUCCESS_OK).send("User updated successfully!")
        })
    }
}

function deleteUser(req, res) {
    console.log('deleting user')
    const user_id = parseInt(req.params.id);
    if (checkUserExists(user_id)) {
        //If they do exist, delete them
        Pool.query(Queries.remove_user, [user_id], (error, query_results) => {
            if (error) throw error;
            res.status(HTTP_RES_CODE.SUCCESS_OK).send("User removed successfully!")
        })
    }

}

function checkUserExists(req, res) {
    const user_id = parseInt(req.params.id);
    Pool.query(Queries.get_user_by_id, [user_id], (error, query_results) => {
        if (error) throw error;
        const no_user_found = !query_results.rows.length;
        if (no_user_found) {
            res.send("User does not exist in the database");
            return false
        } else {
            res.send("User Exists")
            return true
        }
    })
}

export default {
    getAllUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
}
