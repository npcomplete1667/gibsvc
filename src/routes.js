import { Router } from 'express'
import Controller from './controller.js'
import Multer from 'multer'
import Query from './queries.js'
import Passport from 'passport'

const router = Router()
const storage = Multer.memoryStorage()
const upload = Multer({ storage: storage })

router.post('/login', Passport.authenticate('local'), (req,res) => {
    res.send(200)
})


router.post('/return-info-form', Controller.processReturnForm)
router.get('/get-all-acc-users', Query.getAllAccUsers);
router.post('/add-acc-user-info', upload.single('profile_image'), Query.addUserInfo);
router.delete('/delete-acc-user/:acc_id', Query.deleteUser);
router.get('/acc-user/:acc_id', Controller.getAccUserById);
router.get('/get-user-connections/:acc_id', Query.getUserConnections);

router.delete('/delete-user-connection', Query.deleteUserConnection);








export default router
