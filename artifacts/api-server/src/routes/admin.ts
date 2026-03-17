import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/stats", authenticate, requireAdmin, async (_req, res, next) => {
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
