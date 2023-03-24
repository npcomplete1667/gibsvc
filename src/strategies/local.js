import LocalStrategy from 'passport-local'
import Passport from 'passport'
import Pool from '../DBSetup.js'

Passport.serializeUser((user,done) => {
    done(null, user.username)
})

Passport.deserializeUser((username, done) => {
    try{
        Pool.query("SELECT * from users WHERE username=$1", [username], (error, query_results) => {
            done(null, query_results[0])
    })
    }catch(err){
        done(err,null)
    }
    
})

export default Passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            Pool.query("SELECT * from users WHERE username=$1", [username], (error, query_results) => {
                if (error) throw error;
                console.log(query_results[0])
                if (query_results[0].length === 0) {
                    done(null, false);
                } else {
                    if (query_results[0].password === password) {
                        done(null, result[0])
                    } else {
                        done(null, false)
                    }
                }
            })
        } catch (err) {
            done(err, false)
        }

    }
))