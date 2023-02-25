const get_all_users = "SELECT * FROM account_users";
const get_user_by_id = "SELECT * FROM account_users WHERE user_id=$1";
const check_if_phone_number_exists = "SELECT u FROM account_users u WHERE u.phone_number=$1";
const add_user = "INSERT into account_users (first_name, last_name, phone_number, profile_image) VALUES ($1,$2,$3,$4)";
const update_user = "UPDATE account_users SET first_name=$1, last_name=$2, phone_number=$3 profile_image=$4 WHERE user_id=$5";
const remove_user = "DELETE from account_users WHERE user_id = $1";


export default {
    get_all_users,
    get_user_by_id,
    check_if_phone_number_exists,
    add_user,
    update_user,
    remove_user,
}