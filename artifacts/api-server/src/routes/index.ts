import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import usersRouter from "./users.js";
import ordersRouter from "./orders.js";
import wishlistRouter from "./wishlist.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/users", usersRouter);
router.use("/orders", ordersRouter);
router.use("/wishlist", wishlistRouter);
router.use("/admin", adminRouter);

export default router;
