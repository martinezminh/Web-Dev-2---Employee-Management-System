
/* Employee Management System - Frontend */

const API_BASE = 'http://localhost:3000/api/employees';

const view = document.getElementById('view');
const modalOverlay = document.getElementById('ov');
const modal = document.getElementById('modal');
const toastBox = document.getElementById('toast');
const dashboardLink = document.getElementById('nav-dashboard');
const employeesLink = document.getElementById('nav-employees');
const logo = document.getElementById('logo');

let employees = [];
let currentPage = 'dashboard';
let toastTimer;

/* ---------- Helpers ---------- */

function icon(name, size = 18) {
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2"/>'
  };

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function fullName(employee) {
  return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unnamed employee';
}

function isActive(employee) {
  return Number(employee.status) === 1;
}

function initials(employee) {
  return (
    (employee.first_name || '').trim().charAt(0) +
    (employee.last_name || '').trim().charAt(0)
  ).toUpperCase() || 'NA';
}

function money(value) {
  return Number(value || 0).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  });
}

function showToast(message) {
  toastBox.textContent = message;
  toastBox.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastBox.classList.remove('show'), 2800);
}

function setActiveNav(page) {
  dashboardLink.classList.toggle('on', page === 'dashboard');
  employeesLink.classList.toggle('on', page === 'employees');
}

function showLoading() {
  view.innerHTML = '<div class="card empty">Loading employees...</div>';
}

function showError(message) {
  view.innerHTML = `
    <div class="head">
      <div>
        <div class="eyebrow">Connection</div>
        <h1>Unable to load employees</h1>
        <p class="sub">${escapeHTML(message)}</p>
      </div>
      <button class="btn pri" id="retry-btn">Try again</button>
    </div>`;

  document.getElementById('retry-btn')?.addEventListener('click', loadEmployees);
}

/* ---------- API ---------- */

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof result === 'object' && result
        ? result.message || result.error || `Request failed (${response.status})`
        : result || `Request failed (${response.status})`
    );
  }

  return result;
}

function extractEmployeeList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.employees)) return result.employees;
  if (Array.isArray(result?.results)) return result.results;
  return [];
}

async function loadEmployees() {
  showLoading();

  try {
    const result = await apiRequest(API_BASE);
    employees = extractEmployeeList(result);
    renderPage();
  } catch (error) {
    showError(error.message || 'Check your server and database.');
  }
}

/* ---------- Page layout ---------- */

function pageHeading(eyebrow, title, subtitle, action = '') {
  return `
    <div class="head">
      <div>
        <div class="eyebrow">${eyebrow}</div>
        <h1>${title}</h1>
        <p class="sub">${subtitle}</p>
      </div>
      ${action}
    </div>`;
}

function employeeTable(list, showActions = true) {
  if (!list.length) return '<div class="empty">No employees found.</div>';

  return `
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Organization</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Status</th>
            ${showActions ? '<th style="text-align:right;padding-right:24px">Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${list.map(employee => `
            <tr>
              <td>
                <div class="who">
                  <div class="av" style="background:var(--brand-soft);color:var(--brand)">
                    ${escapeHTML(initials(employee))}
                  </div>
                  <div>
                    <b>${escapeHTML(fullName(employee))}</b>
                    <small>${escapeHTML(employee.email || '')}</small>
                  </div>
                </div>
              </td>
              <td>${escapeHTML(employee.organization || '—')}</td>
              <td>${escapeHTML(employee.designation || '—')}</td>
              <td>${money(employee.salary)}</td>
              <td>
                <span class="pill ${isActive(employee) ? 'active' : 'inactive'}">
                  <i aria-hidden="true"></i>${isActive(employee) ? 'Active' : 'Inactive'}
                </span>
              </td>
              ${showActions ? `
                <td>
                  <div class="acts">
                    <button type="button" data-act="view" data-id="${escapeHTML(employee.id)}">${icon('eye', 16)}</button>
                    <button type="button" data-act="edit" data-id="${escapeHTML(employee.id)}">${icon('edit', 16)}</button>
                    <button type="button" data-act="del" data-id="${escapeHTML(employee.id)}">${icon('trash', 16)}</button>
                  </div>
                </td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---------- Dashboard ---------- */

function renderDashboard() {
  const total = employees.length;
  const active = employees.filter(isActive).length;
  const inactive = total - active;
  const recent = [...employees].slice(-5).reverse();

  view.innerHTML = `
    ${pageHeading('OVERVIEW', 'Dashboard', 'A quick overview of your employees.',
      `<button class="btn pri" id="add-employee-btn">${icon('plus', 17)} Add Employee</button>`)}
    <section class="stats">
      <div class="card stat">
        <div class="l">Total Employees</div>
        <div class="n">${total}</div>
        <div class="d">Employees in the database</div>
        <div class="ic">${icon('users', 22)}</div>
      </div>
      <div class="card stat">
        <div class="l">Active Employees</div>
        <div class="n">${active}</div>
        <div class="d">Currently marked active</div>
        <div class="ic alt">${icon('briefcase', 22)}</div>
      </div>
      <div class="card stat">
        <div class="l">Inactive Employees</div>
        <div class="n">${inactive}</div>
        <div class="d">Currently marked inactive</div>
        <div class="ic">${icon('users', 22)}</div>
      </div>
    </section>
    <section class="card">
      <div class="ch">
        <div><h2>Recent Employees</h2><p>Latest records from your employee list</p></div>
        <a class="link" href="#employees">View all ${icon('arrow', 15)}</a>
      </div>
      ${employeeTable(recent, false)}
    </section>`;

  document.getElementById('add-employee-btn')
    .addEventListener('click', () => openEmployeeForm());
}

/* ---------- Employees page ---------- */

function renderEmployees() {
  view.innerHTML = `
    ${pageHeading('WORKSPACE', 'Employees', 'Manage your employee records.',
      `<button class="btn pri" id="add-employee-btn">${icon('plus', 17)} Add Employee</button>`)}
    <section class="card">
      <div class="bar">
        <span class="count">${employees.length} ${employees.length === 1 ? 'employee' : 'employees'}</span>
      </div>
      ${employeeTable(employees)}
    </section>`;

  document.getElementById('add-employee-btn')
    .addEventListener('click', () => openEmployeeForm());
}

/* ---------- Modal ---------- */

function openModal(content) {
  modal.innerHTML = content;
  modalOverlay.classList.add('show');
  modalOverlay.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modalOverlay.classList.remove('show');
  modalOverlay.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '';
}

function employeeFields(employee = {}) {
  const currentStatus = Number(employee.status ?? 1);

  return `
    <label class="fld">First Name
      <input name="first_name" required maxlength="100" value="${escapeHTML(employee.first_name || '')}">
    </label>

    <label class="fld">Last Name
      <input name="last_name" required maxlength="100" value="${escapeHTML(employee.last_name || '')}">
    </label>

    <label class="fld">Email
      <input name="email" type="email" required maxlength="150" value="${escapeHTML(employee.email || '')}">
    </label>

    <label class="fld">Phone
      <input name="phone" type="tel" maxlength="30" value="${escapeHTML(employee.phone || '')}">
    </label>

    <label class="fld">Organization
      <input name="organization" maxlength="150" value="${escapeHTML(employee.organization || '')}">
    </label>

    <label class="fld">Designation
      <input name="designation" maxlength="150" value="${escapeHTML(employee.designation || '')}">
    </label>

    <label class="fld">Salary
      <input name="salary" type="number" min="0" step="0.01" value="${escapeHTML(employee.salary ?? 0)}">
    </label>

    <label class="fld">Status
      <select name="status">
        <option value="1" ${currentStatus === 1 ? 'selected' : ''}>Active</option>
        <option value="0" ${currentStatus === 0 ? 'selected' : ''}>Inactive</option>
      </select>
    </label>`;
}

function openEmployeeForm(employee = null) {
  const editing = Boolean(employee);

  openModal(`
    <h3>${editing ? 'Edit Employee' : 'Add Employee'}</h3>
    <form id="employee-form">
      ${employeeFields(employee || {})}
      <div class="err" id="form-error"></div>
      <div class="foot">
        <button type="button" class="btn ghost" id="cancel-modal">Cancel</button>
        <button type="submit" class="btn pri">${editing ? 'Save Changes' : 'Add Employee'}</button>
      </div>
    </form>`);

  document.getElementById('cancel-modal').addEventListener('click', closeModal);

  document.getElementById('employee-form').addEventListener('submit', async event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    payload.salary = Number(payload.salary || 0);
    payload.status = Number(payload.status);

    const errorBox = document.getElementById('form-error');
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = editing ? 'Saving...' : 'Adding...';
    errorBox.textContent = '';

    try {
      const url = editing
        ? `${API_BASE}/${encodeURIComponent(employee.id)}`
        : API_BASE;

      const result = await apiRequest(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      if (result?.error === true) {
        throw new Error(result.message || 'Unable to save employee.');
      }

      closeModal();
      await loadEmployees();

      showToast(editing
        ? 'Employee updated successfully.'
        : 'Employee added successfully.');

    } catch (error) {
      errorBox.textContent = error.message || 'Unable to save employee.';
      submitButton.disabled = false;
      submitButton.textContent = editing ? 'Save Changes' : 'Add Employee';
    }
  });
}

/* ---------- View employee ---------- */

function openViewModal(employee) {
  openModal(`
    <div class="vh">
      <div class="av lg" style="background:var(--brand-soft);color:var(--brand)">
        ${escapeHTML(initials(employee))}
      </div>
      <div>
        <b>${escapeHTML(fullName(employee))}</b>
        <span>${escapeHTML(employee.designation || 'Employee')}</span>
      </div>
    </div>

    <dl class="dl">
      <dt>Email</dt><dd>${escapeHTML(employee.email || '—')}</dd>
      <dt>Phone</dt><dd>${escapeHTML(employee.phone || '—')}</dd>
      <dt>Organization</dt><dd>${escapeHTML(employee.organization || '—')}</dd>
      <dt>Designation</dt><dd>${escapeHTML(employee.designation || '—')}</dd>
      <dt>Salary</dt><dd>${money(employee.salary)}</dd>
      <dt>Status</dt><dd>${isActive(employee) ? 'Active' : 'Inactive'}</dd>
    </dl>

    <div class="foot">
      <button type="button" class="btn ghost" id="close-view">Close</button>
    </div>`);

  document.getElementById('close-view').addEventListener('click', closeModal);
}

/* ---------- Delete employee ---------- */

async function deleteEmployee(employee) {
  const confirmed = window.confirm(`Delete ${fullName(employee)}?`);
  if (!confirmed) return;

  try {
    await apiRequest(`${API_BASE}/${encodeURIComponent(employee.id)}`, {
      method: 'DELETE'
    });

    showToast('Employee deleted successfully.');
    await loadEmployees();

  } catch (error) {
    showToast(error.message || 'Unable to delete employee.');
  }
}

/* ---------- Click handling ---------- */

view.addEventListener('click', event => {
  const button = event.target.closest('button[data-act]');
  if (!button) return;

  const employee = employees.find(
    item => String(item.id) === String(button.dataset.id)
  );

  if (!employee) return;

  if (button.dataset.act === 'view') openViewModal(employee);
  if (button.dataset.act === 'edit') openEmployeeForm(employee);
  if (button.dataset.act === 'del') deleteEmployee(employee);
});

modalOverlay.addEventListener('click', event => {
  if (event.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

/* ---------- Navigation ---------- */

dashboardLink.innerHTML = `${icon('grid', 18)}<span>Dashboard</span>`;
employeesLink.innerHTML = `${icon('users', 18)}<span>Employees</span>`;
logo.innerHTML = icon('briefcase', 21);

function renderPage() {
  setActiveNav(currentPage);

  if (currentPage === 'employees') {
    renderEmployees();
  } else {
    renderDashboard();
  }
}

function navigate(page) {
  currentPage = page;
  renderPage();
}

dashboardLink.addEventListener('click', event => {
  event.preventDefault();
  history.replaceState(null, '', '#dashboard');
  navigate('dashboard');
});

employeesLink.addEventListener('click', event => {
  event.preventDefault();
  history.replaceState(null, '', '#employees');
  navigate('employees');
});

window.addEventListener('hashchange', () => {
  navigate(location.hash === '#employees' ? 'employees' : 'dashboard');
});

/* ---------- Start ---------- */

modalOverlay.setAttribute('aria-hidden', 'true');
currentPage = location.hash === '#employees' ? 'employees' : 'dashboard';
loadEmployees();
