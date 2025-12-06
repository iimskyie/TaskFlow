/* Central JS for TaskFlow app
   - demo data init (your assignments)
   - tasks/projects CRUD (localStorage)
   - dashboard rendering + Chart.js
   - helpers: escapeHtml, genId, nextDate
   - profile avatar, dark mode, session management
*/

/* ---------- Utilities ---------- */
function genId(){
  return 'id-' + Math.random().toString(36).slice(2,10);
}

function nextDate(days){
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

function escapeHtml(s){
  if(!s) return '';
  return s.replaceAll('&','&amp;')
          .replaceAll('<','&lt;')
          .replaceAll('>','&gt;');
}

/* ---------- Dark mode helpers ---------- */
function applyDarkModePreference(){
  const pref = localStorage.getItem('tm_dark') || 'light';
  if (pref === 'dark'){
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

function toggleDarkMode(){
  document.documentElement.classList.toggle('dark-mode');
  const mode = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('tm_dark', mode);
}

/* ---------- Demo data initialize (one-time) ---------- */
function initDemoData(){
  // Use a version flag so your new demo data is created once
  if (!localStorage.getItem('tm_demo_v2')){
    const demoTasks = [
      {
        id: genId(),
        title: 'Finish Coding',
        project: 'IMS566 Individual Assignment',
        due: '2025-12-07',
        priority: 'High',
        status: 'In Progress'
      },
      {
        id: genId(),
        title: 'Meeting Schedule',
        project: 'IMS565 Group Assignment',
        due: '2025-12-12',
        priority: 'High',
        status: 'Todo'
      }
    ];

    const demoProjects = [
      {
        id: genId(),
        name: 'IMS566 Individual Assignment',
        desc: 'HTML/Bootstrap Coding'
      },
      {
        id: genId(),
        name: 'IMS565 Group Assignment',
        desc: 'Company Interview'
      },
      {
        id: genId(),
        name: 'LCC501 Pair Work',
        desc: 'Formal and Informal Letter'
      },
      {
        id: genId(),
        name: 'IMS564 Individual Assignment',
        desc: 'Tracking App Review'
      }
    ];

    localStorage.setItem('tm_tasks', JSON.stringify(demoTasks));
    localStorage.setItem('tm_projects', JSON.stringify(demoProjects));
    localStorage.setItem('tm_demo_v2', '1');
  }
}

/* ---------- Dashboard rendering ---------- */
let statusChart = null;

function renderDashboard(){
  const tasks = JSON.parse(localStorage.getItem('tm_tasks') || '[]');
  const projects = JSON.parse(localStorage.getItem('tm_projects') || '[]');

  const elTotal = document.getElementById('totalTasks');
  if (elTotal) elTotal.textContent = tasks.length;

  const elCompleted = document.getElementById('completedTasks');
  if (elCompleted) elCompleted.textContent = tasks.filter(t => t.status === 'Done').length;

  const elProj = document.getElementById('activeProjects');
  if (elProj) elProj.textContent = projects.length;

  // recent tasks
  const recentList = document.getElementById('recentList');
  if (recentList){
    const recent = tasks.slice().sort((a,b)=> (a.due||'') > (b.due||'') ? 1 : -1).slice(0,6);
    if (recent.length === 0){
      recentList.innerHTML = '<div class="text-muted p-2">No recent tasks</div>';
    } else {
      recentList.innerHTML = recent.map(r => `
        <div class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">${escapeHtml(r.title)}</div>
            <div class="small text-muted">${escapeHtml(r.project)} • ${r.status} • due ${r.due || '-'}</div>
          </div>
          <div class="small text-muted">${r.priority}</div>
        </div>
      `).join('');
    }
  }

  // chart
  const canvas = document.getElementById('statusChart');
  if (canvas && window.Chart){
    const counts = { 'Todo': 0, 'In Progress': 0, 'Done': 0 };
    tasks.forEach(t => {
      if (!counts[t.status]) counts[t.status] = 0;
      counts[t.status]++;
    });

    const ctx = canvas.getContext('2d');
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#6c757d', '#0d6efd', '#198754']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

/* ---------- Tasks view ---------- */
function renderTasksTable(){
  const tasks = JSON.parse(localStorage.getItem('tm_tasks') || '[]');
  const tbody = document.querySelector('#tasksTable tbody');
  if (!tbody) return;

  if (tasks.length === 0){
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-muted">No tasks available.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tasks.map(t => `
    <tr>
      <td>${escapeHtml(t.title)}</td>
      <td>${escapeHtml(t.project)}</td>
      <td>${t.due || '-'}</td>
      <td>${t.priority}</td>
      <td>
        <span class="badge ${
          t.status === 'Done' ? 'bg-success' :
          t.status === 'In Progress' ? 'bg-info' : 'bg-secondary'
        }">${t.status}</span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary rounded-pill me-1" onclick="editTask('${t.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="deleteTask('${t.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

const taskForm = document.getElementById('taskForm');
if (taskForm){
  taskForm.onsubmit = function(e){
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const task = {
      id: id || genId(),
      title: document.getElementById('taskTitle').value.trim(),
      project: document.getElementById('taskProject').value,
      due: document.getElementById('taskDue').value,
      priority: document.getElementById('taskPriority').value,
      status: document.getElementById('taskStatus').value
    };
    if (!task.title){
      alert('Title required');
      return;
    }
    let arr = JSON.parse(localStorage.getItem('tm_tasks') || '[]');
    if (id){
      arr = arr.map(x => x.id === id ? task : x);
    } else {
      arr.push(task);
    }
    localStorage.setItem('tm_tasks', JSON.stringify(arr));
    const modalEl = document.getElementById('taskModal');
    if (modalEl){
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    renderTasksTable();
    renderDashboard();
  };
}

function editTask(id){
  const arr = JSON.parse(localStorage.getItem('tm_tasks') || '[]');
  const t = arr.find(x => x.id === id);
  if (!t) return;
  document.getElementById('taskId').value = t.id;
  document.getElementById('taskTitle').value = t.title;
  populateProjectSelect();
  document.getElementById('taskProject').value = t.project;
  document.getElementById('taskDue').value = t.due;
  document.getElementById('taskPriority').value = t.priority;
  document.getElementById('taskStatus').value = t.status;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  const m = new bootstrap.Modal(document.getElementById('taskModal'));
  m.show();
}

function clearTaskForm(){
  document.getElementById('taskId').value = '';
  document.getElementById('taskTitle').value = '';
  populateProjectSelect();
  document.getElementById('taskProject').value = '';
  document.getElementById('taskDue').value = '';
  document.getElementById('taskPriority').value = 'Low';
  document.getElementById('taskStatus').value = 'Todo';
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = 'New Task';
}

function deleteTask(id){
  if (!confirm('Delete this task?')) return;
  let arr = JSON.parse(localStorage.getItem('tm_tasks') || '[]');
  arr = arr.filter(x => x.id !== id);
  localStorage.setItem('tm_tasks', JSON.stringify(arr));
  renderTasksTable();
  renderDashboard();
}

/* ---------- Projects view ---------- */
function renderProjectsList(){
  const projects = JSON.parse(localStorage.getItem('tm_projects') || '[]');
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  if (projects.length === 0){
    container.innerHTML = '<div class="text-muted p-3">No projects yet.</div>';
    return;
  }

  container.innerHTML = projects.map(p => `
    <div class="col-12 col-md-6 col-lg-4" data-aos="fade-up">
      <div class="card p-3 h-100">
        <h5 class="mb-1">${escapeHtml(p.name)}</h5>
        <div class="small text-muted mb-3">${escapeHtml(p.desc)}</div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" onclick="editProject('${p.id}')">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${p.id}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

const projForm = document.getElementById('projectForm');
if (projForm){
  projForm.onsubmit = function(e){
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const p = {
      id: id || genId(),
      name: document.getElementById('projectName').value.trim(),
      desc: document.getElementById('projectDesc').value.trim()
    };
    if (!p.name){
      alert('Project name required');
      return;
    }
    let arr = JSON.parse(localStorage.getItem('tm_projects') || '[]');
    if (id){
      arr = arr.map(x => x.id === id ? p : x);
    } else {
      arr.push(p);
    }
    localStorage.setItem('tm_projects', JSON.stringify(arr));
    const modalEl = document.getElementById('projectModal');
    if (modalEl){
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    renderProjectsList();
    renderDashboard();
    populateProjectSelect();
  };
}

function editProject(id){
  const arr = JSON.parse(localStorage.getItem('tm_projects') || '[]');
  const p = arr.find(x => x.id === id);
  if (!p) return;
  document.getElementById('projectId').value = p.id;
  document.getElementById('projectName').value = p.name;
  document.getElementById('projectDesc').value = p.desc;
  const titleEl = document.getElementById('projectModalTitle');
  if (titleEl) titleEl.textContent = 'Edit Project';
  const m = new bootstrap.Modal(document.getElementById('projectModal'));
  m.show();
}

function deleteProject(id){
  if (!confirm('Delete this project? Tasks with this project will keep their project field. Continue?')) return;
  let arr = JSON.parse(localStorage.getItem('tm_projects') || '[]');
  arr = arr.filter(x => x.id !== id);
  localStorage.setItem('tm_projects', JSON.stringify(arr));
  renderProjectsList();
  renderDashboard();
  populateProjectSelect();
}

/* ---------- Helper: populate project select ---------- */
function populateProjectSelect(){
  const select = document.getElementById('taskProject');
  if (!select) return;
  const projects = JSON.parse(localStorage.getItem('tm_projects') || '[]');
  select.innerHTML = '<option value="">- none -</option>' +
    projects.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('');
}

/* ---------- Initial page setup ---------- */
function initialPageSetup(){
  // Dark mode
  applyDarkModePreference();
  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle){
    darkToggle.addEventListener('click', toggleDarkMode);
  }

  // Demo data + views
  initDemoData();
  try { renderTasksTable(); } catch(e){}
  try { renderProjectsList(); } catch(e){}
  try { renderDashboard(); } catch(e){}
}
