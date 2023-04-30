import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as userRoutes } from "./routes/userRoutes.js";
import { router as budgetRoutes } from "./routes/budgetRoutes.js";
import { router as expenseRoutes } from "./routes/expensesRoutes.js";
 import { errorHandler , notFound } from "./middlewares/errorHandler.js";
import connectDB from "./config/db.js";
const app = express();
dotenv.config();
connectDB();
const port = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
 
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
