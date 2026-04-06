import { Router } from "express";
import {
	getSummary,
	getCategoryTotals,
	getRecentActivity,
	getDashboardInsights,
} from "../controllers/Dashboard.controller.js";
import { verifyJWT, requireAnalystOrAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/summary", verifyJWT, requireAnalystOrAdmin, getSummary);
router.get("/category-totals", verifyJWT, requireAnalystOrAdmin, getCategoryTotals);
router.get("/recent-activity", verifyJWT, requireAnalystOrAdmin, getRecentActivity);
router.get("/insights", verifyJWT,  getDashboardInsights);

export default router;
