# My Expense App

My Expense App 是一個簡單的支出管理應用程序，允許用戶添加、編輯、刪除和搜索支出記錄。這個應用使用 Fastify 作為後端框架，並使用 MongoDB 作為數據庫。前端使用 HTML 和 Bootstrap 來實現界面。

## 功能

- 支出記錄的新增、編輯、刪除和查看
- 根據標題進行模糊搜索
- 根據日期範圍進行搜索（限制最多 30 天的區間）

## 安裝

請按照以下步驟進行安裝和設置：

1. 克隆此倉庫

   ```bash
   git clone https://github.com/yourusername/my-expense-app.git
   cd my-expense-app
   ```
2. 安裝依賴

   ```bash
   npm install
   ```

3. 啟動 MongoDB Docker 容器
   如果你沒有本地的 MongoDB，可以使用 Docker 啟動 MongoDB 容器：

   ```bash
   npm run docker:up
   ```

4. 創建一個 `.env` 文件，並添加 MongoDB 的 URI（如果你使用的是 Docker，則不需要這一步）

   ```bash
   MONGODB_URI=mongodb://localhost:27017/expensesDB
   ```

## 運行應用

### 開發模式
在開發模式下運行應用，並在文件更改時自動重啟伺服器：

```bash
npm run dev
```

### 生產模式
在生產模式下運行應用：

```bash
npm start
```

## 測試
運行測試來驗證功能：

```bash
npm test
```

## 目錄結構
```plaintext
my-expense-app/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   └── index.html
├── src/
│   ├── controllers/
│   │   └── expenseController.js
│   ├── models/
│   │   └── expense.js
│   ├── routes/
│   │   └── expenseRoutes.js
│   ├── app.js
│   ├── config.js
│   └── server.js
├── test/
│   └── expense.test.js
├── docker-compose.yml
├── .gitignore
├── package.json
└── README.md
```

## 使用技術
* 後端框架：Fastify
* 數據庫：MongoDB
* 前端框架：HTML, Bootstrap
* 測試框架：Mocha, Chai, Supertest
* 其他工具：Docker, Nodemon



## 貢獻
歡迎貢獻！請遵循以下步驟：

1. Fork 這個倉庫
2. 創建一個 feature 分支 (git checkout -b feature/your-feature)
3. 提交你的更改 (git commit -am 'Add some feature')
4. 推送到分支 (git push origin feature/your-feature)
5. 創建一個新的 Pull Request
