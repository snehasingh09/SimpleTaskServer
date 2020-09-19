var minServerCount = 1
var ServerCount = minServerCount
var maxProcessAllowed = 10
var CompletedTasks = []
var RunningTasks = []
var WaitingTasks = []
var taskIDCount = 0
var initialTimeInMS = 20000
var pollFrequencyInMS = 100

const pad = (num, size) => {
    return ('000' + num).slice(size * -1);
}

function msToHMS(ms) {
    var seconds = parseInt(ms / 1000);
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

class Task {
    constructor() {
        this.taskID = taskIDCount++
        this.status = 'waiting'
        this.value = initialTimeInMS
    }
}

const CheckTaskStatus = async () => {
    if (RunningTasks.length > 0) {
        while (RunningTasks.length > 0 && RunningTasks[0].status === 'completed') {
            let completedTask = RunningTasks.shift()
            CompletedTasks.push(completedTask)
        }
    }
    if (RunningTasks.length < Math.min(ServerCount, maxProcessAllowed)) {
        if (WaitingTasks.length > 0) {
            let nextTask = WaitingTasks.shift()
            RunningTasks.push(nextTask)
        }
    }
    await ReRender()
}

const ReRender = async () => {
    let completedDiv = document.getElementById('completed')
    completedDiv.innerHTML = ''
    for (let i = 0; i < CompletedTasks.length; i++) {
        completedDiv.innerHTML += '<div class="light-grey round width">\
        <div class="container blue round" style="width:98.5%">Completed</div>\
    </div>'
    }
    let waitingDiv = document.getElementById('waiting')
    waitingDiv.innerHTML = ''
    for (let i = 0; i < WaitingTasks.length; i++) {
        waitingDiv.innerHTML += `<div style="width: 73%;margin-top: 7px;" onclick="delTask(${WaitingTasks[i].taskID})">\
        <span class="fa fa-trash fa-lg round" style="float: right;" aria-hidden="true"></span>\
    </div>\
    <div class="light-grey round width">\
        <div class="container round" style="width:0px;color: #2196F3;">Waiting...</div>\
    </div>`
    }
    let runningDiv = document.getElementById('running')
    runningDiv.innerHTML = ''
    for (let i = 0; i < RunningTasks.length; i++) {
        runningDiv.innerHTML += `<div class="light-grey round width">\
        <div class="container blue round" style="width:${100 - 100 * RunningTasks[i].value / initialTimeInMS}%">${msToHMS(RunningTasks[i].value)}</div>\
    </div>`
    }
}

const addTask = async () => {
    let num = parseInt(document.getElementById('taskInput').value)
    document.getElementById('taskInput').value = 0;
    for (let i = 0; i < num; i++) {
        WaitingTasks.push(new Task())
    }
    await CheckTaskStatus()
}

const delTask = async (taskID) => {
    WaitingTasks = WaitingTasks.filter(function (task, index, arr) { return taskID != task.taskID })
    await CheckTaskStatus()
}

const addServer = async () => {
    ServerCount += 1
    await CheckTaskStatus()
}

const delServer = async () => {
    if (ServerCount >= minServerCount + 1) {
        ServerCount -= 1
    }
    await CheckTaskStatus()
}

const updateRunningTasks = async () => {
    RunningTasks.forEach((task) => {
        task.value -= pollFrequencyInMS
        if (task.value <= 0) {
            task.value = 0
            task.status = 'completed'
        }
    })
    await CheckTaskStatus()
}

setInterval(updateRunningTasks, pollFrequencyInMS)
