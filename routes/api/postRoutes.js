import express from "express";
import postController from "../../controllers/postController.js";
import uploadController from "../../controllers/uploadController.js";
import imageUpload from "../../middlewares/imageUpload.js";

const router = express.Router();

router.post("/createPost", postController.createPost);
router.post("/uploadImages", imageUpload, uploadController.uploadImages);
router.get("/posts", postController.getPosts);
router.post("/myPosts", postController.getMyPosts);

export default router;
