// input from user (members)
let addbtn=document.querySelector("#firstbtn")
let todoinput=document.querySelector("#membername")
let arr=localStorage.getItem("todo")? JSON.parse(localStorage.getItem("todo")):[]
let todolistin=document.querySelector("#todolist")

addbtn.addEventListener('click',()=>{
    let obj={
        name:todoinput.value 
    }

    arr.push(obj)
    todoinput.value = "";
    todoinput.placeholder="Enter the name"

    localStorage.setItem("todo",JSON.stringify(arr))
    showlist()
    updatePaidBy(); 
    updateParticipants();
})
//adding then in ul
let showlist=()=>{
    let arr=localStorage.getItem("todo")? JSON.parse(localStorage.getItem("todo")):[]
    let list=''
    arr.forEach((item,index) => {
        list+=`<li><span>${index+1} ${item.name} </span></li>`
    });
    todolistin.innerHTML=list
}
showlist()
//expense and name input
let expensename=document.querySelector("#expensename")
let expenseamount=document.querySelector("#expenseamount")
let dbtn=document.getElementById('details')
const data1=document.getElementById('data1')
const data2=document.getElementById('data2')

function undatedata() {
    dbtn.addEventListener('click',()=>{
        const valuename=expensename.value
        const valueamount=expenseamount.value
        localStorage.setItem('expensename',valuename)
        localStorage.setItem('expenseamount',valueamount)

        const valuenames=localStorage.getItem('expensename')
        const valueamounts=localStorage.getItem('expenseamount')

        data1.innerText = "Expense Name : " + valuenames;
        data2.innerText = "Expense amount : " + valueamounts;
    })
}
undatedata()
//select who paid
let paidBySelect = document.querySelector("#paidby")
paidBySelect.addEventListener("change", () => {
    localStorage.setItem("paidBy", paidBySelect.value);
})

function updatePaidBy() {
    paidBySelect.innerHTML = "";
    let savedPaidBy = localStorage.getItem("paidBy");

    arr.forEach((member) => {
        let option = document.createElement("option");
        option.value = member.name;
        option.textContent = member.name;
        
        if (member.name === savedPaidBy) {
            option.selected = true; //so that after refreshing the page that option will be selected
        }
        paidBySelect.appendChild(option);
    });
}
updatePaidBy()
// after refreshing the page amount and expense name should be visible to user
window.addEventListener("load", () => {
    const savedName = localStorage.getItem("expensename");
    const savedAmount = localStorage.getItem("expenseamount");

    if (savedName) data1.innerText = "Expense Name : " + savedName;
    if (savedAmount) data2.innerText = "Expense amount : " + savedAmount;
});

let participantsDiv = document.querySelector("#participants");

function updateParticipants() {
    participantsDiv.innerHTML = "";

    let savedParticipants = localStorage.getItem("participants")
        ? JSON.parse(localStorage.getItem("participants"))
        : [];
// adding all participants to check who contributes
    arr.forEach((member) => {
        let label = document.createElement("label");
        let checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = member.name;

        if (savedParticipants.includes(member.name)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener("change", saveParticipants);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + member.name));
        participantsDiv.appendChild(label);
    });
}

function saveParticipants() {
    let selected = [];
    let checkboxes = participantsDiv.querySelectorAll("input");
//pushing selected options to selected array
    checkboxes.forEach((cb) => {
        if (cb.checked) selected.push(cb.value);
    });

    localStorage.setItem("participants", JSON.stringify(selected));
}
updateParticipants();

let expenses = localStorage.getItem("expenses") ? JSON.parse(localStorage.getItem("expenses"))
    : [];

let addExpenseBtn = document.querySelectorAll("button")[2];
let expenseTable = document.querySelector("#expenseTable");

addExpenseBtn.addEventListener("click", () => {
    let name = expensename.value;
    //as amount is integer so convert it into number
    let amount = Number(expenseamount.value);
    let paidBy = paidBySelect.value;

    let selectedParticipants = [];
    let checkboxes = document.querySelectorAll("#participants input");

    checkboxes.forEach(cb => {
        if (cb.checked) selectedParticipants.push(cb.value);
    });

    if (!name || !amount || selectedParticipants.length === 0) return;

    let expenseObj = {
        name: name,
        amount: amount,
        paidBy: paidBy,
        participants: selectedParticipants
    };

    expenses.push(expenseObj);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    showExpenses();
    calculateSettlement();

    expensename.value = "";
    expenseamount.value = "";
});
// making table of who paid details
function showExpenses() {
    let rows = "";
    expenses.forEach(exp => {
        rows += `
            <tr>
                <td>${exp.name}</td>
                <td>${exp.amount}</td>
                <td>${exp.paidBy}</td>
                <td>${exp.participants.join(", ")}</td>
            </tr>
        `;
    });
    expenseTable.innerHTML = rows;
}
showExpenses();
//summary table
let summaryTable = document.querySelector("#summaryTable");

function calculateSettlement() {
    let balance = {};
    let totalPaid = {};

    arr.forEach(member => {
        balance[member.name] = 0;
        totalPaid[member.name] = 0;
    });

    expenses.forEach(exp => {
        let share = exp.amount / exp.participants.length;

        totalPaid[exp.paidBy] += exp.amount;
        balance[exp.paidBy] += exp.amount;

        exp.participants.forEach(p => {
            balance[p] -= share;
        });
    });

    showSummary(totalPaid, balance);
}

function showSummary(totalPaid, balance) {
    let rows = "";

    for (let person in balance) {
        rows += `
            <tr>
                <td>${person}</td>
                <td>${totalPaid[person].toFixed(2)}</td>
                <td>${balance[person].toFixed(2)}</td>
            </tr>
        `;
    }

    summaryTable.innerHTML = rows;
}

calculateSettlement();
