import { Transaction } from "../models/Transaction.js";

    export const getSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({ isDeleted: false });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach((t) => {
        if ((t.type || "").toLowerCase() === "income") totalIncome += t.amount;
        if ((t.type || "").toLowerCase() === "expense") totalExpenses += t.amount;
        });

        res.status(200).json({ totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };

    export const getCategoryTotals = async (req, res) => {
    try {
        const transactions = await Transaction.find({ isDeleted: false });
        const totals = [];

        transactions.forEach((t) => {
        const existing = totals.find((item) => item.category === t.category);

        if (existing) {
            existing.total += t.amount;
            existing.count += 1;
        } else {
            totals.push({ category: t.category, type: t.type, total: t.amount, count: 1 });
        }
        });

        res.status(200).json(totals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };

    export const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const transactions = await Transaction.find()
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
        .limit(limit);

        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };

    export const getDashboardInsights = async (req, res) => {
    try {
        const transactions = await Transaction.find({ isDeleted: false })
        .populate("createdBy", "username")
        .sort({ createdAt: -1 });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach((t) => {
        if ((t.type || "").toLowerCase() === "income") totalIncome += t.amount;
        if ((t.type || "").toLowerCase() === "expense") totalExpenses += t.amount;
        });

        res.status(200).json({
        summary: { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses },
        recentActivity: transactions.slice(0, 5),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };