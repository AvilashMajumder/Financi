    import { Transaction } from "../models/Transaction.js";

    export const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, date, notes } = req.body;

        if (amount === undefined || amount === null || !type || !category) {
        return res.status(400).json({ message: "Amount, type, and category are required" });
        }

        const normalizedType = type.trim().toLowerCase();
        const transactionType = normalizedType === "income" ? "Income" : normalizedType === "expense" ? "Expense" : undefined;
        if (!transactionType) {
        return res.status(400).json({ message: "Type must be income or expense" });
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        const transaction = await Transaction.create({
        amount: parsedAmount,
        type: transactionType,
        category: category.trim(),
        date: date ? new Date(date) : Date.now(),
        notes: notes ? notes.trim() : "",
        createdBy: req.user._id,
        });

        return res.status(201).json({ message: "Transaction created successfully", transaction });
    } catch (err) {
        if (err?.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(", ") });
        }
        return res.status(500).json({ message: err.message });
    }
    };

    export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
        .populate("createdBy", "username email")
        .sort({ date: -1 });

        return res.status(200).json({ transactions });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    };

    export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate(
        "createdBy",
        "username email"
        );

        if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
        }

        return res.status(200).json(transaction);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    };

    export const updateTransaction = async (req, res) => {
    try {
        const { amount, type, category, date, notes } = req.body;

        if (amount === undefined && type === undefined && category === undefined && date === undefined && notes === undefined) {
        return res.status(400).json({ message: "At least one field is required to update" });
        }

        if (type !== undefined) {
        const normalizedType = type.trim().toLowerCase();
        const transactionType = normalizedType === "income" ? "Income" : normalizedType === "expense" ? "Expense" : undefined;
        if (!transactionType) {
            return res.status(400).json({ message: "Type must be income or expense" });
        }
        req.body.type = transactionType;
        }

        if (amount !== undefined && amount !== null && (isNaN(Number(amount)) || Number(amount) <= 0)) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        const transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
        );

        if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
        }

        return res.status(200).json({ message: "Transaction updated successfully", transaction });
    } catch (err) {
        if (err?.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(", ") });
        }
        return res.status(500).json({ message: err.message });
    }
    };

    export const deleteTransaction = async (req, res) => {
    try {
        const result = await Transaction.updateOne(
        { _id: req.params.id, isDeleted: false },
        { $set: { isDeleted: true } }
        );

        if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Transaction not found or already deleted" });
        }

        return res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    };