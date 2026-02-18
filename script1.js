/* ========================== Selection of All required HTML elements =================== */

// header
const headUsername = document.querySelector('.user-name');
const completedTaskBtn = document.querySelector('.completedTask-btn');
const addTaskBtn = document.querySelector('.add-btn');
const filterTabs = document.querySelector('.tabs');
const filterTabList = filterTabs.querySelectorAll('.tab');

// tast-card
const taskGrid = document.querySelector('.task-grid');

// Add task Modal
const addTaskModal = document.querySelector('.add-task-modal');
const addTaskModalHead = addTaskModal.querySelector('.add-task-head');
const addTaskForm = document.querySelector('.add-task-form');
const addTaskTitleInput = addTaskForm.querySelector('.add-task-title');
const addTaskDescTextarea = addTaskForm.querySelector('.add-task-description');
const addTaskTagsList = addTaskForm.querySelectorAll('.task-tag');
const addTaskCancleBtn = addTaskForm.querySelector('.add-task-cancel-btn');
const addTaskSubmitBtn = addTaskForm.querySelector('.form-submit-btn');
const addTaskTitleErrorMsg = addTaskForm.querySelector('.writeTitle-errorMsg');
const addTaskDescErrorMsg = addTaskForm.querySelector('.writeDesc-errorMsg');
const addTaskTagErrorMsg = addTaskForm.querySelector('.selectTag-errorMsg');

// Edit Name Modal
const editNameModal = document.querySelector('.name-modal');
const editNameForm = document.querySelector('.edit-username-form');
const editNameUsername = editNameForm.querySelector('.task-username');
const editNameCancelBtn = editNameForm.querySelector('.edit-username-cancel-btn');
const editNameErrorMsg = editNameForm.querySelector('.editUsername-errorMsg');

// Floating Add Task Button
const fabBtn = document.querySelector('.fab');


let appTasks = [];
let appUsername;
let completedTask = 0;
let totalAddedTasks = 0;

let taskEditMode = false;
let editTaskId = "";

// Initial Application Start
(() => {
    loadApp();
    showUsername(appUsername);
    showAllTasks(appTasks);
    showUpdatedTaskInsights();
})();


// Default Memory Loader
function defaultAppStart(){
    return {
        username: "User",
        activeTab: "today",
        allTasks: []
    }
}

// Initial Loader
function loadApp() {
    appTasks = [];
    appUsername = "";
    completedTask = 0;
    totalAddedTasks = 0;

    const defaultValues = defaultAppStart();

    let user = localStorage.getItem('username');
    let tab = localStorage.getItem('activeTab');
    let tasks = localStorage.getItem('allTasks');

    let isAllSet = true;

    if (user === null) {
        isAllSet = false;
        user = defaultValues.username;
        setUsernameToLocalStorage(user);
    } else{
        appUsername = user;
    }
    
    if (tasks === null) {
        isAllSet = false;
        tasks = defaultValues.allTasks;
        localStorage.setItem('allTasks', JSON.stringify(tasks));
    } else {
        appTasks = JSON.parse(tasks);
        totalAddedTasks = appTasks.length;
    }
    
    if (tab === null) {
        isAllSet = false;
        tab = defaultValues.activeTab;
        setActiveTabToLocalStorage(tab);
    }

    if(totalAddedTasks > 0){
        JSON.parse(tasks).forEach((taskObj) => {
            if(taskObj.isCompleted) completedTask++;
        })
    }

    if(isAllSet === false)
            loadApp();
}


// filter task according to active tab
filterTabs.addEventListener('click', (evt) => {
    if(!(evt.target.classList.contains('tab'))) return;
    if((evt.target.classList.contains('active'))) return;

    filterTabList.forEach((tab) => {
        if(tab.classList.contains('active'))
            tab.classList.remove('active');
    })
    evt.target.classList.add('active');


    showAllTasks(filterAllTasks(appTasks, evt.target.textContent.trim()));
    
})



// Add Task Modal
addTaskBtn.addEventListener('click', () => {
    displayAddTaskForm();
})
fabBtn.addEventListener('click', () => {
    displayAddTaskForm();
})

addTaskForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    addTaskTitleErrorMsg.style.display = 'none';
    addTaskDescErrorMsg.style.display = 'none';
    addTaskTagErrorMsg.style.display = 'none';
    let title = validateTaskTitle(addTaskTitleInput.value);
    let description = validateTaskDescription(addTaskDescTextarea.value);
    let tags = validateTaskTags(addTaskTagsList);

    let taskObj = {};

    if(!title.success){
        addTaskTitleErrorMsg.textContent = `* ${title.error}`;
        addTaskTitleErrorMsg.style.display = 'initial';
    } else{
        addTaskTitleErrorMsg.style.display = 'none';
        taskObj.title = title.finalTitle;
    }
    
    if(!description.success){
        addTaskDescErrorMsg.textContent = `* ${description.error}`;
        addTaskDescErrorMsg.style.display = 'initial';
    } else{
        addTaskDescErrorMsg.style.display = 'none';
        taskObj.desc = description.finalDesc;
    }
    
    if(!tags.selection){
        addTaskTagErrorMsg.textContent = `* ${tags.error}`;
        addTaskTagErrorMsg.style.display = 'initial'; 
    } else{
        addTaskTagErrorMsg.style.display = 'none'; 
        taskObj.tags = [];
        tags.selectedTagList.forEach((tag) => {
            taskObj.tags.push(tag.tagName);
        })
    }

    
    if(title.success && description.success && tags.selection){
        taskCreationProcess(taskObj, taskEditMode);
    }

})

addTaskCancleBtn.addEventListener('click', ()=>{
    resetAddTaskFormFields();
    addTaskTitleErrorMsg.textContent = "";
    addTaskTagErrorMsg.textContent = "";
    addTaskModal.style.display = 'none';
    taskEditMode = false;
})

function resetAddTaskFormFields(){
    addTaskTitleInput.value = "";
    addTaskDescTextarea.value = "";
    addTaskTagsList.forEach((tag) => {
        if(tag.checked)
            tag.checked = false;
    })
    addTaskSubmitBtn.textContent = "";
}

function createTask(taskObj){
    let validatedTitle = validateTaskTitle(taskObj.title);
    let validatedDesc = validateTaskDescription(taskObj.desc);

    let TaskCreationDate = createDate();

    if(validatedTitle.success && validatedDesc.success){
        let currentTask = {
                            id: crypto.randomUUID(),
                            title: validatedTitle.finalTitle,
                            desc: validatedDesc.finalDesc,
                            tagList: taskObj.tags,
                            isCompleted: false,
                            createdDate: TaskCreationDate
                        }
        setTasksToLocalStorage(currentTask);
    return true;
    }
return false;
}


// Delete Task
taskGrid.addEventListener('click', (evt) =>{
    if(!(evt.target.classList.contains('card-delete-action'))) return;
    let card = evt.target.closest('.task-card');
    if(!(card)) return;
    removeDeletedTask(card, deleteTask(card.id));
    updateTaskInsights(false, false);
    showUpdatedTaskInsights();
})

// Edit Task
taskGrid.addEventListener('click', (evt) => {
    if(!(evt.target.classList.contains('card-edit-action'))) return;
    let card = evt.target.closest('.task-card');
    if(!card) return;
    editCard(card.id);
})





// Edit Name Modal 
headUsername.addEventListener('click', () => {
    editNameModal.style.display = "flex";
})

editNameForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    editNameErrorMsg.style.display = 'none';
    let validatedUsername = validateUsername(editNameUsername.value);
    if( validatedUsername.success ){
        setUsernameToLocalStorage(validatedUsername.finalUserame)
        showUsername(validatedUsername.finalUserame);
        editNameModal.style.display = 'none';
    } else{
        editNameErrorMsg.textContent = `* ${validatedUsername.error}`;
        editNameErrorMsg.style.display = 'initial';
    }
})

editNameCancelBtn.addEventListener('click', () => {
    editNameUsername.value = "";
    editNameErrorMsg.textContent = "";
    editNameErrorMsg.style.display = 'none';
    editNameModal.style.display = 'none';
})


function createDate(){
    const months = ["jan", "feb", "mar", "april", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];

    const date = new Date();
    let newDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

    return newDate;
}

function taskCreationProcess(taskObj, taskEditingMode){
    if(taskEditingMode === false){
        resetAddTaskFormFields();
        addTaskModal.style.display = 'none';

        createTask(taskObj);
        loadApp();
        showAddedTask(appTasks[appTasks.length-1]);
        updateTaskInsights(true, false);
        showUpdatedTaskInsights();
        return;
    } else{
        resetAddTaskFormFields();
        addTaskModal.style.display = 'none';

        updatedTask(taskObj);
        setAllTasksToLocalStorage(appTasks);
        showAllTasks(appTasks);
        taskEditMode = false;
        editTaskId = "";
    }
}

function displayAddTaskForm(){
    addTaskModalHead.textContent = "Add New Task";
    addTaskSubmitBtn.textContent = "Add Task"
    addTaskModal.style.display = 'flex';
}

function displayEditTaskForm(taskObj){
    addTaskModalHead.textContent = "Edit Task";
    addTaskTitleInput.value = taskObj.title;
    addTaskDescTextarea.value = taskObj.desc;
    addTaskSubmitBtn.textContent = "Save Task"
    
    addTaskTagsList.forEach((tag) => {
        if(taskObj.tagList.includes(tag.value))
            tag.checked = true;
    })
    addTaskModal.style.display = 'flex';
}

function showAllTasks(tasks){
    taskGrid.innerHTML = "";
    tasks.forEach((taskObj) => {
        taskGrid.appendChild(createTaskCard(taskObj));
    })
}

function showAddedTask(taskObj){
    taskGrid.appendChild(createTaskCard(taskObj));
}

function createTaskCard(task) {

  // ---- article ----
  const article = document.createElement("article");
  article.className = "task-card";
  article.id = task.id;

  // ---- rail ----
  const rail = document.createElement("div");
  rail.className = "task-rail";

  const checkbox = document.createElement("input");
  checkbox.className = "task-rail-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = task.isCompleted;

  rail.appendChild(checkbox);

  // ---- paper ----
  const paper = document.createElement("div");
  paper.className = "task-paper";

  // actions
  const actions = document.createElement("div");
  actions.className = "card-actions";

  const edit = document.createElement("span");
  edit.className = "card-action card-edit-action";
  edit.textContent = "✏️";

  const del = document.createElement("span");
  del.className = "card-action card-delete-action";
  del.textContent = "❌";

  actions.append(edit, del);

  // title + description
  const contentWrap = document.createElement("div");

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title;

  const desc = document.createElement("p");
  desc.className = "task-desc";
  desc.textContent = task.desc;

  contentWrap.append(title, desc);

  // ---- meta row ----
  const metaRow = document.createElement("div");
  metaRow.className = "meta-row";

  // tags
  const tagsWrap = document.createElement("div");
  tagsWrap.className = "tags";

  task.tagList.forEach(tag => {
    const tagEl = document.createElement("span");
    tagEl.className = `tag ${tag}`;
    tagEl.textContent = tag;
    tagsWrap.appendChild(tagEl);
  });

  // date
  const date = document.createElement("span");
  date.className = "date";
  date.textContent = task.createdDate;

  metaRow.append(tagsWrap, date);

  // ---- assemble ----
  paper.append(actions, contentWrap, metaRow);
  article.append(rail, paper);

  return article;
}

function showUpdatedTaskInsights(){
    completedTaskBtn.textContent = `${completedTask} / ${totalAddedTasks} Completed`;
}

function removeDeletedTask(task, isDeleted){
    if(!task || !(isDeleted)) return;
    task.remove();
}

/* ========== ============ Filteration =========== ============= */

function filterAllTasks(tasks, activeTab){

    let filteredTasks = [];
    switch (activeTab) {
        case "Today":
            filteredTasks = filterTodaysTasks(tasks);
            break;
        case "Pending":
            filteredTasks = filterPendingTasks(tasks);   
            break;
        case "Completed":
            filteredTasks = filterCompletedTasks(tasks);   
            break;
        default:
            filteredTasks = tasks;         
            break;
    }

    return filteredTasks;
}

function filterTodaysTasks(tasks){
    let todayDate = createDate();
    let todaysTasks = [];
    tasks.forEach((task) => {
        if(todayDate === task.createdDate)
            todaysTasks.push(task);
    })
    return todaysTasks;
}

function filterPendingTasks(tasks){
    let pendingTasks = [];
    tasks.forEach((task) => {
        if(task.isCompleted === false)
            pendingTasks.push(task);
    })
    return pendingTasks;
}

function filterCompletedTasks(tasks){
    let completedTasks = [];
    tasks.forEach((task) => {
        if(task.isCompleted === true)
            completedTasks.push(task);
    })
    return completedTasks;
}



// function to delete task object from appTask and Set Updated appTasks to local storage by using setAllTasksToLocalStorage() function
function deleteTask(id){
    let isDeleted = false;
    appTasks.forEach((task, taskIndex) => {
        if(task.id === id){
            let deletedItems = appTasks.splice(taskIndex, 1);
            if(deletedItems.length > 0)
                isDeleted = true;
        }
    })
    if(isDeleted){
        setAllTasksToLocalStorage(appTasks);
        return true;
    }
return false;
}

// function to show the username
function showUsername(name){
    if(name){
        headUsername.textContent = name;
    }
}

// Event Listener on task-grid for dynamically toggle checkbox of task-card
taskGrid.addEventListener('change', (evt) => {
    if(evt.target.classList.contains('task-rail-checkbox')){
        let task = evt.target.closest('.task-card');
        let taskId = task.id;

        toggleTaskCheckbox(taskId, evt.target.checked)
        updateTaskInsights(false, evt.target.checked);
        showUpdatedTaskInsights();
    }
})






// toggle checkbox from localStorage
function toggleTaskCheckbox(taskId, taskCheck){
    if(appTasks.length > 0){
        appTasks.forEach((taskObj) => {
            if(taskObj.id === taskId){
                taskObj.isCompleted = taskCheck;
            }
        })
        setAllTasksToLocalStorage(appTasks);
    }
}



/*============== =========== Setters =============== ================*/
function setUsernameToLocalStorage(username){
    let validName = validateUsername(username);
    if(validName.success){
        localStorage.setItem('username', validName.finalUserame);
        return true;
    }
return false;
}

function setTasksToLocalStorage(newTask){
    let oldTasks = JSON.parse(localStorage.getItem('allTasks'));
    oldTasks.push(newTask);
    if(oldTasks.length > 0){
        localStorage.setItem('allTasks', JSON.stringify(oldTasks));
        return true;
    }
    return false;
}

function setAllTasksToLocalStorage(allTasks){
    if(allTasks.length != null){
        localStorage.setItem('allTasks', JSON.stringify(allTasks));
        return true;
    }
    return false;
}

function setActiveTabToLocalStorage(tab){
    if(tab)
        localStorage.setItem('activeTab', tab);
}

function updateTaskInsights(isTaskAddded, isChecked){
    
    totalAddedTasks = appTasks.length;
    if(totalAddedTasks === 0) completedTask = 0;
    if(isTaskAddded === true) return;
    
    completedTask = 0;
    appTasks.forEach((task) => {
        if(task.isCompleted) completedTask++;
    })

    // if(!(completedTask > totalAddedTasks)){       
    //     if(isChecked === true && completedTask < totalAddedTasks) completedTask++;
    //     if(isChecked === false && completedTask > 0) completedTask--;
    // }
}

function updatedTask(taskObj){
    let currentTask = {};
    appTasks.forEach((task) => {
        if(task.id === editTaskId) currentTask = task;
    })
    let isTaskCompleted = currentTask.isCompleted;
    let validatedTitle = validateTaskTitle(taskObj.title);
    let validatedDesc = validateTaskDescription(taskObj.desc);

    if(validatedTitle.success && validatedDesc.success){
        let updatedTaskObj = {
                id: currentTask.id,
                title: validatedTitle.finalTitle,
                desc: validatedDesc.finalDesc,
                tagList: taskObj.tags,
                isCompleted: isTaskCompleted,
                createdDate: currentTask.createdDate
            }

        appTasks.forEach((task, taskIndex) => {
            if(task.id === currentTask.id)
                appTasks.splice(taskIndex, 1, updatedTaskObj);
        })
    }
}

function editCard(taskId){
    taskEditMode = true;
    let taskObj;
    appTasks.forEach((task) => {
        if(task.id === taskId) taskObj = task;
    })
    
    if(taskObj)
        displayEditTaskForm(taskObj);

    editTaskId = taskId;
}

/*=================== ================= ==================== ==========*/

// Validate users name
function validateUsername(username){
    if(typeof username !== "string"){
        return {
            success: false,
            error: "Please enter a valid name",
            finalUserame: null
        }
    }
    
    let trimedName = username.trim();
    let usernameRegex = /^[\p{L}\p{Extended_Pictographic}][\p{L}_ \-\p{Extended_Pictographic}]*$/u;
    
    if(trimedName.length > 30){
        return {
            success: false,
            error: "Name cannot exceed 30 characters",
            finalUserame: null
        }
    } 
    if(trimedName.length <= 0){
        return {
            success: false,
            error: "Name is required",
            finalUserame: null
        }
    } 
    if(trimedName.length <= 2){
        return {
            success: false,
            error: "Name must be at least 3 characters long",
            finalUserame: null
        }
    }
    
    if(!usernameRegex.test(trimedName)){
        console.log('regex')
        return {
            success: false,
            error: "Please enter a valid name",
            finalUserame: null
        }
    }

    return {
        success: true,
        error: null,
        finalUserame: trimedName
    }
}

// Validate task title
function validateTaskTitle(title){
    if(typeof title !== "string"){
        return {
            success: false,
            error: "Please enter a valid title",
            finalUserame: null
        }
    }

    let trimedTitel = title.trim();
    let titleRegex = /^(?=.*\S).{3,100}$/;

    if(trimedTitel.length <= 2 || trimedTitel.length >= 100){
        if(trimedTitel.length <= 0){
            return {
                success: false,
                error: "Title is required",
                finalTitle: null
            }
        } else if(trimedTitel.length < 3){
            return {
                success: false,
                error: "Title must be at least 3 characters long",
                finalTitle: null
            }
        } else{
            return {
                    success: false,
                    error: "Title cannot exceed 100 characters",
                    finalTitle: null
                }
        }
    }

    if(!titleRegex.test(trimedTitel)){
        return {
            success: false,
            error: "Title must be 3–100 characters and cannot be empty",
            finalTitle: null
        }
    }

    return {
        success: true,
        error: null,
        finalTitle: trimedTitel
    }
}

// Validate task description
function validateTaskDescription(desc) {
    let trimedDesc = desc.trim();

    if(trimedDesc.length > 500){
        return {
            success: false,
            error: "Description cannot exceed 500 characters"
        }
    }
    const descRegex = /^$|^(?=.*\S)[\s\S]{1,500}$/;

    if (!descRegex.test(trimedDesc)) {
        return {
            success: false,
            error: "Invalid description",
            finalDesc: null
        }
    }

    return {
            success: true,
            error: null,
            finalDesc: trimedDesc
        }
}

// Validate task selected Tags
function validateTaskTags(tags){
    let allTags = new Set(["urgent", "important", "norush"]);
    let selectedTags = [...tags]
                    .filter((tag) => tag.checked && allTags.has(tag.value))
                    .map((tag) => {
                        return {
                            tagSelected: true,
                            tagName: tag.value
                        }
                    });
    

    return {
        selection: selectedTags.length > 0,
        error: selectedTags.length ? null : "Please select at least one tag",
        selectedTagList: selectedTags.length ? selectedTags : null
    }
}