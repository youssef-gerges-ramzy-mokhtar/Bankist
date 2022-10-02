'use strict';

// BANKIST APP

// Data
const account1 = {
   owner: 'Jonas Schmedtmann',
   movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300].reverse(),
   interestRate: 1.2, // %
   pin: 1111,

   movementsDates: [
      '2019-11-18T21:31:17.178Z',
      '2019-12-23T07:42:02.383Z',
      '2020-01-28T09:15:04.904Z',
      '2020-04-01T10:17:24.185Z',
      '2020-05-08T14:11:59.604Z',
      '2021-07-21T17:01:17.194Z',
      '2021-07-24T23:36:17.929Z',
      '2021-07-28T10:51:36.790Z',
   ].reverse(),
   currency: 'EUR',
   locale: 'pt-PT', // de-DE
};
 
const account2 = {
   owner: 'Jessica Davis',
   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30].reverse(),
   interestRate: 1.5,
   pin: 2222,

   movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-07-26T12:01:20.894Z',
   ].reverse(),
   currency: 'USD',
   locale: 'en-US',
};

// const account3 = {
//    owner: 'Allan Gerges',
//    movements: [10, 600000, -20000],
//    interestRate: 1.6,
//    pin: 2503,

//    movementsDates: [
//       '2019-11-01T13:15:33.035Z',
//       '2019-11-30T09:48:16.867Z',
//       '2019-12-25T06:04:23.907Z',
//       '2020-01-25T14:18:46.235Z',
//       '2020-02-05T16:33:06.386Z',
//       '2020-04-10T14:43:26.374Z',
//       '2020-06-25T18:49:59.371Z',
//       '2020-07-26T12:01:20.894Z',
//    ],
//    currency: 'EGP',
//    locale: 'en-US',
// };

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');



function calcDaysPassed(date1) {
   return Math.round(Math.abs(new Date() - date1) / (1000 * 60 * 60 * 24))
}

function formatMovementDate(date, locale) {
   const dayDiffernece = calcDaysPassed(date)
   let displayDate
  
   if (dayDiffernece === 0) return "Today"
   else if (dayDiffernece === 1) return "Yesterday"
   else if (dayDiffernece <= 7) return `${dayDiffernece} days ago`
   else return new Intl.DateTimeFormat(locale).format(date)
}


function formatCurrency(locale, currency, value) {
   return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
   }).format(value)
}


function displayMovements(account, sort = false) {
   containerMovements.innerHTML = ""
   const movs = sort ? account.movements.slice().sort((a, b) => b - a) : account.movements
  
   movs.forEach(function(movement, index) {
      const type = movement > 0 ? "deposit" : "withdrawal"
      
      const date = new Date(account.movementsDates[index])
      const displayDate = formatMovementDate(date, account.locale)

      const formatedMov = formatCurrency(account.locale, account.currency, movement)

      const html = `
         <div class="movements__row">
         <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
         <div class="movements__date">${displayDate}</div>
         <div class="movements__value">${formatedMov}</div>
         </div>
      `
      containerMovements.insertAdjacentHTML("beforeend", html)
   })
}


function calcDisplayBalance(account) {
   account.balance  = account.movements.reduce((acc, cur) => acc + cur, 0)
   labelBalance.textContent = formatCurrency(account.locale, account.currency, account.balance)
}


function calcDisplaySummary(account) {
   const incomes = account.movements
      .filter(mov => mov > 0)
      .reduce((acc, cur) => acc + cur, 0)
   labelSumIn.textContent = formatCurrency(account.locale, account.currency, incomes)

   const out = account.movements
      .filter(mov => mov < 0)
      .reduce((acc, mov) => acc + mov, 0)
   labelSumOut.textContent = formatCurrency(account.locale, account.currency, Math.abs(out))

   const interest = account.movements
      .filter(mov => mov > 0)
      .map(deposit => deposit * (account.interestRate / 100))
      .filter(interest => interest >= 1)
      .reduce((acc, interest) => acc + interest, 0)
   labelSumInterest.textContent = formatCurrency(account.locale, account.currency, interest)
}


function createUserNames(accs) {
   accounts.forEach(function(account) {
      const user = account.owner
      account.username = user.toLowerCase().split(" ").map(name => name[0]).join("")
   })
}
createUserNames(accounts)


function updateUI(account) {
   // Display Movements
   displayMovements(account)
      
   // Display Balance
   calcDisplayBalance(account)

   // Display Summary
   calcDisplaySummary(account)
}


function startLogOutTimer() {
   function tick() {
      const min = `${Math.trunc(time / 60)}`.padStart(2, 0)
      const sec = `${Math.trunc(time % 60)}`.padStart(2, 0)

      // In each call, print the remaining time to the UI
      labelTimer.textContent = `${min}:${sec}`

      // Decrease 1 Second
      time--

      // When 0 seconds, stop timer and log out user
      if (time === -1) {
         clearInterval(timer)
         console.log("Logged out")

         labelWelcome.textContent = "Log in to get started" 
         containerApp.style.opacity = 0
      }
   }
   
   // Set time to 5 minutes
   let time = 120
   
   // Call the timer every second
   tick()
   const timer = setInterval(tick, 1000)
   
   return timer
}






// Event Handlers
let currentAccount, timer

btnLogin.addEventListener("click", function(e) {
   e.preventDefault()  
   
   currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value.trim())
   if (currentAccount && currentAccount.pin === Number(inputLoginPin.value.trim())) {
      // Display UI & Welcome Message
      labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`
      containerApp.style.opacity = 100
      
      // Create current Date & Time
      const now = new Date()
      const options = {
         hour: "numeric",
         minute: "numeric",
         day: "numeric",
         month: "numeric",
         year: "numeric",
      }
      labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)

      // Clear Fields
      inputLoginUsername.value = inputLoginPin.value = ""
      inputLoginUsername.blur()
      inputLoginPin.blur()

      if (timer) clearInterval(timer)
      timer = startLogOutTimer()

      // Update UI
      updateUI(currentAccount)
   } else {
      containerApp.style.opacity = 0
      labelWelcome.textContent = "InCorrect Login Details, Please Try Again"
   }
})




btnTransfer.addEventListener("click", function(e) {
   e.preventDefault()
   
   const reciverAccount = accounts.find(acc => acc.username === inputTransferTo.value.trim())
   const transferAmount = Number(inputTransferAmount.value.trim())
   
    // Clear Fields
   inputTransferTo.value = inputTransferAmount.value = ""
   inputTransferTo.blur()
   inputTransferAmount.blur()
   
   if (reciverAccount && transferAmount > 0 && transferAmount <= currentAccount.balance && reciverAccount.username !== currentAccount.username) {
      // Updating Movements for both Accounts
      currentAccount.movements.unshift(-transferAmount)
      reciverAccount.movements.unshift(transferAmount)
      
      // Updating Date for both Accounts
      currentAccount.movementsDates.unshift(new Date().toISOString())
      reciverAccount.movementsDates.unshift(new Date().toISOString())

      // Update UI
      updateUI(currentAccount)
  
      // Reset Timer
      clearInterval(timer)
      timer = startLogOutTimer()
   }
})




btnLoan.addEventListener("click", function(e) {
   e.preventDefault()
   const laonAmount = Math.floor(inputLoanAmount.value)
   const loanAcceptance = currentAccount.movements.some(mov => mov >= 0.1 * laonAmount)
   if (loanAcceptance && laonAmount > 0) {
      setTimeout(function () {
         // Updating Movement
         currentAccount.movements.unshift(laonAmount)
         
         // Updating Date
         currentAccount.movementsDates.unshift(new Date().toISOString())
         
         // Update UI
         updateUI(currentAccount)
         
         // Reset Timer
         clearInterval(timer)
         timer = startLogOutTimer()
      }, 2500)
   }
   inputLoanAmount.value = ""
   inputLoanAmount.blur()
})




btnClose.addEventListener("click", function(e) {
   e.preventDefault()
   if (inputCloseUsername.value.trim() === currentAccount.username && Number(inputClosePin.value.trim()) === currentAccount.pin) {
      // Delete Account
      const indexDelete = accounts.findIndex(acc => acc.username === currentAccount.username)
      accounts.splice(indexDelete, 1)
      
      // Hide Ui   
      containerApp.style.opacity = 0
   }
   inputCloseUsername.value = inputClosePin.value = ""
})




let flagSorted = false
btnSort.addEventListener("click", function(e) {
   e.preventDefault()
   displayMovements(currentAccount, !flagSorted)
   flagSorted = !flagSorted
})