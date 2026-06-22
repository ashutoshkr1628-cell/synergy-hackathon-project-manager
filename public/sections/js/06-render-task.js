function renderTasks() {
  const searchFilter = document.getElementById("task-filter-search").value.toLowerCase();
  const priorityFilter = document.getElementById("task-filter-priority").value;
  const assigneeFilter = document.getElementById("task-filter-assignee").value;
  const assigneeSelect = document.getElementById("task-filter-assignee");
  const currentFilterVal = assigneeSelect.value;
  assigneeSelect.innerHTML = '<option value="all">All Assignees</option>';
  appState.members.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.name;
    opt.textContent = m.name;
    if (m.name === currentFilterVal) opt.selected = true;
    assigneeSelect.appendChild(opt);
  });
  const cols = {
    todo: document.querySelector('#col-todo .kanban-cards-container'),
    progress: document.querySelector('#col-progress .kanban-cards-container'),
    review: document.querySelector('#col-review .kanban-cards-container'),
    completed: document.querySelector('#col-completed .kanban-cards-container')
  };
  Object.keys(cols).forEach(k => { cols[k].innerHTML = ""; });
  const counts = { todo: 0, progress: 0, review: 0, completed: 0 };
  appState.tasks.forEach(t => {
    const matchSearch = t.title.toLowerCase().includes(searchFilter) || t.description.toLowerCase().includes(searchFilter);
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchAssignee = assigneeFilter === "all" || t.assignee === assigneeFilter;
    if (matchSearch && matchPriority && matchAssignee) {
      counts[t.status]++;
      const card = document.createElement("div");
      card.className = "task-card glass-panel";
      card.setAttribute("data-id", t.id);
      if (appState.activeRole === "developer") card.setAttribute("draggable", "true");
      const initials = t.assignee ? t.assignee.split(" ").map(n => n[0]).join("").toUpperCase() : "??";
      card.innerHTML = `
        <div class="task-card-header">
          <span class="cat-badge ${t.category.toLowerCase()}">${t.category}</span>
          <span class="pri-badge ${t.priority.toLowerCase()}">${t.priority}</span>
        </div>
        <div class="task-card-body">
          <h4>${t.title}</h4>
          <p>${t.description}</p>
        </div>
        <div class="task-card-footer">
          <div class="task-assignee-group">
            <div class="task-avatar-mini">${initials}</div>
            <span class="task-assignee-name">${t.assignee}</span>
          </div>
          <div class="task-card-actions">
            <button class="edit-task-btn" data-id="${t.id}" title="Edit Task">
              <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
            </button>
          </div>
        </div>
      `;
      card.addEventListener("dragstart", (e) => {
        if (appState.activeRole !== "developer") { e.preventDefault(); return; }
        e.dataTransfer.setData("text/plain", t.id);
        card.style.opacity = "0.5";
        taskMoveTime = Date.now();
      });
      card.addEventListener("dragend", () => { card.style.opacity = "1"; });

      // Urgency highlight for high-priority non-completed tasks
      if (t.status !== "completed") {
        if (t.priority === "High") card.classList.add("priority-urgent");
        else if (t.priority === "Medium") card.classList.add("priority-medium-pending");
      }

      cols[t.status].appendChild(card);
    }
  });
  Object.keys(counts).forEach(k => { document.getElementById(`count-${k}`).textContent = counts[k]; });
}
