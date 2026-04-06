import mongoose, {Schema} from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be greater than 0'] },
        type: { type: String, required: [true, 'Type is required'], enum:{values: ['Income', 'Expense'], message: 'Transaction must be either income or expense' }},
        category: { type: String, required: [true, 'Category is required'], trim: true},
        date: { type: Date, required: [true, 'Date is required'], trim: true, default: Date.now },
        notes: { type: String, trim: true, default: "" },
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
        isDeleted: {type: Boolean, default: false}
    },
    {timestamps: true}
);

// Used to filter out deleted transactions in all find queries(find, findOne, findById, findOneAndUpdate, etc.), so that they are not returned in results
// Internally works as Transaction.find({isDeleted: false}) // return all non deleted transactions
transactionSchema.pre(/^find/, function(){
    this.where({isDeleted: false});
});

export const Transaction = mongoose.model("Transaction", transactionSchema);