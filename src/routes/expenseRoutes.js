import { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } from '../controllers/expenseController.js';

export default [
  {
    method: 'POST',
    url: '/expenses',
    handler: createExpense
  },
  {
    method: 'GET',
    url: '/expenses',
    handler: getExpenses
  },
  {
    method: 'GET',
    url: '/expenses/:id',
    handler: getExpenseById
  },
  {
    method: 'PUT',
    url: '/expenses/:id',
    handler: updateExpense
  },
  {
    method: 'DELETE',
    url: '/expenses/:id',
    handler: deleteExpense
  }
];
