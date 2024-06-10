import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import fastify from '../src/app.js';

import Expense from '../src/models/expense.js';

let mongoServer;
let request;

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // 使用測試數據庫連接字符串連接MongoDB
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await fastify.ready(); // 確保 Fastify 應用已經啟動並準備就緒
    request = supertest(fastify.server);
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Expense.deleteMany({});
});

describe('Expense CRUD API', () => {
    it('should create a new expense', async () => {
        const expense = { title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' };
        const res = await request.post('/expenses').send(expense);
        expect(res.status).to.equal(201);
        expect(res.body).to.include(expense);

    });
    // 測試加入 1 年以前的資料會被阻擋
    it('should not create an expense with a date 1 year ago', async () => {
        const expense = { title: 'Lunch', amount: 50, date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(), category: '食' };
        const res = await request.post('/expenses').send(expense);
        expect(res.status).to.equal(400);
        expect(res.text).to.equal('Date cannot be more than 1 year ago.');
    });

    // 不能加入其他分類的資料
    it('should not create an expense with an invalid category', async () => {
        const expense = { title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '其他' };
        const res = await request.post('/expenses').send(expense);
        expect(res.status).to.equal(400);
        expect(res.text).to.equal('Invalid category.');
    });




    it('should get all expenses', async () => {
        const expense = new Expense({ title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' });
        await expense.save();
        const res = await request.get('/expenses');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.lengthOf(1); // 檢查返回數據的長度
        expect(res.body[0]).to.include({ title: 'Lunch', amount: 50, category: '食' });
    });

    // 測試模糊搜尋功能
    it('should get expenses by title', async () => {
        const expense1 = new Expense({ title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' });
        const expense2 = new Expense({ title: 'Dinner', amount: 70, date: new Date().toISOString(), category: '食' });
        await expense1.save();
        await expense2.save();
        const res = await request.get('/expenses?title=Lun');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.lengthOf(1);
        expect(res.body[0]).to.include({ title: 'Lunch', amount: 50, category: '食' });
    });

    // 測試搜尋功能不能只指定開始時間或結束時間
    it('should not get expenses without both startDate and endDate', async () => {
        const res = await request.get('/expenses?startDate=2021-01-01');
        expect(res.status).to.equal(400);
        expect(res.text).to.equal('Both startDate and endDate are required for date range search.');
    });

    // 測試搜尋功能不能開始時間比結束時間晚
    it('should not get expenses with startDate later than endDate', async () => {
        const res = await request.get('/expenses?startDate=2021-01-02&endDate=2021-01-01');
        expect(res.status).to.equal(400);
        expect(res.text).to.equal('startDate cannot be later than endDate.');
    });

    // 測試搜尋功能不能搜尋超過 30 天的時間區間
    // 指定時間為今天跟 31 天前
    it('should get expenses by date', async () => {
        const expense1 = new Expense({ title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' });
        const expense2 = new Expense({ title: 'Dinner', amount: 70, date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), category: '食' });
        await expense1.save();
        await expense2.save();
        // 指定時間開始時間為 31 天前，結束時間為今天
        const res = await request.get(`/expenses?startDate=${new Date(new Date().setDate(new Date().getDate() - 31)).toISOString()}&endDate=${new Date().toISOString()}`);
        expect(res.status).to.equal(400);
        expect(res.text).to.equal('Date range cannot exceed 30 days.');
    });


    it('should get an expense by id', async () => {
        const expense = new Expense({ title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' });
        await expense.save();
        const res = await request.get(`/expenses/${expense._id}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.include({ title: 'Lunch', amount: 50, category: '食' });
    });

    it('should update an expense', async () => {
        const expense = new Expense({ title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' });
        await expense.save();
        const updatedExpense = { title: 'Dinner', amount: 70, date: new Date().toISOString(), category: '食' };
        const res = await request.put(`/expenses/${expense._id}`).send(updatedExpense);
        expect(res.status).to.equal(200);
        expect(res.body).to.include(updatedExpense);
    });

    it('should delete an expense', async () => {
        const expense = new Expense({ title: 'Lunch', amount: 50, date: new Date().toISOString(), category: '食' });
        await expense.save();
        const res = await request.delete(`/expenses/${expense._id}`);
        expect(res.status).to.equal(204);
    });
});
