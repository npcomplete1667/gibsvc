import { Router } from 'express'
import AccountUserController from './Tables/account_users/controller.js'
import NonAccountUserController from './Tables/non_account_users/controller.js'
import Multer from 'multer'

const router = Router()
const storage = Multer.memoryStorage()
const upload = Multer({ storage: storage })


//ROUTES ORDER: get, post, put, delete
// router.get('/', AccountUserController.getAllUsers);
// router.post('/', AccountUserController.addUser);

// router.get('/:id', AccountUserController.getUserById);
// router.put('/:id', AccountUserController.updateUser);
// router.delete('/:id', AccountUserController.deleteUser);

//this is how you get files from a api req
// router.post('/return-info-form', upload.single('profile_image'), Controller.processReturnForm)

router.post('/return-info-form', NonAccountUserController.processReturnForm)
router.get('/npusers', NonAccountUserController.getUserConnectionById)




export default router
