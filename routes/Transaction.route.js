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

router
	.route("/")
	.post(verifyJWT, requireAdmin, createTransaction)
	.get(verifyJWT, requireAnalystOrAdmin, getAllTransactions);

router
	.route("/:id")
	.get(verifyJWT, requireAnalystOrAdmin, getTransactionById)
	.patch(verifyJWT, requireAdmin, updateTransaction)
	.delete(verifyJWT, requireAdmin, deleteTransaction);

export default router;
