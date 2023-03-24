import Express, { json, urlencoded } from 'express';
import Routes from './routes.js'
import Dotenv from 'dotenv'
import Cors from 'cors'
import Passport from 'passport'
import LocalStrategy from './strategies/local.js'


if (process.env.NODE_ENV !== 'production') {
    Dotenv.config();
}

const app = Express();
const PORT = process.env.PORT || 3000;


app.use(Cors());
app.use(json())
app.use(urlencoded({ extended: true }))

// app.use(Passport.initialize())
// app.use(Passport.session())


//this adds api in front of all the routes, you can separate that into different routes and have a different front part for better organization
app.use('/api', Routes)


const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log('app listening on port ' + PORT)
        })
    } catch (e) {
        console.log(e.message)
    }
}

start()
