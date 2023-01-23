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
      res.json(
        await post.populate("user", "first_name last_name picture username")
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getPosts(req, res) {
    try {
      const pageNum = parseInt(req.query.pageNum) || 1;
      const pageLimit = parseInt(req.query.pageLimit) || 3;
      const options = {
        page: pageNum,
        limit: pageLimit,
      };

      const postModelAggregate = PostModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  username: 1,
                  picture: 1,
                },
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      const posts = await PostModel.aggregatePaginate(
        postModelAggregate,
        options
      );
      res.json(posts);
    } catch (error) {
      res.statsu(500).json({ message: error.message });
    }
  }
  async getMyPosts(req, res) {
    try {
      const pageNum = parseInt(req.query.pageNum) || 1;
      const pageLimit = parseInt(req.query.pageLimit) || 3;
      const username = req.body?.username;
      if (!username) return res.status(404).json({ message: "user not found" });
      const user = await UserModel.findOne({ username });
      if (!user) return res.status(401).json({ message: "user not found" });
      const options = {
        page: pageNum,
        limit: pageLimit,
      };

      const postModelAggregate = PostModel.aggregate([
        {
          $match: { user: user._id },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  username: 1,
                  picture: 1,
                },
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      const posts = await PostModel.aggregatePaginate(
        postModelAggregate,
        options
      );
      res.json(posts);
    } catch (error) {
      res.statsu(500).json({ message: error.message });
    }
  }
}

export default new PostController();
