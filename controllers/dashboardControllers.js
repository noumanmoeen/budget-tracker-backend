import asyncHandler from 'express-async-handler';
import Budget from '../models/budgetModel';
import User from '../models/userModel';
import Expense from '../models/expenseModel';
import moment from 'moment';
import { getMonthName } from '../utils/constants';

export const getAccountDetails = asyncHandler(async (req, res) => {
  let {} = req.body;

  try {
    const budget = await Budget.find({ user: req.user.id, active: true });
    const user = await User.findById({ id: req.user.id });

    const details = {
      ...user,
      ...budget,
    };
    res.status(200);
    res.json({
      details,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

export const getUpcomingPayments = asyncHandler(async (req, res) => {
  try {
    const budget = await Budget.find({ user: req.user.id, active: true });
    const expenses = await Expense.find({
      budget: budget._id,
      paid: false,
    }).select(['-createdAt', '-updatedAt', '-__v']);

    res.status(200);
    res.json({
      expenses,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

export const getTopExpenses = asyncHandler(async (req, res) => {
  let {} = req.body;
  try {
    const expensesMap = {};
    const budgets = await Budget.find({
      user: req.user.id,
      $or: [{ archived: true }, { active: true }],
    }).populate(['expenses']);

    if (budgets.length > 0) {
      budgets.forEach((budget) => {
        let budgetMonthNum = moment(budget.startDate).month();
        let budgetMonth = getMonthName(budgetMonthNum);
        const expenses = budget.expenses.sort((a, b) => (b.amount = a.amount));
        expensesMap[budgetMonth] = {
          amount: expenses[0].amount,
          name: expenses[0].name,
        };
      });
    }
    res.json({
      expenses: expensesMap,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

export const getSavingsByTime = asyncHandler(async (req, res) => {
  let {} = req.body;
  try {
    const budgetsMap = {};
    const budgets = await Budget.find({
      user: req.user.id,
      $or: [{ archived: true }, { active: true }],
    }).sort({ amount: -1 });

    budgets.forEach((budget) => {
      let budgetMonthNum = moment(budget.startDate).month();
      let budgetMonth = getMonthName(budgetMonthNum);

      budgetsMap[budgetMonth] = {
        savings: budget.amount,
        name: budget.name,
      };
    });
    res.status(200);
    res.json({
      budgets: budgetsMap,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

export const getExpensesByTime = asyncHandler(async (req, res) => {
  let {} = req.body;
  try {
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

export const getExpensesByCategory = asyncHandler(async (req, res) => {
  let {} = req.body;
  try {
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});
