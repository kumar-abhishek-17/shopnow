import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";

const router: IRouter = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createError("Name, email, and password are required", 400);
    }
    if (password.length < 6) {
      throw createError("Password must be at least 6 characters", 400);
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      throw createError("Email already in use", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      role: "user",
    }).returning();

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError("Email and password are required", 400);
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      throw createError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw createError("Invalid email or password", 401);
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) {
      throw createError("User not found", 404);
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
