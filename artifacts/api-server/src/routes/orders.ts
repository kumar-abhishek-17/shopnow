import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";

const router: IRouter = Router();

router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = "1", limit = "10", status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (req.user!.role !== "admin") {
      conditions.push(eq(ordersTable.userId, req.user!.userId));
    }

    if (status) {
      conditions.push(eq(ordersTable.orderStatus, status as any));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, countResult] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError("Order must have at least one item", 400);
    }
    if (!shippingAddress) {
      throw createError("Shipping address is required", 400);
    }
    if (!paymentMethod) {
      throw createError("Payment method is required", 400);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      if (!product) {
        throw createError(`Product ${item.productId} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw createError(`Insufficient stock for ${product.name}`, 400);
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      subtotal += product.price * item.quantity;

      await db.update(productsTable)
        .set({ stock: product.stock - item.quantity })
        .where(eq(productsTable.id, product.id));
    }

    const shippingCost = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const [order] = await db.insert(ordersTable).values({
      userId: req.user!.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: "pending",
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
    }).returning();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);

    if (!order) {
      throw createError("Order not found", 404);
    }
    if (req.user!.role !== "admin" && order.userId !== req.user!.userId) {
      throw createError("Forbidden", 403);
    }

    let user = null;
    if (req.user!.role === "admin") {
      const [u] = await db.select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        avatar: usersTable.avatar,
        address: usersTable.address,
        phone: usersTable.phone,
        createdAt: usersTable.createdAt,
      }).from(usersTable).where(eq(usersTable.id, order.userId)).limit(1);
      user = u || null;
    }

    res.json({ ...order, user });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authenticate, requireAdmin, async (_req: AuthRequest, res, next) => {
  try {
    const id = parseInt(_req.params.id);
    const { orderStatus, paymentStatus } = _req.body;

    const updateData: any = { updatedAt: new Date() };
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const [order] = await db.update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      throw createError("Order not found", 404);
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
