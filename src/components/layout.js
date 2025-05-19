// src/components/layout.js
import { auth } from '../firebase/config.js';
import { logOut } from '../utils/auth.js';

/**
 * Creates the main application layout with sidebar
 * @param {string} activeModule - The currently active module (reports, users, dashboard)
 * @returns {HTMLElement} - The layout container element
 */
export function createLayout(activeModule = 'reports') {
  console.log('Creating modern layout with activeModule:', activeModule);
  
  // Create layout container
  const layoutContainer = document.createElement('div');
  layoutContainer.className = 'layout-container';
  
  // Create sidebar
  const sidebar = createSidebar(activeModule);
  
  // Create main content area
  const mainContent = document.createElement('div');
  mainContent.className = 'main-content';
  
  // Create header
  const header = createHeader();
  
  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.id = 'contentContainer';
  contentContainer.className = 'content-container';
  
  // Assemble layout
  mainContent.appendChild(header);
  mainContent.appendChild(contentContainer);
  
  layoutContainer.appendChild(sidebar);
  layoutContainer.appendChild(mainContent);
  
  return layoutContainer;
}

/**
 * Creates the sidebar navigation
 * @param {string} activeModule - The currently active module
 * @returns {HTMLElement} - The sidebar element
 */
function createSidebar(activeModule) {
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  
  // Create logo area
  const logoArea = document.createElement('div');
  logoArea.className = 'sidebar-logo';
  logoArea.innerHTML = `
    <h3>
      <i class="bi bi-hdd-network me-2"></i>
      <span>Kony Admin</span>
    </h3>
  `;
  
  // Create mobile toggle button
  const mobileToggle = document.createElement('button');
  mobileToggle.className = 'sidebar-toggle d-lg-none';
  mobileToggle.innerHTML = '<i class="bi bi-x"></i>';
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.remove('show');
  });
  
  // Create navigation
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';
  
  const navItems = [
    { id: 'reports', icon: 'bi-file-earmark-text', label: 'Reports' },
    { id: 'users', icon: 'bi-people', label: 'Users' },
    { id: 'biDashboard', icon: 'bi-graph-up', label: 'BI Dashboard' },
    { id: 'settings', icon: 'bi-gear', label: 'Settings', disabled: true } // Example disabled item
  ];
  
  // Build navigation items
  nav.innerHTML = `
    <ul class="sidebar-nav-list">
      ${navItems.map(item => `
        <li class="sidebar-nav-item">
          <a href="#" 
            id="${item.id}Link" 
            class="sidebar-nav-link ${activeModule === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}"
            ${item.disabled ? 'aria-disabled="true"' : ''}
          >
            <i class="bi ${item.icon}"></i>
            <span>${item.label}</span>
            ${item.disabled ? '<span class="badge bg-secondary ms-auto">Soon</span>' : ''}
          </a>
        </li>
      `).join('')}
    </ul>
  `;
  
  // Create bottom section
  const bottomSection = document.createElement('div');
  bottomSection.className = 'sidebar-bottom';
  
  // Logout button only (removed dark mode toggle)
  bottomSection.innerHTML = `
    <button id="sidebarLogoutBtn" class="btn btn-outline-light w-100">
      <i class="bi bi-box-arrow-right me-2"></i>Logout
    </button>
  `;
  
  // Assemble sidebar
  sidebar.appendChild(mobileToggle);
  sidebar.appendChild(logoArea);
  sidebar.appendChild(nav);
  sidebar.appendChild(bottomSection);
  
  // Add event listeners
  sidebar.querySelectorAll('.sidebar-nav-link:not(.disabled)').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const moduleId = link.id.replace('Link', '');
      // Dispatch custom event for module change
      const event = new CustomEvent('moduleChange', { detail: { module: moduleId } });
      document.dispatchEvent(event);
    });
  });
  
  // Add logout functionality
  sidebar.querySelector('#sidebarLogoutBtn').addEventListener('click', async () => {
    try {
      await logOut();
      // Auth state observer will handle redirection
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out: ' + error.message);
    }
  });
  
  return sidebar;
}

/**
 * Creates the header area
 * @returns {HTMLElement} - The header element
 */
function createHeader() {
  const header = document.createElement('header');
  header.className = 'main-header';
  
  const currentUser = auth.currentUser;
  const userEmail = currentUser ? currentUser.email : 'admin@example.com';
  const userName = userEmail.split('@')[0];
  
  header.innerHTML = `
    <div class="header-left">
      <button id="sidebarToggle" class="btn btn-icon d-lg-none">
        <i class="bi bi-list"></i>
      </button>
      <div class="breadcrumb-wrapper d-none d-md-block">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="#">Home</a></li>
            <li class="breadcrumb-item active" aria-current="page" id="currentModule">Reports</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="header-right">
      <div class="dropdown">
        <button class="btn btn-link dropdown-toggle user-menu" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="avatar">
            <span>${userName.charAt(0).toUpperCase()}</span>
          </div>
          <span class="d-none d-md-inline">${userName}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
          <li><span class="dropdown-item-text">${userEmail}</span></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
          <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="headerLogoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
        </ul>
      </div>
    </div>
  `;
  
  // Add event listener to toggle sidebar on mobile
  header.querySelector('#sidebarToggle').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
  });
  
  // Add logout functionality
  header.querySelector('#headerLogoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await logOut();
      // Auth state observer will handle redirection
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out: ' + error.message);
    }
  });
  
  // Listen for module changes to update breadcrumb
  document.addEventListener('moduleChange', (e) => {
    const moduleId = e.detail.module;
    const currentModule = header.querySelector('#currentModule');
    
    switch(moduleId) {
      case 'reports':
        currentModule.textContent = 'Reports';
        break;
      case 'users':
        currentModule.textContent = 'Users';
        break;
      case 'biDashboard':
        currentModule.textContent = 'BI Dashboard';
        break;
      default:
        currentModule.textContent = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
    }
  });
  
  return header;
}