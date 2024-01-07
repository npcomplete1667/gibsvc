import Express, { json, urlencoded } from 'express';
import Routes from './Incoming/routes.js'
import Dotenv from 'dotenv'
import Cors from 'cors'
// import Passport from 'passport'
// import LocalStrategy from './strategies/local.js'
// import CookieSession from 'cookie-session'
import ip from 'ip'

if (process.env.NODE_ENV !== 'production') {
    Dotenv.config();
}

const app = Express();
const PORT = process.env.PORT || 3001;


app.use(Cors());
app.use(json())
app.use(urlencoded({ extended: true }))


//this adds api in front of all the routes, you can separate that into different routes and have a different front part for better organization
app.use(Routes)

// app.use(CookieSession(
//     {name: 'session',
//     //put a private key in your env file, change this later
//     keys: ["nik"],
//     //This is 1 day
//     maxAge: 24 * 60 * 60 * 100
// }
// ))
// //this is for auth
// app.use(Passport.initialize())
// app.use(Passport.session())


const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log('app on ' + ip.address() + ":"+ PORT + "/api")
        })
    } catch (e) {
        console.log((e as Error).message)
    }
}

start()
