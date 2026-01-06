import { Router } from "express";
import { createPost } from "../controllers/postController";

import { createPostSchema } from "../validators/postSchema";

const router = Router();

router.post("/", createPost);

export default router;
