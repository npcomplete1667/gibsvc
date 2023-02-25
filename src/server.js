import Express, { json, urlencoded } from 'express';
import Routes from './routes.js'
import Dotenv from 'dotenv'
import Cors from 'cors'


if (process.env.NODE_ENV !== 'production') {
    Dotenv.config();
}

const app = Express();
const PORT = process.env.PORT || 3000;

// const storage = Multer.memoryStorage()
// const upload = Multer({ storage: storage })


app.use(Cors());
//these lines let you access the body of the req
app.use(json())
app.use(urlencoded({ extended: true }))

// app.use(upload.array());
// app.use(Express.static('public'));


app.use('/api', Routes)


const start = async () => {
    try {
        // await mongoose.connect(process.env.CONNECTION)
        app.listen(PORT, () => {
            console.log('app listening on port ' + PORT)
        })
    } catch (e) {
        console.log(e.message)
    }
}

start()
