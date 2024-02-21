export {default as Account} from './Account.js'
export {default as Transaction} from './Transaction.js'
export {default as Wallet} from './Wallet.js'
export {default as SocialAccount} from './SocialAccount.js'

export interface SchemaObject {
    table_name: () => string;
}
