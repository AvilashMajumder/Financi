import { Router } from "express";
import {
	createTransaction,
	getAllTransactions,
	getTransactionById,
	updateTransaction,
	deleteTransaction,
} from "../controllers/Transaction.controller.js";
import { verifyJWT, requireAdmin, requireAnalystOrAdmin } from "../middlewares/auth.js";

const router = Router();

router.post("/", verifyJWT, requireAdmin, createTransaction)
router.get("/", verifyJWT, requireAnalystOrAdmin, getAllTransactions);


router.get("/:id", verifyJWT, requireAnalystOrAdmin, getTransactionById)
router.patch("/:id", verifyJWT, requireAdmin, updateTransaction)
router.delete("/:id", verifyJWT, requireAdmin, deleteTransaction);

export default router;
