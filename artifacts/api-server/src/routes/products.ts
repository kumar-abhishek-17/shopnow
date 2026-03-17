import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, sql, asc, desc } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";

const router: IRouter = Router();

router.get("/categories", async (_req, res, next) => {
  try {
    const result = await db
      .selectDistinct({ category: productsTable.category })
      .from(productsTable)
      .orderBy(asc(productsTable.category));
    res.json({ categories: result.map((r) => r.category) });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      page = "1",
      limit = "12",
      inStock,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (search) {
      conditions.push(ilike(productsTable.name, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(productsTable.category, category));
    }
    if (minPrice) {
      conditions.push(gte(productsTable.price, parseFloat(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(productsTable.price, parseFloat(maxPrice)));
    }
    if (inStock === "true") {
      conditions.push(gte(productsTable.stock, 1));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    switch (sortBy) {
      case "price_asc":
        orderByClause = asc(productsTable.price);
        break;
      case "price_desc":
        orderByClause = desc(productsTable.price);
        break;
      case "name_asc":
        orderByClause = asc(productsTable.name);
        break;
      case "name_desc":
        orderByClause = desc(productsTable.name);
        break;
      case "rating":
        orderByClause = desc(productsTable.rating);
        break;
      case "newest":
      default:
        orderByClause = desc(productsTable.createdAt);
        break;
    }

    const [products, countResult] = await Promise.all([
      db.select().from(productsTable).where(where).orderBy(orderByClause).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!product) {
      throw createError("Product not found", 404);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { name, description, price, originalPrice, category, image, images, stock, featured, tags } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      throw createError("Missing required fields", 400);
    }

    const [product] = await db.insert(productsTable).values({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category,
      image,
      images: images || [],
      stock: parseInt(stock),
      featured: featured || false,
      tags: tags || [],
    }).returning();

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, originalPrice, category, image, images, stock, featured, tags } = req.body;

    const [product] = await db.update(productsTable)
      .set({
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        originalPrice: originalPrice !== undefined ? parseFloat(originalPrice) : undefined,
        category,
        image,
        images,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        featured,
        tags,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      throw createError("Product not found", 404);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (_req: AuthRequest, res, next) => {
  try {
    const id = parseInt(_req.params.id);
    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted) {
      throw createError("Product not found", 404);
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
