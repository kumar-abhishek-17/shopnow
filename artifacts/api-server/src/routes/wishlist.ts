import { Router, type IRouter } from "express";
import { db, wishlistTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";

const router: IRouter = Router();

router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const items = await db
      .select({
        id: wishlistTable.id,
        productId: wishlistTable.productId,
        createdAt: wishlistTable.createdAt,
        product: productsTable,
      })
      .from(wishlistTable)
      .innerJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
      .where(eq(wishlistTable.userId, req.user!.userId));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      throw createError("productId is required", 400);
    }

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
    if (!product) {
      throw createError("Product not found", 404);
    }

    const existing = await db
      .select()
      .from(wishlistTable)
      .where(and(eq(wishlistTable.userId, req.user!.userId), eq(wishlistTable.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      res.status(200).json({ message: "Already in wishlist" });
      return;
    }

    await db.insert(wishlistTable).values({
      userId: req.user!.userId,
      productId,
    });

    res.status(201).json({ message: "Added to wishlist" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:productId", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    await db
      .delete(wishlistTable)
      .where(and(eq(wishlistTable.userId, req.user!.userId), eq(wishlistTable.productId, productId)));
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
});

export default router;
