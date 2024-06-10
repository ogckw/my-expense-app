import fastify from 'fastify';
import Expense from '../models/expense.js';





export const createExpense = async (request, reply) => {
  const { title, amount, date, category } = request.body;

  if (amount < 0) {
    return reply.status(400).send('Amount cannot be negative.');
  }
  if (!['食', '衣', '住', '行'].includes(category)) {
    return reply.status(400).send('Invalid category.');
  }
  // 加入判斷日期不能比現在往前超過 1 年
  if (new Date(date) < new Date(new Date().setFullYear(new Date().getFullYear() - 1))) {
    return reply.status(400).send('Date cannot be more than 1 year ago.');
  }
  
  // 不能是未來的資料，但是可以是今天，所以使用大於等於
  // 只比較日期，不比較時間 (00:00:00)
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
  if (inputDate > currentDate) {
    console.info(`new Date(date): ${inputDate}, vs new Date(): ${currentDate}`);
    return reply.status(400).send('Date cannot be in the future.');
  }

  const expense = new Expense({ title, amount, date, category });
  try {
    await expense.save();
    reply.status(201).send(expense);
  } catch (err) {
    reply.status(500).send(err);
  }
};

export const getExpenses = async (request, reply) => {
  const { title, startDate, endDate } = request.query;

  const filter = {};
  if (title) filter.title = new RegExp(title, 'i'); // 使用正則表達式進行模糊搜索
  // 加入日期範圍搜尋
  // 開始時間不能比結束時間晚
  // 時間區間不能超過 30 天
  if (startDate || endDate) {
    if (!startDate || !endDate) {
      return reply.status(400).send('Both startDate and endDate are required for date range search.');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return reply.status(400).send('startDate cannot be later than endDate.');
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      return reply.status(400).send('Date range cannot exceed 30 days.');
    }

    filter.date = { $gte: start, $lte: end };
  }

  try {
    const expenses = await Expense.find(filter);
    reply.send(expenses);
  } catch (err) {
    reply.status(500).send(err);
  }
};

export const getExpenseById = async (request, reply) => {
  const { id } = request.params;

  try {
    const expense = await Expense.findById(id);
    if (!expense) return reply.status(404).send('Expense not found.');
    reply.status(200).send(expense);
  } catch (err) {
    reply.status(500).send(err);
  }
};

export const updateExpense = async (request, reply) => {
  const { id } = request.params;
  const { title, amount, date, category } = request.body;

  if (amount < 0) return reply.status(400).send('Amount cannot be negative.');
  if (!['食', '衣', '住', '行'].includes(category)) return reply.status(400).send('Invalid category.');
  if (new Date(date) > new Date()) return reply.status(400).send('Date cannot be in the future.');

  try {
    const expense = await Expense.findByIdAndUpdate(id, { title, amount, date, category }, { new: true });
    if (!expense) return reply.status(404).send('Expense not found.');
    reply.status(200).send(expense);
  } catch (err) {
    reply.status(500).send(err);
  }
};

export const deleteExpense = async (request, reply) => {
  const { id } = request.params;

  try {
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) return reply.status(404).send('Expense not found.');
    reply.status(204).send();
  } catch (err) {
    reply.status(500).send(err);
  }
};

// Path: src/models/expense.js
