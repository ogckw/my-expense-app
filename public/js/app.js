document.addEventListener('DOMContentLoaded', () => {
  const expensesList = document.getElementById('expenses-list');
  const expenseForm = document.getElementById('expense-form');
  const cancelUpdateButton = document.getElementById('cancel-update');
  const searchForm = document.getElementById('search-form');
  let isUpdating = false;

  // 加載支出記錄
  const loadExpenses = (title = '', startDate = '', endDate = '') => {
    let url = '/expenses';
    const params = new URLSearchParams();

    if (title) params.append('title', title);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(response => response.json())
      .then(expenses => {
        expensesList.innerHTML = expenses.map(expense => `
          <tr>
            <td>${expense.title}</td>
            <td>${expense.amount}</td>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.category}</td>
            <td>
              <button class="btn btn-info btn-sm" onclick="editExpense('${expense._id}')">編輯</button>
              <button class="btn btn-danger btn-sm" onclick="deleteExpense('${expense._id}')">刪除</button>
            </td>
          </tr>
        `).join('');
      });
  };

  // 新增或更新支出
  expenseForm.addEventListener('submit', event => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const id = document.getElementById('expense-id').value;

    const expense = { title, amount, date, category };

    if (isUpdating && id) {
      fetch(`/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expense)
      })
      .then(response => response.json())
      .then(() => {
        alert('支出記錄已更新');
        resetForm();
        loadExpenses();
      })
      .catch(error => {
        alert('更新失敗');
        console.error(error);
      });
    } else {
      fetch('/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expense)
      })
      .then(response => response.json())
      .then(() => {
        alert('支出記錄已添加');
        resetForm();
        loadExpenses();
      })
      .catch(error => {
        alert('添加失敗');
        console.error(error);
      });
    }
  });

  // 搜索支出
  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('search-title').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // 檢查日期區間是否合規
    if ((startDate && !endDate) || (!startDate && endDate)) {
      alert('請同時指定開始日期和結束日期');
      return;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        alert('開始日期不能晚於結束日期');
        return;
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        alert('日期區間不能超過 30 天');
        return;
      }
    }

    loadExpenses(title, startDate, endDate);
  });

  // 編輯支出
  window.editExpense = (id) => {
    fetch(`/expenses/${id}`)
      .then(response => response.json())
      .then(expense => {
        document.getElementById('title').value = expense.title;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = new Date(expense.date).toISOString().split('T')[0];
        document.getElementById('category').value = expense.category;
        document.getElementById('expense-id').value = expense._id;
        isUpdating = true;
      })
      .catch(error => {
        alert('加載失敗');
        console.error(error);
      });
  };

  // 刪除支出
  window.deleteExpense = (id) => {
    fetch(`/expenses/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.status === 204) {
        alert('支出記錄已刪除');
        loadExpenses();
      } else {
        alert('刪除失敗');
      }
    })
    .catch(error => {
      alert('刪除失敗');
      console.error(error);
    });
  };

  // 重置表單
  const resetForm = () => {
    expenseForm.reset();
    document.getElementById('expense-id').value = '';
    isUpdating = false;
  };

  // 取消更新
  cancelUpdateButton.addEventListener('click', resetForm);

  // 初始加載支出記錄
  loadExpenses();
});
