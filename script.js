let allFilter = document.querySelectorAll(".filter div");
let grid = document.querySelector(".grid");
let addbtn = document.querySelector(".add");
let body = document.querySelector("body");
let uid = new ShortUniqueId();
let modalVisible = false;
let colors = {
    pink: "hotpink",
    green: "lawngreen",
    blue: "dodgerblue",
    black: "black"
}
let colorClasses = ["pink", "green", "blue", "black"];
let deleteaBtn = document.querySelector(".delete");
let deleteState = false;
if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify([]));
}
deleteaBtn.addEventListener("click", function (e) {
    if (deleteState) {
        deleteState = false;
        e.currentTarget.classList.remove("delete-state");

    }
    else {
        deleteState = true;
        e.currentTarget.classList.add("delete-state");
    }
})
addbtn.addEventListener("click", function () {
    if (modalVisible)
        return;
    if (deleteaBtn.classList.contains("delete-state")) {
        deleteState = false;
        deleteaBtn.classList.remove("delete-state");
    }
    let modal = document.createElement("div");
    modal.classList.add("modal-container");
    modal.setAttribute("click-first", true);
    modal.innerHTML = `<div class="writing-area" contenteditable>Enter Your Task</div>
    <div class="filter-area">
        <div class="modal-filter pink"></div>
        <div class="modal-filter green"></div>
        <div class="modal-filter blue"></div>
        <div class="modal-filter black" active-modal-filter></div>
    </div>`;

    let allModalFilter = modal.querySelectorAll(".modal-filter");

    for (let i = 0; i < allModalFilter.length; i++) {
        allModalFilter[i].addEventListener("click", function (e) {
            for (let j = 0; j < allModalFilter.length; j++) {
                allModalFilter[j].classList.remove("active-modal-filter");
            }
            e.currentTarget.classList.add("active-modal-filter");
        })
    }

    let wa = modal.querySelector(".writing-area");
    wa.addEventListener("click", function (e) {
        if (modal.getAttribute("click-first") == "true") {
            wa.innerHTML = "";
            modal.setAttribute("click-first", false);
        }
    });

    wa.addEventListener("keypress", function (e) {
        if (e.key == "Enter") {
            let task = e.currentTarget.innerText;
            let selectedModalFilter = document.querySelector(".active-modal-filter");
            let color = selectedModalFilter.classList[1];
            let ticket = document.createElement("div");
            let id = uid();
            ticket.classList.add("ticket");
            ticket.innerHTML = `<div class="ticket">
            <div class="ticket-color ${color}" ></div>
            <div class="ticket-id">#${id}</div>
            <div class="ticket-box" contenteditable>${task}</div>
        </div>`;

            saveTicketInLocalStorage(id, color, task);

            let ticketWritingArea = ticket.querySelector(".ticket-box");

            ticketWritingArea.addEventListener("input", ticketWritingAreaHandler);

            ticket.addEventListener("click", function (e) {
                if (deleteState) {
                    let id = e.currentTarget.querySelector(".ticket-id").innerText.split("#")[1];

                    let taskArray = JSON.parse(localStorage.getItem("tasks"));
                    taskArray = taskArray.filter(function (el) {
                        return el.id != id;
                    });
                    localStorage.setItem("tasks", JSON.stringify(taskArray));

                    e.currentTarget.remove();
                }
            });

            let ticketColorDiv = ticket.querySelector(".ticket-color");

            ticketColorDiv.addEventListener("click", ticketColorHandler);

            grid.appendChild(ticket);
            modal.remove();
            modalVisible = false;
        }
    });

    body.appendChild(modal);
    modalVisible = true;
});

for (let i = 0; i < allFilter.length; i++) {
    allFilter[i].addEventListener("click", function (e) {
        if (e.currentTarget.parentElement.classList.contains("selected-filter")) {
            e.currentTarget.parentElement.classList.remove("selected-filter");
            loadTasks();
        } else {
            let color = e.currentTarget.classList[0].split("-")[0];
            e.currentTarget.parentElement.classList.add("selected-filter");
            loadTasks(color);
        }
    });
}

function saveTicketInLocalStorage(id, color, task) {
    let requiredObject = { id, color, task }
    let taskArray = JSON.parse(localStorage.getItem("tasks")); // this returns array of (stringified) tasks which is already present in localstorage
    taskArray.push(requiredObject);
    localStorage.setItem("tasks", JSON.stringify(taskArray));

}
function ticketWritingAreaHandler(e) {
    let id = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
    //ticketWritingArea ke parent(ticket) ka queryselector(ticket-id) ke innerText ko '# se split krke 'id' dedo
    let taskArray = JSON.parse(localStorage.getItem("tasks"));
    let requiredIndex = -1;
    for (let i = 0; i < taskArray.length; i++) {
        if (taskArray[i].id == id) {
            requiredIndex = i;
            break;
        }
    }
    taskArray[requiredIndex].task = e.currentTarget.innerText;
    localStorage.setItem("tasks", JSON.stringify(taskArray));
}
function ticketColorHandler(e) {

    let id = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
    let taskArray = JSON.parse(localStorage.getItem("tasks"));
    let requiredIndex = -1;
    for (let i = 0; i < taskArray.length; i++) {
        if (taskArray[i].id == id) {
            requiredIndex = i;
            break;
        }
    }

    let currColor = e.currentTarget.classList[1];
    let index = colorClasses.indexOf(currColor);
    index++;
    index = index % colorClasses.length;
    e.currentTarget.classList.remove(currColor);
    e.currentTarget.classList.add(colorClasses[index]);

    taskArray[requiredIndex].color = colorClasses[index];
    localStorage.setItem("tasks", JSON.stringify(taskArray));
}
function loadTasks(passedColor) {
    let allTickets = document.querySelectorAll(".ticket")
    for (let t = 0; t < allTickets.length; t++)
        allTickets[t].remove();

    let tasks = JSON.parse(localStorage.getItem("tasks"));
    for (let i = 0; i < tasks.length; i++) {
        let id = tasks[i].id;
        let color = tasks[i].color;
        let taskValue = tasks[i].task;
        if (passedColor) {
            if (passedColor != color) {
                continue;
            }
        }

        let ticket = document.createElement("div");
        ticket.classList.add("ticket");
        ticket.innerHTML = `<div class="ticket">
        <div class="ticket-color ${color}" ></div>
        <div class="ticket-id">#${id}</div>
        <div class="ticket-box" contenteditable>${taskValue}</div>
    </div>`;

        let ticketWritingArea = ticket.querySelector(".ticket-box");
        ticketWritingArea.addEventListener("input", ticketWritingAreaHandler);

        let ticketColorDiv = ticket.querySelector(".ticket-color");
        ticketColorDiv.addEventListener("click", ticketColorHandler);

        ticket.addEventListener("click", function (e) {
            if (deleteState) {
                let id = e.currentTarget.querySelector(".ticket-id").innerText.split("#")[1];

                let taskArray = JSON.parse(localStorage.getItem("tasks"));
                taskArray = taskArray.filter(function (el) {
                    return el.id != id;
                });
                localStorage.setItem("tasks", JSON.stringify(taskArray));

                e.currentTarget.remove();
            }
        });
        grid.appendChild(ticket);
    }
}
loadTasks();