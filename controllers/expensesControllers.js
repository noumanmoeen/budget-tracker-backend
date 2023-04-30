import Budget from "../models/budgetModel.js"
import Expense from "../models/expenseModel.js"
import asyncHandler from 'express-async-handler'
 

export const getBudgetExpenses = asyncHandler(async (req, res) => {


    const expenses = await Expense.find({ budget: req.params.budgetId }).select(['-createdAt', '-updatedAt', '-__v']).populate(['budget'])

    res.json({
        expenses
    })

})

export const getExpenseById = asyncHandler(async (req, res) => {


    const expense = await Expense.findById({ _id: req.params.id }).select(['-createdAt', '-updatedAt', '-__v']).populate(['budget'])

    res.json({
        expense
    })

})

export const createExpense = asyncHandler(async (req, res) => {


    const { title , amount , expenseType , budgetId } = req.body

    if(!title || !amount || !expenseType  || !budgetId)
    {
        throw new Error('Please enter all required fields')
    }

    const existingBudget = await Budget.findById(budgetId);

    if(!Boolean(existingBudget))
    {
      res.status(404)
      throw new Error('Budget not found')
    }
  
    const expense = await Expense.create({title , amount , expenseType , budget : budgetId })

    res.json({
        expense
    })

})

export const updateExpense = asyncHandler(async (req, res) => {


    const expense = await Expense.findByIdAndUpdate({ _id: req.params.id }, req.body).select(['-createdAt', '-updatedAt', '-__v'])

    res.json({
        expense
    })

})
export const deleteExpense = asyncHandler(async (req, res) => {


    const currentExpense = await Expense.findById({_id : req.params.id})

    const budgets = await Expense.deleteOne({ _id: req.params.id })

    await Budget.findByIdAndUpdate({_id : currentExpense.budget} , { "$push": { "expenses": req.params.id }},)
    res.json({
        message : "Expense deleted"
    })

})
