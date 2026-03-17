import { Router, type IRouter } from "express";
import { db, usersTable, ordersTable, productsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";

const router: IRouter = Router();

router.get("/", authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const { page = "1", limit = "20" } = _req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [users, countResult] = await Promise.all([
      db.select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        avatar: usersTable.avatar,
        address: usersTable.address,
        phone: usersTable.phone,
        createdAt: usersTable.createdAt,
      }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(usersTable),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user!.role !== "admin" && req.user!.userId !== id) {
      throw createError("Forbidden", 403);
    }

    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      avatar: usersTable.avatar,
      address: usersTable.address,
      phone: usersTable.phone,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, id)).limit(1);

    if (!user) {
      throw createError("User not found", 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user!.role !== "admin" && req.user!.userId !== id) {
      throw createError("Forbidden", 403);
    }

    const { name, avatar, address, phone } = req.body;

    const [user] = await db.update(usersTable)
      .set({ name, avatar, address, phone, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        avatar: usersTable.avatar,
        address: usersTable.address,
        phone: usersTable.phone,
        createdAt: usersTable.createdAt,
      });

    if (!user) {
      throw createError("User not found", 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    if (!deleted) {
      throw createError("User not found", 404);
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/stats", authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const [totalRevenue, totalOrders, totalProductsCount, totalUsersCount, recentOrders, ordersByStatus] =
      await Promise.all([
        db.select({ sum: sql<number>`coalesce(sum(total), 0)` }).from(ordersTable),
        db.select({ count: sql<number>`count(*)` }).from(ordersTable),
        db.select({ count: sql<number>`count(*)` }).from(productsTable),
        db.select({ count: sql<number>`count(*)` }).from(usersTable),
        db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
        db.select({
          status: ordersTable.orderStatus,
          count: sql<number>`count(*)`,
        }).from(ordersTable).groupBy(ordersTable.orderStatus),
      ]);

    const ordersByStatusMap: Record<string, number> = {};
    for (const row of ordersByStatus) {
      ordersByStatusMap[row.status] = Number(row.count);
    }

    const revenueByMonth = await db.select({
      month: sql<string>`to_char(created_at, 'YYYY-MM')`,
      revenue: sql<number>`coalesce(sum(total), 0)`,
    }).from(ordersTable)
      .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM')`);

    res.json({
      totalRevenue: Number(totalRevenue[0]?.sum ?? 0),
      totalOrders: Number(totalOrders[0]?.count ?? 0),
      totalProducts: Number(totalProductsCount[0]?.count ?? 0),
      totalUsers: Number(totalUsersCount[0]?.count ?? 0),
      recentOrders,
      ordersByStatus: ordersByStatusMap,
      revenueByMonth: revenueByMonth.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
