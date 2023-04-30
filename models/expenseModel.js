import mongoose from "mongoose";

const expenseSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  budget: 
    { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
  
  amount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  expenseType: {
    type: String,
    enum: ["M0NTHLY", "ADDITIONAL" , "SAVING"],
    required: true,
  },
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
