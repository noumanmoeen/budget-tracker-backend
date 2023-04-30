import Budget from "../models/budgetModel.js";
import asyncHandler from "express-async-handler";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import lodash from "lodash";

export const createBudget = asyncHandler(async (req, res) => {
  let { title, monthlyBudget, startDate, active, } = req.body;

  if (!title || !monthlyBudget || !startDate || !active) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const activeBudgets = await checkForActiveBudgets(req.user.id);

  if (activeBudgets.length) {
    activeBudgets.map(async ({ _id }) => {
      await Budget.findOneAndUpdate({ _id }, { active: false });
    });
  }

 
  const budgetStart = moment(startDate);
  const budget = await Budget.create({
    title,
    monthlyBudget,
    startDate,
    user: req.user.id,
    endDate: budgetStart.clone().add(1, "months"),
    expenses,
  });

  res.json({
    budget,
  });
});

export const getMyBudget = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id }).populate(['user','expenses']).select([
    "-createdAt",
    "-updatedAt",
    "-__v",
  ]);

  res.json({
    budgets,
  });
});

export const updateBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let { active, expenses } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Please enter id for budget");
  }

  const existingBudget = await Budget.findById(id);

  if(!Boolean(existingBudget))
  {
    res.status(404)
    throw new Error('Budget not found')
  }

  if (active) {
    const activeBudgets = await checkForActiveBudgets(req.user.id);
    if (activeBudgets.length) {
      activeBudgets.map(async ({ _id }) => {
        await Budget.findByIdAndUpdate({ _id }, { active: false });
      });
    }
  }

  if (expenses && expenses.length) {
    const expenseIds = existingBudget.expenses.map((id) => {
      return  id.toString()
    })
      expenses = lodash.uniq(expenseIds.concat(expenses))
  }

  req.body = { ...req.body, expenses };

 
  const budget = await Budget.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  }).select(["-createdAt", "-updatedAt", "-__v"]);

  res.json({
    budget,
  });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("Please enter id for budget");
  }

  await Budget.deleteOne(id);

  res.json({
    message: "Budget Deleted",
  });
});

export const getBudgetbyId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("Please enter id for budget");
  }

  const budget = await Budget.findById(id).populate(['user','expenses']);

  res.json({
    budget,
  });
});

const checkForActiveBudgets = asyncHandler(async (userId, budgetId) => {
  const budgets = await Budget.find({ user: userId });
  return budgets.filter(
    (item) => (item.active && item._id.toString() !== budgetId) || ""
  );
});

