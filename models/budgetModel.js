import mongoose from "mongoose";

const budgetSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monthlyBudget: {
      type: Number,
      required: true,
    },
    monthlySavings: {
      type: Number,
     },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref : 'Expense' }],

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
