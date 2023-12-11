import { Router } from 'express';
import Controller from './controller.js';
// import Multer from 'multer'
// import Query from './queries.js'
const router = Router();
// const storage = Multer.memoryStorage()
// const upload = Multer({ storage: storage })
// router.post('/login', Passport.authenticate('local'), (req,res) => {
//     res.send(200)
// })
router.get('/', ((req, res) => { res.send("connected to api"); }));
router.post('/createSolTransferTransaction', Controller.processCreateSolTransferTransaction);
// router.post('/add-user-info', upload.single('profile_image'), Query.addUserInfo);
// router.post('/update-user-info/:user_id', upload.single('profile_image'), Query.updateUser);
// router.get('/all-account-users', Query.getAllAccountUsers);
// router.get('/image-urls/:user_id/:image_type', Query.getImageUrls);
// router.get('/links/:user_id', Query.getLinks);
// router.delete('/delete-user/:user_id', Query.deleteUser);
// router.post('/return-info-form', Controller.processReturnForm)
// router.get('/get-connections/:user_id', Query.getUsersConnections);
// router.delete('/delete-connection', Query.deleteConnection);
// router.get('/user/:user_id', Query.getUserInfo);
export default router;
