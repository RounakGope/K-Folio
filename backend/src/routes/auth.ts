import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserModel } from "../models/user";

const authRouter = Router();
const SALT_ROUNDS = 10;
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

// Zod type validation schemes
const signupSchema = z.object({
  user_handle: z.string().min(3).max(30).trim().toLowerCase(),
  username: z.string().min(1).max(100).trim(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
});

const signinSchema = z
  .object({
    user_handle: z.string().min(3).max(30).trim().toLowerCase().optional(),
    email: z.email().trim().toLowerCase().optional(),
    password: z.string().min(6).max(100),
  })
  .refine((data) => data.user_handle || data.email, {
    message: "Provide either user_handle or email",
  });

// not pissing off typescript
type SignupInput = z.infer<typeof signupSchema>;
type SigninInput = z.infer<typeof signinSchema>;

// middleware for validation against the zod schemas (thank you chatgpt)
const validate = <S extends z.ZodTypeAny>(schema: S) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", issues: parsed.error.issues });
    }
    req.body = parsed.data;
    next();
  };

// safely build user payload to return (no password)
const buildUserPayload = (user: {
  user_handle: string;
  username: string;
  email: string;
}) => ({
  user_handle: user.user_handle,
  username: user.username,
  email: user.email,
});



// handle user signup
// takes in user_handle, username, email, and password (all required)
authRouter.post("/signup", validate(signupSchema), async (req: Request, res: Response) => {
  try {
    const { user_handle, username, email, password } = req.body as SignupInput;

    const existingUser = await UserModel.findOne(
      { $or: [{ user_handle }, { email }] },
      { user_handle: 1, email: 1 }
    ).lean<{ user_handle: string; email: string }>();
    if (existingUser) {
      const conflictField = existingUser.user_handle === user_handle ? "User handle" : "Email";
      return res.status(409).json({ message: `${conflictField} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // create user in db
    const createdUser = await UserModel.create({
      user_handle,
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ sub: createdUser.user_handle }, getJwtSecret(), {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: buildUserPayload(createdUser),
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "JWT_SECRET is not configured"
    ) {
      console.error("Signup error: JWT secret missing");
      return res.status(500).json({ message: "Server misconfigured" });
    }
    console.error("Signup error", error);
    return res.status(500).json({ message: "Unable to sign up user" });
  }
});



// handle user signin
// takes in user_handle or email along with password
authRouter.post("/signin", validate(signinSchema), async (req: Request, res: Response) => {
  try {
    const { user_handle, email, password } = req.body as SigninInput;
    const lookup = user_handle ? { user_handle } : { email };
    const userDoc = await UserModel.findOne(lookup).lean<{ password: string; user_handle: string; username: string; email: string }>();
    if (!userDoc) {
      return res.status(401).json({ message: "User not found. Invalid credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "User password is incorrect. Invalid credentials" });
    }
    const token = jwt.sign({ sub: userDoc.user_handle }, getJwtSecret(), {
      expiresIn: "1h",
    });
    console.log("Signin success", { user_handle: userDoc.user_handle });
    return res.status(200).json({
      message: "Signed in successfully",
      token,
      user: buildUserPayload(userDoc),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "JWT_SECRET is not configured"
    ) {
      console.error("Signin error: JWT secret missing");
      return res.status(500).json({ message: "Server misconfigured" });
    }
    return res.status(500).json({ message: "Unable to sign in" });
  }
});

export default authRouter;
