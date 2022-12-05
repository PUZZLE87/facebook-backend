import autoBind from "auto-bind";
import cloudinary from "cloudinary";
import fs from "fs";

class UploadController {
  constructor() {
    autoBind(this);
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }

  async uploadImages(req, res) {
    try {
      const { path } = req.body;
      if (!path) return res.status(400).json({ message: "path is empty" });
      let files = Object.values(req.files).flat();
      let images = [];
      for (const file of files) {
        const url = await this.#uploadToCloudinary(file, path);
        images.push(url);
        this.#removeTemp(file.tempFilePath);
      }
      res.json({ images });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async #removeTemp(path) {
    fs.unlink(path, (err) => {
      if (err) throw err;
    });
  }
  async #uploadToCloudinary(file, path) {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        file.tempFilePath,
        {
          folder: path,
        },
        (err, res) => {
          if (err) {
            this.#removeTemp(file.tempFilePath);
            return reject(err);
          }

          resolve({
            url: res.secure_url,
          });
        }
      );
    });
  }
}

export default new UploadController();
