import {assert} from 'chai';

import fixture from '../fixture';

describe('add expense', () => {
  before((done) => {
    browser
      .url('http://0.0.0.0:8000/?locale=fr')
      .timeoutsAsyncScript(5000)
      .executeAsync(fixture.executeAsyncDestroyAll) // node.js context
      .call(done);
  });

  it('should show new expense when we tap on main-button', (done) => {
    browser
      .click('[data-test=MainActionButton]')
      .waitForExist('[data-test=ExpenseSave]')
      .call(done);
  });

  it('should show a modal when we add an invalid expense', (done) => {
    browser
      .click('[data-test=ExpenseSave]')
      .waitForExist('[data-test=ModalButton0]')
      .pause(400)
      .click('[data-test=ModalButton0]') // Cancel
      .waitForExist('[data-test=ModalButton0]', 1000, true)
      .call(done);
  });

  it('should show home when we close new expense', (done) => {
    browser
      .click('[data-test=AppBar] button') // Close
      .waitForExist('[data-test=ExpenseSave]', 1000, true)
      .getText('[data-test=AppBar] h1', (err, text) => {
        assert.equal(text, 'Mes comptes');
      })
      .call(done);
  });

  it('should show a modal to confirm when we navigate back form new expense', (done) => {
    browser
      .url('http://0.0.0.0:8000/?locale=fr#/expense/add')
      .waitForExist('[data-test=ExpenseSave]')
      .keys('Left arrow')
      .waitForExist('[data-test=ModalButton1]')
      .pause(400)
      .click('[data-test=ModalButton1]') // Delete
      .waitForExist('[data-test=ExpenseSave]', 1000, true)
      .pause(400) // Modal disappear
      .getText('[data-test=AppBar] h1', (err, text) => {
        assert.equal(text, 'Mes comptes');
      })
      .call(done);
  });

  function browserAddExpense(description, amount, accountToUse) {
    browser = browser
      .url('http://0.0.0.0:8000/?locale=fr#/expense/add')
      .waitForExist('[data-test=ExpenseAddDescription]')
      .setValue('[data-test=ExpenseAddDescription]', description)
      .setValue('[data-test=ExpenseAddAmount]', amount)
    ;

    if (typeof accountToUse === 'number') {
      browser = browser
        .click('[data-test=ExpenseAddRelatedAccount]')
        .waitForExist('.testExpenseAddRelatedAccountDialog')
        .pause(400)
        .click('.testExpenseAddRelatedAccountDialog [data-test=ListItem]:nth-child(' + accountToUse + ')')
        .waitForExist('.testExpenseAddRelatedAccountDialog', 1000, true)
      ;
    }

    browser = browser
      .click('[data-test=ExpenseAddPaidBy]')
      .waitForExist('.testExpenseAddPaidByDialog')
      .pause(400)
    ;

    if (typeof accountToUse === 'number') {
      browser = browser
        .click('.testExpenseAddPaidByDialog [data-test=ListItem]:nth-child(2)')
      ;
    } else {
      browser = browser
        .click('[data-test=ExpenseAddPaidByDialogIcon]')
      ;
    }

    browser = browser
      .waitForExist('.testExpenseAddPaidByDialog', 2000, true)
      .click('[data-test=ExpenseSave]')
      .pause(300)
    ;

    return browser;
  }

  it('should show home when we add a new expense', (done) => {
    browser = browserAddExpense('Expense 1', 13.13);

    browser
      .isExisting('[data-test=ExpenseSave]', (err, isExisting) => {
        assert.isFalse(isExisting);
      })
      .waitForExist('[data-test=ListItemBodyRight]')
      .getText('[data-test=ListItemBodyRight] div:nth-child(2)', (err, text) => {
        assert.equal(text, '6,57 €');
      })
      .call(done);
  });

  it('should show home when we add a 2nd expense on the same account', (done) => {
    browser = browserAddExpense('Expense 2', 13.13, 1);

    browser
      .isExisting('[data-test=ExpenseSave]', (err, isExisting) => {
        assert.isFalse(isExisting);
      })
      .pause(400) // Wait update
      .getText('[data-test=ListItemBodyRight] div:nth-child(2)', (err, text) => {
        assert.equal(text, '13,13 €');
      })
      .call(done);
  });

  it('should show account when we tap on it', (done) => {
    browser
      .click('[data-test=ListItem]')
      .waitForExist('.testAccountListMore', 1000, true) // Expense detail
      .getText('[data-test=AppBar] h1', (err, text) => {
        assert.equal(text, 'Alexandre Dupont');
      })
      .getText('[data-test=ListItemBody] span', (err, text) => {
        assert.deepEqual(text, [
          'Expense 2',
          'Expense 1',
        ]);
      })
      .call(done);
  });

  it('should show home when we close account', (done) => {
    browser
      .click('[data-test=AppBar] button') // Close
      .isExisting('[data-test=ExpenseSave]', (err, isExisting) => {
        assert.isFalse(isExisting);
      })
      .call(done);
  });

  it('should show home when we navigate back form account', (done) => {
    browser
      .click('[data-test=ListItem]')
      .waitForExist('[data-test=AppBar] button')
      .getText('[data-test=AppBar] h1', (err, text) => {
        assert.equal(text, 'Alexandre Dupont');
      })
      .keys('Left arrow')
      .isExisting('[data-test=ExpenseSave]', (err, isExisting) => {
        assert.isFalse(isExisting);
      })
      .call(done);
  });

  it('should show account when we navigate back form edit expense', (done) => {
    browser
      .click('[data-test=ListItem]')
      .waitForExist('.testAccountListMore', 1000, true) // Expense detail
      .click('[data-test=ListItem]')
      .waitForExist('[data-test=AppBar] button')
      .click('[data-test=AppBar] button') // Close
      .waitForExist('[data-test=ExpenseSave]', 1000, true)
      .getText('[data-test=AppBar] h1', (err, text) => {
        assert.equal(text, 'Alexandre Dupont');
      })
      .call(done);
  });

  it('should prefilled paidFor expense when we tap on add new expense', (done) => {
    browser
      .click('[data-test=MainActionButton]')
      .waitForExist('[data-test=ExpenseAddPaidFor]')
      .elements('[data-test=ExpenseAddPaidFor] [data-test=ListItem]', (err, res) => {
        assert.lengthOf(res.value, 3);
      })
      .call(done);
  });

  it('should hide the modal when we navigate back', (done) => {
    browser
      .click('[data-test=ExpenseSave]')
      .waitForExist('[data-test=ModalButton0]')
      .pause(400)
      .keys('Left arrow')
      .waitForExist('[data-test=ModalButton0]', 1000, true)
      .call(done);
  });

  it('should show account when we close new expense', (done) => {
    browser
      .click('[data-test=AppBar] button') // Close
      .waitForExist('[data-test=ExpenseSave]', 1000, true)
      .getText('[data-test=AppBar] h1', (err, text) => {
        assert.equal(text, 'Alexandre Dupont');
      })
      .keys('Left arrow')
      .call(done);
  });

  it('should show new account in the list when we add a new expense', (done) => {
    browser = browserAddExpense('Expense 3', 13.13);

    browser
      .waitForExist('div:nth-child(2) > [data-test=ListItem]')
      .getText('[data-test=ListItemBodyRight] div:nth-child(2)', (err, text) => {
        assert.deepEqual(text, [
          '6,57 €',
          '13,13 €',
        ]);
      })
      .call(done);
  });
});
