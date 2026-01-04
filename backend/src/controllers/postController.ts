import { Request, Response } from "express";
import { Post } from "../models/post";
import { UserModel } from "../models/user";

export const createPost = async (req: Request, res: Response) => {
  try {
    const userHandle = req.user?.user_handle;

    if (!userHandle) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title, description, tags, media } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // find user to get ObjectId
    const user = await UserModel.findOne({ user_handle: userHandle }).select("_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.create({
  userId: user._id,
  title,
  description,
  tags,
  media,
  likesCount: 0,
  commentsCount: 0,
});


    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
