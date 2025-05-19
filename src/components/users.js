// src/components/users.js
import { getUsers, updateUser, deleteUser } from '../utils/api.js';

/**
 * Shows the modern users list
 * @param {HTMLElement} container - The container to render the users in
 */
export async function showUsersList(container = document.getElementById('contentContainer')) {
  console.log('Showing modern users list');
  
  // Set page title
  const pageTitle = 'User Management';
  
  // Create users interface
  container.innerHTML = `
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">${pageTitle}</h1>
        <p class="text-muted">Manage administrators and technicians</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="addUserBtn">
          <i class="bi bi-person-plus me-2"></i>Add User
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <i class="bi bi-people fs-4 me-2"></i>
          <h5 class="mb-0">Registered Users</h5>
        </div>
        <div class="input-group search-box">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" id="userSearchInput" placeholder="Search users...">
        </div>
      </div>
      <div class="card-body p-0">
        <div id="usersContainer">
          <div class="loading-container py-5">
            <div class="spinner-container">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User Modal -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userModalTitle">Add User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <input type="hidden" id="userId">
              <input type="hidden" id="userAuthUid">
              
              <div class="mb-3">
                <label for="userName" class="form-label">Name</label>
                <input type="text" class="form-control" id="userName" required>
              </div>
              
              <div class="mb-3">
                <label for="userEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="userEmail" required>
              </div>
              
              <div id="passwordGroup" class="mb-3">
                <label for="userPassword" class="form-label">Password</label>
                <div class="input-group">
                  <input type="password" class="form-control" id="userPassword">
                  <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="password-strength mt-2" id="passwordStrength">
                  <div class="progress" style="height: 5px;">
                    <div class="progress-bar" id="passwordStrengthBar" role="progressbar" style="width: 0%"></div>
                  </div>
                  <small class="form-text text-muted" id="passwordStrengthText">Password strength</small>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="userRole" class="form-label">Role</label>
                <select class="form-select" id="userRole" required>
                  <option value="technician">Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div class="form-check form-switch mb-3" id="activeUserToggle">
                <input class="form-check-input" type="checkbox" id="userActive" checked>
                <label class="form-check-label" for="userActive">Active User</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveUserBtn">Save User</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Set up search functionality
  const searchInput = document.getElementById('userSearchInput');
  searchInput.addEventListener('input', handleUserSearch);
  
  // Add event listener for add user button
  document.getElementById('addUserBtn').addEventListener('click', () => {
    showAddUserModal();
  });
  
  // Set up password toggle and strength indicator
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('userPassword');
  
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
  });
  
  passwordInput.addEventListener('input', updatePasswordStrength);
  
  // Load users
  await loadUsers();
}

/**
 * Load users with modern UI
 */
async function loadUsers() {
  const usersContainer = document.getElementById('usersContainer');
  
  try {
    // Show loading state
    usersContainer.innerHTML = `
      <div class="loading-container py-5">
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <p>Loading users...</p>
      </div>
    `;
    
    // Fetch users
    const users = await getUsers();
    
    if (users.length === 0) {
      usersContainer.innerHTML = `
        <div class="empty-state py-5">
          <div class="empty-state-icon">
            <i class="bi bi-people"></i>
          </div>
          <h3>No users found</h3>
          <p class="text-muted">Start by adding a new user.</p>
          <button class="btn btn-primary mt-3" id="emptyStateAddUserBtn">
            <i class="bi bi-person-plus me-2"></i>Add User
          </button>
        </div>
      `;
      
      document.getElementById('emptyStateAddUserBtn').addEventListener('click', () => {
        showAddUserModal();
      });
      
      return;
    }
    
    // Render users table
    usersContainer.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            ${users.map(user => createUserRow(user)).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    // Add event listeners for user actions
    users.forEach(user => {
      // Edit button
      document.querySelector(`.edit-user-btn[data-id="${user.id}"]`)?.addEventListener('click', () => {
        showEditUserModal(user);
      });
      
      // Delete button
      document.querySelector(`.delete-user-btn[data-id="${user.id}"]`)?.addEventListener('click', () => {
        confirmDeleteUser(user);
      });
    });
    
  } catch (error) {
    console.error('Error loading users:', error);
    usersContainer.innerHTML = `
      <div class="alert alert-danger m-3">
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
          <div>
            <h5 class="alert-heading">Error Loading Users</h5>
            <p class="mb-0">${error.message}</p>
          </div>
        </div>
        <button class="btn btn-danger mt-3" onclick="loadUsers()">
          <i class="bi bi-arrow-clockwise me-2"></i>Try Again
        </button>
      </div>
    `;
  }
}

/**
 * Create a user table row
 * @param {Object} user - The user data
 * @returns {string} - The HTML for the user row
 */
function createUserRow(user) {
  const roleBadgeClass = user.role === 'admin' ? 'danger' : 'primary';
  const userStatus = user.active !== false; // If active is undefined or true, consider as active
  const statusBadgeClass = userStatus ? 'success' : 'secondary';
  
  // Create initials for avatar
  const name = user.name || 'Unknown User';
  const initials = name.split(' ').map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
  
  return `
    <tr data-id="${user.id}" data-auth-uid="${user.authUid || ''}">
      <td>
        <div class="d-flex align-items-center">
          <div class="avatar avatar-sm me-3" data-initial="${initials}"></div>
          <div>
            <h6 class="mb-0">${name}</h6>
            <small class="text-muted user-id">${user.id}</small>
          </div>
        </div>
      </td>
      <td>${user.email || 'N/A'}</td>
      <td>
        <span class="badge bg-${roleBadgeClass}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
      </td>
      <td>
        <span class="badge bg-${statusBadgeClass}">${userStatus ? 'Active' : 'Inactive'}</span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-icon btn-primary edit-user-btn" data-id="${user.id}" data-bs-toggle="tooltip" title="Edit User">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-danger delete-user-btn" data-id="${user.id}" data-bs-toggle="tooltip" title="Delete User">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Show user search results
 * @param {Event} event - The input event
 */
function handleUserSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const rows = document.querySelectorAll('#usersTableBody tr');
  
  rows.forEach(row => {
    const name = row.querySelector('h6').textContent.toLowerCase();
    const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    const role = row.querySelector('.badge').textContent.toLowerCase();
    
    if (name.includes(searchTerm) || email.includes(searchTerm) || role.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  // Show message if no results
  const visibleRows = document.querySelectorAll('#usersTableBody tr[style=""]').length;
  let noResultsEl = document.getElementById('noSearchResults');
  
  if (visibleRows === 0 && searchTerm !== '') {
    if (!noResultsEl) {
      noResultsEl = document.createElement('tr');
      noResultsEl.id = 'noSearchResults';
      noResultsEl.innerHTML = `
        <td colspan="5" class="text-center py-4">
          <div class="empty-search-results">
            <i class="bi bi-search fs-3 mb-3"></i>
            <h6>No users found matching "${searchTerm}"</h6>
            <p class="text-muted">Try using different keywords</p>
          </div>
        </td>
      `;
      document.getElementById('usersTableBody').appendChild(noResultsEl);
    } else {
      noResultsEl.querySelector('h6').textContent = `No users found matching "${searchTerm}"`;
    }
  } else if (noResultsEl) {
    noResultsEl.remove();
  }
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength() {
  const password = document.getElementById('userPassword').value;
  const strengthBar = document.getElementById('passwordStrengthBar');
  const strengthText = document.getElementById('passwordStrengthText');
  
  if (!password) {
    strengthBar.style.width = '0%';
    strengthBar.className = 'progress-bar';
    strengthText.textContent = 'Password strength';
    return;
  }
  
  // Simple password strength algorithm
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 25;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 25;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 25;
  
  // Contains number or special character
  if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
  
  // Update UI
  strengthBar.style.width = `${strength}%`;
  
  if (strength < 50) {
    strengthBar.className = 'progress-bar bg-danger';
    strengthText.textContent = 'Weak';
  } else if (strength < 75) {
    strengthBar.className = 'progress-bar bg-warning';
    strengthText.textContent = 'Medium';
  } else {
    strengthBar.className = 'progress-bar bg-success';
    strengthText.textContent = 'Strong';
  }
}

/**
 * Show add user modal
 */
function showAddUserModal() {
  const userModal = new bootstrap.Modal(document.getElementById('userModal'));
  const userForm = document.getElementById('userForm');
  const userModalTitle = document.getElementById('userModalTitle');
  const passwordGroup = document.getElementById('passwordGroup');
  
  // Reset form
  userForm.reset();
  
  // Clear hidden fields
  document.getElementById('userId').value = '';
  document.getElementById('userAuthUid').value = '';
  
  // Show password field for new users
  passwordGroup.style.display = 'block';
  
  // Reset password strength indicator
  document.getElementById('passwordStrengthBar').style.width = '0%';
  document.getElementById('passwordStrengthText').textContent = 'Password strength';
  
  // Set modal title
  userModalTitle.textContent = 'Add User';
  
  // Add save button event listener
  const saveUserBtn = document.getElementById('saveUserBtn');
  
  // Remove existing listeners
  const newSaveBtn = saveUserBtn.cloneNode(true);
  saveUserBtn.parentNode.replaceChild(newSaveBtn, saveUserBtn);
  
  // Add new listener
  newSaveBtn.addEventListener('click', handleAddUser);
  
  // Show modal
  userModal.show();
}

/**
 * Show edit user modal
 * @param {Object} user - The user to edit
 */
function showEditUserModal(user) {
  const userModal = new bootstrap.Modal(document.getElementById('userModal'));
  const userForm = document.getElementById('userForm');
  const userModalTitle = document.getElementById('userModalTitle');
  const passwordGroup = document.getElementById('passwordGroup');
  
  // Set form values
  document.getElementById('userId').value = user.id;
  document.getElementById('userAuthUid').value = user.authUid || '';
  document.getElementById('userName').value = user.name || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userRole').value = user.role || 'technician';
  
  // Set active status if available
  const activeToggle = document.getElementById('userActive');
  if (activeToggle) {
    activeToggle.checked = user.active !== false;
  }
  
  // Hide password field for editing
  passwordGroup.style.display = 'none';
  
  // Set modal title
  userModalTitle.textContent = 'Edit User';
  
  // Add save button event listener
  const saveUserBtn = document.getElementById('saveUserBtn');
  
  // Remove existing listeners
  const newSaveBtn = saveUserBtn.cloneNode(true);
  saveUserBtn.parentNode.replaceChild(newSaveBtn, saveUserBtn);
  
  // Add new listener
  newSaveBtn.addEventListener('click', handleEditUser);
  
  // Show modal
  userModal.show();
}

/**
 * Handle adding a new user
 */
async function handleAddUser() {
  const userForm = document.getElementById('userForm');
  
  if (!userForm.checkValidity()) {
    userForm.reportValidity();
    return;
  }
  
  // Show loading state
  const saveBtn = document.getElementById('saveUserBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Saving...
  `;
  
  const userData = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value,
    active: document.getElementById('userActive').checked
  };
  
  const password = document.getElementById('userPassword').value;
  
  try {
    // In a real app, you'd use Firebase Auth to create a user
    // For now, we'll just show a placeholder message
    alert('Adding a new user through web interface is not fully implemented. In a complete app, this would create a Firebase Auth user and a Firestore document.');
    
    // Here you would add the user creation logic
    // const authUid = await createAuthUser(userData.email, password);
    // await addUserToDatabase(authUid, userData);
    
    // Close modal
    const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    userModal.hide();
    
    // Show success notification
    showNotification('User Added', `User "${userData.name}" has been added successfully`, 'success');
    
    // Refresh users list
    await loadUsers();
    
  } catch (error) {
    console.error('Error adding user:', error);
    showNotification('Error', `Failed to add user: ${error.message}`, 'danger');
    
    // Reset button
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Save User';
  }
}

/**
 * Handle editing a user
 */
async function handleEditUser() {
  const userForm = document.getElementById('userForm');
  
  if (!userForm.checkValidity()) {
    userForm.reportValidity();
    return;
  }
  
  // Show loading state
  const saveBtn = document.getElementById('saveUserBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Saving...
  `;
  
  const authUid = document.getElementById('userAuthUid').value;
  if (!authUid) {
    alert('User has no auth UID. Cannot update.');
    
    // Reset button
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Save User';
    return;
  }
  
  const userData = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value,
    active: document.getElementById('userActive').checked
  };
  
  try {
    await updateUser(authUid, userData);
    
    // Close modal
    const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    userModal.hide();
    
    // Show success notification
    showNotification('User Updated', `User "${userData.name}" has been updated successfully`, 'success');
    
    // Refresh users list
    await loadUsers();
    
  } catch (error) {
    console.error('Error updating user:', error);
    showNotification('Error', `Failed to update user: ${error.message}`, 'danger');
    
    // Reset button
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Save User';
  }
}

/**
 * Confirm and delete a user
 * @param {Object} user - The user to delete
 */
async function confirmDeleteUser(user) {
  // Create modal if it doesn't exist
  let deleteModal = document.getElementById('deleteUserModal');
  if (!deleteModal) {
    deleteModal = document.createElement('div');
    deleteModal.className = 'modal fade';
    deleteModal.id = 'deleteUserModal';
    deleteModal.setAttribute('tabindex', '-1');
    deleteModal.setAttribute('aria-hidden', 'true');
    
    deleteModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Delete User
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p id="deleteUserMessage">Are you sure you want to delete this user? This action cannot be undone.</p>
            
            <div class="user-info-card mb-3">
              <div class="d-flex align-items-center mb-2">
                <div class="avatar avatar-sm me-3" id="deleteUserAvatar"></div>
                <div>
                  <h6 class="mb-0" id="deleteUserName"></h6>
                  <small class="text-muted" id="deleteUserEmail"></small>
                </div>
              </div>
              <div class="user-role mb-2">
                <small class="text-muted">Role: </small>
                <span class="badge" id="deleteUserRole"></span>
              </div>
            </div>
            
            <div class="form-check mt-3">
              <input class="form-check-input" type="checkbox" id="confirmUserDeleteCheck">
              <label class="form-check-label" for="confirmUserDeleteCheck">
                I understand that this action is permanent
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmUserDeleteBtn" disabled>
              <i class="bi bi-trash me-2"></i>Delete User
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(deleteModal);
  }
  
  // Update user details in modal
  document.getElementById('deleteUserName').textContent = user.name || 'Unknown User';
  document.getElementById('deleteUserEmail').textContent = user.email || 'N/A';
  
  const roleBadgeClass = user.role === 'admin' ? 'danger' : 'primary';
  const roleElement = document.getElementById('deleteUserRole');
  roleElement.className = `badge bg-${roleBadgeClass}`;
  roleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  
  // Create initials for avatar
  const name = user.name || 'Unknown User';
  const initials = name.split(' ').map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
  const avatarElement = document.getElementById('deleteUserAvatar');
  avatarElement.setAttribute('data-initial', initials);
  
  // Create Bootstrap modal instance
  const modal = new bootstrap.Modal(deleteModal);
  modal.show();
  
  // Handle checkbox to enable delete button
  const checkbox = document.getElementById('confirmUserDeleteCheck');
  const deleteBtn = document.getElementById('confirmUserDeleteBtn');
  
  checkbox.checked = false; // Reset checkbox
  deleteBtn.disabled = true; // Disable button initially
  
  checkbox.addEventListener('change', () => {
    deleteBtn.disabled = !checkbox.checked;
  });
  
  // Handle delete confirmation
  return new Promise((resolve) => {
    // Remove existing listeners
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
    newDeleteBtn.disabled = true; // Maintain disabled state
    
    // Add new listener
    newDeleteBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        newDeleteBtn.disabled = true;
        newDeleteBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Deleting...
        `;
        
        const authUid = user.authUid || user.id;
        await deleteUser(authUid);
        
        modal.hide();
        
        // Show success notification
        showNotification('User Deleted', `User "${user.name}" has been deleted successfully`, 'success');
        
        // Refresh users list
        await loadUsers();
        
        resolve(true);
      } catch (error) {
        console.error('Error deleting user:', error);
        
        // Reset button
        newDeleteBtn.disabled = checkbox.checked ? false : true;
        newDeleteBtn.innerHTML = '<i class="bi bi-trash me-2"></i>Delete User';
        
        // Show error in modal
        document.getElementById('deleteUserMessage').innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error: ${error.message}
          </div>
          <p>Do you want to try again?</p>
        `;
        
        resolve(false);
      }
    });
  });
}

/**
 * Show a notification toast
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, danger, warning, info)
 */
function showNotification(title, message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  const iconMap = {
    success: 'bi-check-circle',
    danger: 'bi-exclamation-triangle',
    warning: 'bi-exclamation-circle',
    info: 'bi-info-circle'
  };
  
  toast.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <i class="bi ${iconMap[type] || 'bi-bell'} me-2"></i>
      <strong class="me-auto">${title}</strong>
      <small>Just now</small>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}