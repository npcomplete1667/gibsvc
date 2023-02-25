// const get_all_users = "SELECT * FROM non_account_users";


const get_user_connection_by_id = 
"SELECT first_name, last_name, phone_number_country, phone_number \
FROM non_account_users \
INNER JOIN user_connections ON user_connections.user2 = non_account_users.non_acc_id \
WHERE user_connections.user1=$1";


const check_if_phone_number_exists = "SELECT u FROM non_account_users u WHERE u.phone_number=$1";
const add_user = "INSERT into non_account_users (non_acc_id, first_name, last_name, phone_number_country, phone_number) VALUES ($1,$2,$3,$4, $5)";

//this is a different table aka should be in different folder, but I want to change the whole query thing anyways
const add_user_connection = "INSERT into user_connections (connection_id, user1, user2) VALUES ($1,$2,$3)";

// const update_user = "UPDATE non_account_users SET first_name=$1, last_name=$2, phone_number=$3 profile_image=$4 WHERE user_id=$5";
// const remove_user = "DELETE from non_account_users WHERE user_id = $1";


export default {
    // get_all_users,
    // get_user_by_id,
    check_if_phone_number_exists,
    add_user,
    add_user_connection,
    get_user_connection_by_id
    // update_user,
    // remove_user,
}