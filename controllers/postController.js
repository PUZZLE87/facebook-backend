import UserModel from "../models/userModel.js";
import PostModel from "../models/postModel.js";
class PostController {
  constructor() {}

  async createPost(req, res) {
    try {
      //  const user = await UserModel.findById(req.userId);
      const data = req.body;
      if (!data.text && !data.images && !data.background) {
        return res.statsu(400).json({
          message:
            "At least one of the text, images or background must have value",
        });
      }
      const post = await new PostModel({
        user: req.userId,
        ...req.body,
      }).save();
      res.json(post);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new PostController();
