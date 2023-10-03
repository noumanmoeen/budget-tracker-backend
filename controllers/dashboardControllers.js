import asyncHandler from 'express-async-handler';
import Budget from '../models/budgetModel';
import User from '../models/userModel';
import Expense from '../models/expenseModel';
import moment from 'moment';
import { QUERY_TYPE, getMonthName } from '../utils/constants';

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
        let expenses = budget.expenses.sort((a, b) => (b.amount = a.amount));
        // expenses = expenses.splice(4,5)
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
  let { type } = req.query;
  try {
    const budgetsMap = {};
    const budgets = await Budget.find({
      user: req.user.id,
      $or: [{ archived: true }, { active: true }],
    }).sort({ amount: -1 });

    switch (type) {
      case QUERY_TYPE.MONTHLY:
        budgets.forEach((budget) => {
          let budgetMonthNum = moment(budget.startDate).month();
          let budgetMonth = getMonthName(budgetMonthNum);

          budgetsMap[budgetMonth] = {
            savings: budget.amount,
            name: budget.name,
          };
        });
        break;
      case QUERY_TYPE.YEARLY:
        budgets.forEach((budget) => {
          let budgetYearNum = moment(budget.startDate).year();
          if (Boolean(budgetsMap[budgetYearNum])) {
            budgetsMap[budgetYearNum] =
              budgetsMap[budgetYearNum].savings + budget.amount;
          } else {
            budgetsMap[budgetYearNum] = {
              savings: budget.amount,
            };
          }
        });
        break;
      default:
        break;
    }

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
  let { type } = req.query;
  try {
    const expensesMap = {};
    const budgets = await Budget.find({
      user: req.user.id,
      $or: [{ archived: true }, { active: true }],
    }).populate('expenses');

    switch (type) {
      case QUERY_TYPE.MONTHLY:
        budgets.forEach((budget) => {
          let budgetMonthNum = moment(budget.startDate).month();
          let budgetMonth = getMonthName(budgetMonthNum);
          let temp = budget.expenses.reduce(
            (acc, curr) => curr.amount + acc,
            0
          );
          expensesMap[budgetMonth] = {
            expenseAmount: temp,
            name: budget.name,
          };
        });
        break;
      case QUERY_TYPE.YEARLY:
        budgets.forEach((budget) => {
          let budgetYearNum = moment(budget.startDate).year();
          let temp = budget.expenses.reduce(
            (acc, curr) => curr.amount + acc,
            0
          );
          if (Boolean(expensesMap[budgetYearNum])) {
            expensesMap[budgetYearNum] =
              expensesMap[budgetYearNum].savings + temp;
          } else {
            expensesMap[budgetYearNum] = {
              savings: budget.amount,
            };
          }
        });
        break;

      default:
        break;
    }

    res.status(200);
    res.json({
      expenses: expensesMap,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

export const getExpensesByCategory = asyncHandler(async (req, res) => {
  let {} = req.body;
  try {
    const expensesMap = {};
    const budgets = await Budget.find({
      user: req.user.id,
      $or: [{ archived: true }, { active: true }],
    }).populate('expenses');
    budgets.forEach((budget) => {
      let budgetMonthNum = moment(budget.startDate).month();
      let budgetMonth = getMonthName(budgetMonthNum);
      let temp = budget.expenses.reduce((acc, curr) => curr.amount + acc, 0);
      budget.expenses.forEach((expense) => {
        if (expensesMap[expense.expenseType]) {
          expensesMap[expense.expenseType] = {
            amount: expensesMap[expense.expenseType].amount + expense.amount,
          };
        } else {
          expensesMap[expense.expenseType] = {
            amount: expense.amount,
          };
        }
      });
      expensesMap[budgetMonth] = {
        expenseAmount: temp,
        name: budget.name,
      };
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});
