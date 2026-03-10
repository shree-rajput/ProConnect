import { Router } from "express";
import { acceptConncetionRequest, downloadResume, getAllUserProfile, getMyConnectionRequest, getUserAndProfile, login, register ,sendRequestConnection,updateProfileData,updateUserProfile,uploadProfilePicture, whatAreMyConnection} from "../controllers/user.controller.js";
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null , 'uploads/');
    } ,
    filename : ( req,file, cb) => {
      cb(null, file.originalname);
    }
})

const upload = multer({storage : storage});

router.route("/update_profile_picture").post(upload.single("profile_picture"), uploadProfilePicture)
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user-update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/users/get_all_user").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadResume);
router.route("/user/send_connection_request").post(sendRequestConnection);
router.route("/user/getConnectionRequest").get(getMyConnectionRequest);
router.route("/user/user_connected_request").get(whatAreMyConnection);
router.route("/user/accept_connection_request").post(acceptConncetionRequest);

export default router;