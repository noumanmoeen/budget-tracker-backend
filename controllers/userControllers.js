import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Budget from "../models/budgetModel.js";
import moment from "moment";
import Expense from "../models/expenseModel.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User does not exists");
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    await checkAndReNewBudget(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Incorrect Password");
  }
});

export const fetchUser = asyncHandler(async (req, res) => {
  const { _id, email, phoneNumber, name } = await User.findById(req.user.id);
  res.json({
    id: _id,
    email,
    name,
    phoneNumber,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const userId = req.params.id;

  if (!userId) {
    res.status(400);
    throw new Error("No user id");
  }

  const user = await User.findById({ id: userId });

  if (!user) {
    res.status(401);
    throw new Error("No user");
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, userData, {
    new: true,
  }).select(["-password", "-__v"]);

  res.json({
    user: updatedUser,
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const checkAndReNewBudget = async (userId) => {
  try {
    const userBudgets = await Budget.find({ user: userId })
      .populate("expenses")
      .select(["-createdAt", "-updatedAt", "-__v"]);

    userBudgets.map(async (budget) => {
      const todaysDate = moment();
      const endDate = moment(budget.endDate);
      const nextEndDate = todaysDate.clone().add(1, "months");

      const remainingDays = todaysDate.diff(endDate, "d");
      if (remainingDays === 0 || true) {
        let filteredExpenses = budget.expenses.filter(
          ({ expenseType }) => expenseType !== "MONTHLY"
        );
        filteredExpenses = filteredExpenses.map(
          ({ title, amount, paid, expenseType }) => {
            return {
              title,
              amount,
              paid,
              expenseType,
              budget: undefined,
            };
          }
        );
        const budgetData = {
          title: budget.title,
          monthlyBudget: budget.monthlyBudget,
          startDate: budget.endDate,
          endDate: nextEndDate,
          active: budget.active,
          user: userId,
        };
        const temp = budget.expenses.reduce(
          (acc, curr) => curr.amount + acc,
          0
        );
          
         await Budget.findByIdAndUpdate(
          { _id: budget._id },
          {
            monthlySavings: budget.monthlyBudget - temp,
            active : false
          },
          { new: true }
        );
        const createdBudget = await Budget.create(budgetData);
        filteredExpenses = filteredExpenses.map((item) => {
          return {
            ...item,
            budget: createdBudget._id,
          };
        });
        await Expense.insertMany(filteredExpenses)
          .then((docs) => {
            filteredExpenses = docs;
          })
          .catch((e) => {
            throw new Error("Eror");
          });
        await Budget.findByIdAndUpdate(
          { _id: createdBudget._id },
          { expenses: filteredExpenses.map((expense) => expense._id) },
          { new: true }
        );
      }
    });
  } catch (err) {
    res.status(400);
    throw new Error(err);
  }
};
