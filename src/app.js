import express, { json, urlencoded } from 'express';
import mongoose from 'mongoose';
import User from './schemas/user.js'
import dotenv from 'dotenv'
import cors from 'cors'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false)

app.use(cors());
//these lines let you access the body of the req
app.use(json())
app.use(urlencoded({ extended: true }))

//post for making a resource
//put for updating by replacement
//put means you can click the send button a million times but only one user gets created
//put it might get confusing if you add a resource, use post for that




app.get('/', async (req, resp) => {
    resp.send("Welcome")
});



app.get('/users', async (req, resp) => {
    try {
        const result = await User.find()
        resp.send({ "users": result })
    } catch (e) {
        resp.status(500).json({ error: e.message })
    }

});


app.get('/users/:id', async (req, resp) => {
    try {
        console.log({
            requestParams: req.params,
            requestQuery: req.query
        })
        const userId = req.params.id
        console.log(userId)
        const user = await User.findById(userId)
        console.log(user)

        if (!user) {
            resp.status(404).json({ error: "User not found" })
        } else {
            resp.json({ user })
        }
    } catch (e) {
        resp.status(500).json({ error: e.message })
    }
});

//updating a customer by replacing the whole customer w a new customer
app.put('/users/:id', async (req, resp) => {
    try {
        const userId = req.params.id
        const result = await User.replaceOne({ _id: userId }, req.body, {new:true})
        console.log(result)
        resp.json({ updatedCount: result.modifiedCount })

    } catch (e) {
        resp.status(500).json({ error: e.message })
    }
});

//changing just one attribute
app.patch('/users/:id', async (req, resp) => {
    try {
        const userId = req.params.id
        const result = await User.findOneAndUpdate({ _id: userId }, req.body, {new:true})
        console.log(result)
        resp.json({result})

    } catch (e) {
        resp.status(500).json({ error: e.message })
    }
});

app.delete('/users/:id', async (req, resp) => {
    try {
        const userId = req.params.id
        const result = await User.deleteOne({ _id: userId })
        resp.json({ deletedCount: result.deletedCount })

    } catch (e) {
        resp.status(500).json({ error: e.message })
    }
});


app.post('/add-user', async (req, resp) => {
    console.log(req.body)
    const user = new User(req.body)
    try {
        await user.save();
        //201 is the status code for created
        resp.status(201).json({ user })
    } catch (e) {
        //invalid input
        resp.status(400).json({ error: e.message })
    }

})



const start = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION)
        app.listen(PORT, () => {
            console.log('app listening on port ' + PORT);
        })
    } catch (e) {
        console.log(e.message)
    }
}

start()