// import Pool from '../External/Pool.js'
// import HTTP_RES_CODE from '../util/httpResCodes.js'
// import { sendFileToServer, getS3FileUrl } from '../External/S3.js'
// import User from '../schemas/User.js'
// import Link from '../schemas/Link.js'
// import Image from '../schemas/Image.js'
// import ImageUtil from '../util/ImageUtil.js'
export {};
// const get_all_account_users =
//     `SELECT * 
// FROM users 
// WHERE has_account=true
// `;
// const get_image_url =
//     `SELECT * 
// FROM images 
// WHERE user_id=$1 AND image_type=$2
// `;
// const get_user =
//     `SELECT * 
// FROM users 
// WHERE user_id=$1`;
// const get_links =
//     `SELECT name, url 
// FROM links 
// WHERE user_id=$1`;
// const get_users_connections =
//     `SELECT u.*
// FROM users u
// LEFT JOIN connections c ON u.user_id = c.user2_id
// WHERE c.user1_id=$1`;
// const remove_connection =
//     `DELETE FROM connections 
// WHERE user1_id=$1 AND user2_id=$2`;
// const remove_user =
//     `DELETE FROM users 
// WHERE user_id=$1`;
// const remove_user_connections =
//     `DELETE FROM connections 
// WHERE user1_id=$1`;
// const remove_user_links =
//     `DELETE FROM links 
// WHERE user_id=$1`;
// const remove_user_images =
//     `DELETE FROM images 
// WHERE user_id=$1`
// function getLinks(req, res) {
//     const user_id = req.params.user_id;
//     Pool.query(get_links, [user_id], (error, query_results) => {
//         if (error) throw error;
//         res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows)
//     })
// }
// function getUserInfo(req, res) {
//     const user_id = req.params.user_id;
//     Pool.query(get_user, [user_id], (error, query_results) => {
//         if (error) throw error;
//         res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows[0])
//     })
// }
// function getAllAccountUsers(req, res) {
//     console.log('getting all account users')
//     Pool.query(get_all_account_users, async (error, query_results) => {
//         res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows);
//     })
// }
// function getUsersConnections(req, res) {
//     console.log('getting non acc users by acc id')
//     const user_id = req.params.user_id;
//     console.log(user_id)
//     Pool.query(get_users_connections, [user_id], (error, query_results) => {
//         if (error) throw error;
//         console.log(query_results.rows)
//         res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows)
//     })
// }
// async function addUserInfo(req, res) {
//     console.log("adding user")
//     let user = new User(req);
//     addToDB(user)
//     if (req.file) {
//         const image_key = await ImageUtil.processImage(req.file)
//         const profile_image = new Image(user.user_id, 0, image_key)
//         addToDB(profile_image)
//     }
//     for (let i = 0; i < req.body.name.length; i++){
//         addToDB(new Link(user.user_id, {
//             name: req.body.name[i],
//             url: req.body.url[i]
//         }))
//     }
// }
// function getImageUrls(req, res) {
//     const user_id = req.params.user_id;
//     const image_type = req.params.image_type;
//     console.log(`getting image url for user_id: ${user_id} of image_type: ${image_type}`)
//     Pool.query(get_image_url, [user_id, image_type], async (error, query_results) => {
//         if (error) throw error;
//         for (const row of query_results.rows) {
//             row.profile_image_url = await getS3FileUrl(row.s3_key)
//         }
//         res.status(HTTP_RES_CODE.SUCCESS_OK).json(query_results.rows);
//     })
// }
// function phoneNumberExists(user) {
//     let query = `SELECT u FROM ${user.table_name()} u WHERE u.phone_number=$1`
//     return new Promise((resolve, reject) => {
//         Pool.query(query, [user.phone_number], (error, query_results) => {
//             if (error) throw error;
//             if (!query_results.rows.length) {
//                 resolve(false)
//             } else {
//                 resolve(true)
//             }
//         })
//     })
// }
// function deleteConnection(req, res) {
//     const { user1_id, user2_id } = req.body;
//     Pool.query(remove_connection, [user1_id, user2_id], (error) => { if (error) throw error })
// }
// function deleteUser(req, res) {
//     console.log('deleting user')
//     const user_id = req.params.user_id;
//     Pool.query(remove_user_connections, [user_id],
//         (error) => { if (error) throw error })
//     Pool.query(remove_user_links, [user_id],
//         (error) => { if (error) throw error })
//     Pool.query(remove_user_images, [user_id],
//         (error) => { if (error) throw error })
//     Pool.query(remove_user, [user_id],
//         (error) => { if (error) throw error })
//     res.status(HTTP_RES_CODE.SUCCESS_OK).send("User removed successfully!")
// }
// function updateUser(req, res) {
//     console.log('updating user')
//     console.log(req.body)
//     const user_id = req.params.user_id
//     const user = new User(req);
//     console.log(user)
//     updateDB(user, user_id)
//     // Pool.query(update_user, [first_name, last_name, phone_number, profile_image, user_id], (error, query_results) => {
//     //     if (error) throw error;
//     //     res.status(HTTP_RES_CODE.SUCCESS_OK).send("User updated successfully!")
//     // })
// }
// async function addToDB(input) {
//     console.log("Adding to table:", input.table_name(), '\n', input)
//     let props = Object.keys(input)
//     let values = []
//     for (let i = 1; i < props.length + 1; i++) {
//         values.push(`$${i}`)
//     }
//     const query =
//         `INSERT into ${input.table_name()} 
//         (${props.join(', ')}) 
//         VALUES (${values.join(',')})`
//     Pool.query(query, Object.values(input),
//         (error) => { if (error) throw error })
// }
// async function updateDB(input, user_id) {
//     console.log("Updating on table:", input.table_name(), '\n', input)
//     let update = []
//     let params = []
//     let count = 1
//     let object = Object.entries(input)
//     object.shift()
//     object.forEach(([key, value]) => {
//         if (!value) return
//         update.push(`${key}=$${count}`)
//         params.push(value)
//         count++
//     });
//     params.push(user_id)
//     const query =
//         `UPDATE ${input.table_name()} 
//     SET ${update.join(', ')}
//     WHERE user_id=$${count}`
//     console.log(query, params)
//     //Uncomment this later to actually update in DB
//     // Pool.query(query, params,
//     //     (error) => { if (error) throw error })
// }
// export default {
//     getAllAccountUsers,
//     addToDB,
//     getImageUrls,
//     getLinks,
//     getUsersConnections,
//     phoneNumberExists,
//     deleteConnection,
//     deleteUser,
//     updateUser,
//     addUserInfo,
//     getUserInfo,
// }
