// Complete Integration Guide for Enhanced BI Dashboard

// 1. REPLACE your existing src/dashboard.js with this:

import { EnhancedBIDashboard } from './bi/enhanced-dashboard.js';

/**
 * Initialize the Enhanced BI Dashboard (replaces the old dashboard)
 * @param {HTMLElement} container - The container element
 * @returns {EnhancedBIDashboard} - Dashboard instance
 */
export function initializeBIDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initializing Enhanced BI Dashboard');
  
  try {
    // Clear any existing content
    if (container) {
      container.innerHTML = '';
    }
    
    // Create new enhanced dashboard
    const dashboard = new EnhancedBIDashboard(container);
    
    // Store globally for debugging and exports
    window.dashboardInstance = dashboard;
    
    // Set up auto-refresh every 5 minutes
    dashboard.setupAutoRefresh(5);
    
    // Enhance accessibility
    dashboard.enhanceAccessibility();
    
    console.log('Enhanced BI Dashboard initialized successfully');
    return dashboard;
    
  } catch (error) {
    console.error('Failed to initialize Enhanced BI Dashboard:', error);
    
    // Fallback error UI
    if (container) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #dc2626;">
          <i class="bi bi-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h2>Dashboard Failed to Load</h2>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            There was an error initializing the dashboard. Please check the console for details.
          </p>
          <button onclick="window.location.reload()" style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.375rem; 
            cursor: pointer;
            font-weight: 500;
          ">
            <i class="bi bi-arrow-clockwise" style="margin-right: 0.5rem;"></i>
            Reload Dashboard
          </button>
        </div>
      `;
    }
    
    throw error;
  }
}

// 2. CREATE this file: src/bi/enhanced-dashboard.js
// [Copy the complete Enhanced BI Dashboard class from the previous artifacts]

// 3. UPDATE your src/components/dashboard.js moduleHandlers:

const moduleHandlers = {
  reports: showReportsList,
  users: showUsersList,
  biDashboard: initializeBIDashboard  // Use the new dashboard
};

// 4. OPTIONAL: Development Mode with Mock Data
// Add this to src/bi/enhanced-dashboard.js for testing:

/**
 * Development mode initialization with realistic mock data
 */
export function initializeDevelopmentDashboard(container) {
  console.log('🚧 Development Mode: Initializing with Mock Data');
  
  const dashboard = new EnhancedBIDashboard(container);
  
  // Override the loadData method for development
  const originalLoadData = dashboard.loadData.bind(dashboard);
  dashboard.loadData = async function(forceRefresh = false) {
    if (this.isLoading && !forceRefresh) return;
    
    this.isLoading = true;
    this.showLoading();
    
    try {
      console.log('📊 Generating realistic mock data...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate comprehensive mock data
      const mockData = generateRealisticMockData();
      this.data.reports = mockData.reports;
      this.data.users = mockData.users;
      
      console.log(`✅ Loaded ${this.data.reports.length} mock reports and ${this.data.users.length} mock users`);
      
      // Process analytics
      this.data.analytics = this.processAnalytics();
      
      // Update UI
      this.updateDashboard();
      this.hideLoading();
      this.updateFooter();
      
      if (forceRefresh) {
        this.showNotification('Mock data refreshed successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error loading mock data:', error);
      this.showError('Failed to load mock data: ' + error.message);
      this.hideLoading();
    } finally {
      this.isLoading = false;
    }
  };
  
  return dashboard;
}

/**
 * Generate realistic mock data based on your Flutter app structure
 */
function generateRealisticMockData() {
  const mockReports = [];
  const mockUsers = [];
  
  // Tunisian technician names
  const technicianNames = [
    'Ahmed Ben Salem', 'Fatima Bouazizi', 'Mohamed Charfi', 'Amira Mestiri',
    'Karim Sfar', 'Nour Gasmi', 'Youssef Kallel', 'Leila Jrad',
    'Sami Touati', 'Rania Mahjoub', 'Tarek Ghanmi', 'Salma Zouari'
  ];
  
  // Real Tunisian companies and locations
  const clients = [
    { name: 'Banque Centrale de Tunisie', locations: ['Tunis Centre', 'Lac 2'] },
    { name: 'Société Générale Tunisie', locations: ['Avenue Habib Bourguiba', 'Menzah 6'] },
    { name: 'AMEN Bank', locations: ['Centre Urbain Nord', 'Sfax Centre'] },
    { name: 'Ministère de l\'Éducation', locations: ['Bardo', 'Montplaisir'] },
    { name: 'Orange Tunisie', locations: ['Berges du Lac', 'Sousse'] },
    { name: 'Tunisie Télécom', locations: ['Lac 2', 'Monastir'] },
    { name: 'Université de Tunis El Manar', locations: ['Campus Universitaire', 'Tunis'] },
    { name: 'CHU Charles Nicolle', locations: ['Bab Saadoun', 'Tunis'] },
    { name: 'Municipalité de Tunis', locations: ['Médina', 'Belvédère'] },
    { name: 'SONEDE', locations: ['Kassar Said', 'Ariana'] },
    { name: 'STEG', locations: ['Montplaisir', 'Ben Arous'] },
    { name: 'Office National du Tourisme', locations: ['Avenue Mohamed V', 'Tunis'] }
  ];
  
  // Generate users (technicians)
  technicianNames.forEach((name, index) => {
    mockUsers.push({
      id: `tech_${index}`,
      authUid: `auth_tech_${index}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@kony.tn`,
      role: 'technician',
      active: true,
      createdAt: new Date(2024, 0, 1 + index),
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
    });
  });
  
  // Add admin users
  mockUsers.push(
    {
      id: 'admin_1',
      authUid: 'auth_admin_1',
      name: 'Skander Sellami',
      email: 'skander.sellami@kony.tn',
      role: 'admin',
      active: true,
      createdAt: new Date(2023, 11, 1)
    },
    {
      id: 'admin_2',
      authUid: 'auth_admin_2',
      name: 'Sara Ben Ali',
      email: 'sara.benali@kony.tn',
      role: 'admin',
      active: true,
      createdAt: new Date(2023, 11, 15)
    }
  );
  
  // Generate realistic reports for the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  
  for (let i = 0; i < 200; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const location = client.locations[Math.floor(Math.random() * client.locations.length)];
    const technician = technicianNames[Math.floor(Math.random() * technicianNames.length)];
    
    // Create realistic date progression
    const createdAt = new Date(
      sixMonthsAgo.getTime() + 
      Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );
    
    // Determine status with realistic workflow progression
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    let status = 'draft';
    let submittedAt = null;
    
    if (daysSinceCreation > 1) {
      // 85% chance of being submitted after 1 day
      if (Math.random() < 0.85) {
        status = 'submitted';
        submittedAt = new Date(createdAt.getTime() + (1 + Math.random() * 5) * 24 * 60 * 60 * 1000);
        
        // 70% chance of being reviewed after 2 more days
        if (daysSinceCreation > 3 && Math.random() < 0.7) {
          status = 'reviewed';
          
          // 60% chance of being approved after 1 more day
          if (daysSinceCreation > 4 && Math.random() < 0.6) {
            status = 'approved';
          }
        }
      }
    }
    
    // Generate realistic floor structure
    const buildingTypes = ['office', 'hospital', 'school', 'bank', 'government'];
    const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
    const numFloors = buildingType === 'hospital' ? Math.floor(Math.random() * 8) + 3 :
                     buildingType === 'office' ? Math.floor(Math.random() * 12) + 2 :
                     Math.floor(Math.random() * 4) + 1;
    
    const floors = [];
    for (let f = 0; f < numFloors; f++) {
      const floorName = f === 0 ? 'Ground Floor' : 
                       f === 1 ? 'First Floor' :
                       f === 2 ? 'Second Floor' :
                       `Floor ${f}`;
      
      const floor = {
        id: `floor_${f}`,
        name: floorName,
        // Generate components based on building type and floor
        networkCabinets: generateRealisticComponents('networkCabinet', buildingType, f, numFloors),
        perforations: generateRealisticComponents('perforation', buildingType, f, numFloors),
        accessTraps: generateRealisticComponents('accessTrap', buildingType, f, numFloors),
        cablePaths: generateRealisticComponents('cablePath', buildingType, f, numFloors),
        cableTrunkings: generateRealisticComponents('cableTrunking', buildingType, f, numFloors),
        conduits: generateRealisticComponents('conduit', buildingType, f, numFloors),
        copperCablings: generateRealisticComponents('copperCabling', buildingType, f, numFloors),
        fiberOpticCablings: generateRealisticComponents('fiberOpticCabling', buildingType, f, numFloors)
      };
      floors.push(floor);
    }
    
    const report = {
      id: `report_${Date.now()}_${i}`,
      clientName: client.name,
      location: location,
      technicianName: technician,
      projectManager: 'Skander Sellami',
      accompanyingPerson: Math.random() > 0.7 ? generateAccompanyingPerson(client.name) : null,
      status,
      createdAt,
      submittedAt,
      lastModified: submittedAt || createdAt,
      date: createdAt.toISOString().split('T')[0], // Visit date
      floors,
      projectContext: generateProjectContext(buildingType, client.name),
      conclusion: generateConclusion(buildingType),
      estimatedDurationDays: Math.floor(Math.random() * 25) + 5, // 5-30 days
      assumptions: generateAssumptions(buildingType),
      technicians: [technician] // Array format as in Flutter app
    };
    
    mockReports.push(report);
  }
  
  // Sort reports by creation date (newest first)
  mockReports.sort((a, b) => b.createdAt - a.createdAt);
  
  console.log(`Generated ${mockReports.length} reports and ${mockUsers.length} users`);
  return { reports: mockReports, users: mockUsers };
}

/**
 * Generate realistic components based on building type and context
 */
function generateRealisticComponents(type, buildingType, floorIndex, totalFloors) {
  const components = [];
  
  // Component density based on building type
  const densityMultipliers = {
    hospital: 1.5,    // Hospitals need more infrastructure
    office: 1.2,      // Offices have good infrastructure
    bank: 1.3,        // Banks need secure, robust infrastructure
    school: 0.8,      // Schools have basic infrastructure
    government: 1.0   // Government buildings have standard infrastructure
  };
  
  const multiplier = densityMultipliers[buildingType] || 1.0;
  
  // Base counts for each component type
  const baseCounts = {
    networkCabinet: Math.floor((Math.random() * 3 + 1) * multiplier),
    perforation: Math.floor((Math.random() * 8 + 2) * multiplier),
    accessTrap: Math.floor((Math.random() * 4 + 1) * multiplier),
    cablePath: Math.floor((Math.random() * 12 + 5) * multiplier),
    cableTrunking: Math.floor((Math.random() * 10 + 3) * multiplier),
    conduit: Math.floor((Math.random() * 15 + 5) * multiplier),
    copperCabling: Math.floor((Math.random() * 25 + 10) * multiplier),
    fiberOpticCabling: Math.floor((Math.random() * 12 + 3) * multiplier)
  };
  
  // Adjust count based on floor (ground floor typically has more infrastructure)
  let count = baseCounts[type];
  if (floorIndex === 0) {
    count = Math.floor(count * 1.5); // Ground floor has more infrastructure
  }
  
  // Generate components
  for (let i = 0; i < count; i++) {
    const component = {
      id: `${type}_${floorIndex}_${i}`,
      name: generateComponentName(type, i + 1),
      location: generateRoomLocation(buildingType, floorIndex),
      notes: Math.random() > 0.8 ? generateComponentNote(type) : null
    };
    
    // Add type-specific realistic properties
    addTypeSpecificProperties(component, type, buildingType);
    
    components.push(component);
  }
  
  return components;
}

function generateComponentName(type, index) {
  const nameTemplates = {
    networkCabinet: `Network Cabinet ${index}`,
    perforation: `Wall Perforation ${index}`,
    accessTrap: `Access Panel ${index}`,
    cablePath: `Cable Tray ${index}`,
    cableTrunking: `Cable Trunking ${index}`,
    conduit: `Conduit ${index}`,
    copperCabling: `UTP Cable ${index}`,
    fiberOpticCabling: `Fiber Cable ${index}`
  };
  
  return nameTemplates[type] || `Component ${index}`;
}

function generateRoomLocation(buildingType, floorIndex) {
  const roomTypes = {
    hospital: ['Emergency Room', 'Operating Theater', 'Patient Room', 'Radiology', 'Laboratory', 'Pharmacy', 'Administration'],
    office: ['Conference Room', 'Open Office', 'Executive Office', 'Reception', 'IT Room', 'Storage', 'Break Room'],
    bank: ['Customer Service', 'Vault Area', 'Manager Office', 'ATM Area', 'Security Room', 'Safe Deposit'],
    school: ['Classroom', 'Laboratory', 'Library', 'Principal Office', 'Teachers Room', 'Auditorium'],
    government: ['Public Service', 'Archive Room', 'Director Office', 'Meeting Room', 'Reception', 'Security']
  };
  
  const rooms = roomTypes[buildingType] || roomTypes.office;
  const roomType = rooms[Math.floor(Math.random() * rooms.length)];
  const roomNumber = Math.floor(Math.random() * 20) + 1;
  
  return `${roomType} ${roomNumber}`;
}

function addTypeSpecificProperties(component, type, buildingType) {
  switch (type) {
    case 'networkCabinet':
      component.height = [6, 9, 12, 18, 24, 42][Math.floor(Math.random() * 6)]; // Standard rack units
      component.width = 600; // Standard 19" rack width in mm
      component.depth = Math.random() > 0.5 ? 800 : 1000; // Standard depths
      component.hasVentilation = Math.random() > 0.3;
      component.hasPowerDistribution = Math.random() > 0.4;
      break;
      
    case 'cablePath':
      component.length = Math.floor(Math.random() * 50) + 5; // 5-55 meters
      component.width = [100, 150, 200, 300, 400, 600][Math.floor(Math.random() * 6)]; // Standard widths in mm
      component.material = Math.random() > 0.5 ? 'Galvanized Steel' : 'Aluminum';
      component.hasLid = Math.random() > 0.6;
      break;
      
    case 'conduit':
      component.diameter = [16, 20, 25, 32, 40, 50, 63][Math.floor(Math.random() * 7)]; // Standard diameters in mm
      component.length = Math.floor(Math.random() * 30) + 5; // 5-35 meters
      component.material = Math.random() > 0.6 ? 'PVC' : 'Metal';
      component.bendRadius = component.diameter * 6; // Standard bend radius
      break;
      
    case 'copperCabling':
      component.category = ['Cat5e', 'Cat6', 'Cat6A'][Math.floor(Math.random() * 3)];
      component.length = Math.floor(Math.random() * 90) + 10; // 10-100 meters (max 90m for Ethernet)
      component.shielded = Math.random() > 0.7; // UTP vs STP
      component.connectorType = 'RJ45';
      component.tested = Math.random() > 0.2; // Most cables should be tested
      break;
      
    case 'fiberOpticCabling':
      component.type = Math.random() > 0.4 ? 'Single Mode' : 'Multi Mode';
      component.fiberCount = [2, 4, 6, 8, 12, 24, 48][Math.floor(Math.random() * 7)];
      component.length = Math.floor(Math.random() * 500) + 50; // 50-550 meters
      component.connectorType = Math.random() > 0.5 ? 'LC' : 'SC';
      component.wavelength = component.type === 'Single Mode' ? '1310/1550nm' : '850/1300nm';
      break;
      
    case 'perforation':
      component.diameter = [25, 32, 40, 50, 63, 75][Math.floor(Math.random() * 6)]; // mm
      component.wallType = ['Drywall', 'Concrete', 'Brick'][Math.floor(Math.random() * 3)];
      component.fireRated = Math.random() > 0.5;
      component.sealed = Math.random() > 0.3;
      break;
      
    case 'accessTrap':
      component.size = ['200x200', '300x300', '400x400', '600x600'][Math.floor(Math.random() * 4)]; // mm
      component.material = Math.random() > 0.5 ? 'Steel' : 'Aluminum';
      component.lockable = Math.random() > 0.6;
      component.fireRated = Math.random() > 0.4;
      break;
      
    case 'cableTrunking':
      component.width = [50, 75, 100, 150, 225][Math.floor(Math.random() * 5)]; // mm
      component.height = [25, 38, 50, 75][Math.floor(Math.random() * 4)]; // mm
      component.length = Math.floor(Math.random() * 20) + 2; // 2-22 meters
      component.material = 'PVC';
      component.adhesiveBacked = Math.random() > 0.5;
      break;
  }
}

function generateComponentNote(type) {
  const notes = {
    networkCabinet: [
      'Requires additional ventilation',
      'Access restricted - security clearance needed',
      'Existing equipment to be relocated',
      'Power upgrade required',
      'Foundation reinforcement needed'
    ],
    perforation: [
      'Fire seal required',
      'Structural engineer approval needed',
      'Avoid electrical conduits in wall',
      'Coordinate with building management',
      'Dust protection during drilling'
    ],
    cablePath: [
      'Route conflicts with HVAC',
      'Additional support brackets needed',
      'Coordinate with other trades',
      'Maintain minimum bend radius',
      'Firewall penetration required'
    ],
    conduit: [
      'Pull string to be installed',
      'Grounding required',
      'Expansion joints needed',
      'Coordinate with electrical team',
      'Avoid sharp bends'
    ],
    copperCabling: [
      'Test certificates required',
      'Cable management needed',
      'Separation from power cables',
      'Label both ends',
      'Future expansion considered'
    ],
    fiberOpticCabling: [
      'Fusion splicing required',
      'Minimum bend radius critical',
      'OTDR testing needed',
      'Protective conduit required',
      'Specialized installation team'
    ]
  };
  
  const typeNotes = notes[type] || ['Standard installation'];
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}

function generateProjectContext(buildingType, clientName) {
  const contexts = {
    hospital: [
      `Modernisation du réseau informatique de ${clientName} pour supporter les nouveaux équipements médicaux et améliorer la connectivité patient.`,
      `Installation d'une infrastructure réseau redondante pour assurer la continuité des services critiques de ${clientName}.`,
      `Migration vers une architecture réseau centralisée pour optimiser la gestion des données médicales de ${clientName}.`
    ],
    office: [
      `Restructuration complète de l'infrastructure réseau de ${clientName} dans le cadre de leur transformation digitale.`,
      `Déploiement d'un réseau haute performance pour supporter les nouvelles applications cloud de ${clientName}.`,
      `Installation d'un système de câblage structuré moderne pour accompagner l'expansion de ${clientName}.`
    ],
    bank: [
      `Renforcement de l'infrastructure réseau de ${clientName} pour respecter les nouvelles normes de sécurité bancaire.`,
      `Installation d'un réseau redondant et sécurisé pour les nouvelles agences de ${clientName}.`,
      `Modernisation du backbone réseau de ${clientName} pour supporter les services bancaires numériques.`
    ],
    school: [
      `Déploiement d'une infrastructure réseau éducative pour ${clientName} dans le cadre du programme national de digitalisation.`,
      `Installation d'un réseau WiFi et filaire pour supporter les plateformes d'apprentissage numérique de ${clientName}.`,
      `Modernisation de l'infrastructure IT de ${clientName} pour améliorer l'accès aux ressources pédagogiques.`
    ],
    government: [
      `Mise en place d'une infrastructure réseau sécurisée pour ${clientName} conforme aux standards gouvernementaux.`,
      `Modernisation du réseau de ${clientName} pour améliorer les services publics numériques.`,
      `Installation d'un système de communication unifié pour ${clientName} dans le cadre de l'e-gouvernement.`
    ]
  };
  
  const typeContexts = contexts[buildingType] || contexts.office;
  return typeContexts[Math.floor(Math.random() * typeContexts.length)];
}

function generateConclusion(buildingType) {
  const conclusions = {
    hospital: [
      'Infrastructure compatible avec les exigences médicales. Installation programmée en dehors des heures d\'activité critique.',
      'Déploiement réalisable avec coordination étroite du personnel médical. Redondance assurée pour les services vitaux.',
      'Site conforme aux normes hospitalières. Installation par phases pour maintenir la continuité des soins.'
    ],
    office: [
      'Environnement optimal pour l\'installation. Aucun obstacle technique majeur identifié.',
      'Infrastructure existante compatible. Migration programmée durant les weekends pour minimiser l\'impact.',
      'Site préparé conformément aux spécifications. Installation coordonnée avec les équipes IT internes.'
    ],
    bank: [
      'Sécurité renforcée validée. Installation conforme aux standards bancaires et réglementations financières.',
      'Infrastructure critique sécurisée. Déploiement programmé avec mesures de continuité d\'activité.',
      'Conformité réglementaire assurée. Installation avec protocoles de sécurité bancaire stricts.'
    ],
    school: [
      'Installation adaptée à l\'environnement éducatif. Programmation durant les vacances scolaires recommandée.',
      'Infrastructure pédagogique moderne. Coordination avec l\'administration pour optimiser l\'accès étudiant.',
      'Déploiement éducatif validé. Installation respectueuse de l\'environnement d\'apprentissage.'
    ],
    government: [
      'Conformité aux standards gouvernementaux validée. Installation avec protocoles de sécurité d\'État.',
      'Infrastructure publique moderne. Déploiement coordonné avec les services de sécurité.',
      'Installation gouvernementale conforme. Respect des procédures administratives et sécuritaires.'
    ]
  };
  
  const typeConclusions = conclusions[buildingType] || conclusions.office;
  return typeConclusions[Math.floor(Math.random() * typeConclusions.length)];
}

function generateAssumptions(buildingType) {
  const commonAssumptions = [
    'Accès libre aux locaux techniques pendant les heures de travail',
    'Fourniture d\'alimentation électrique auxiliaire pendant l\'installation',
    'Personnel technique du client disponible pour assistance',
    'Plans architecturaux mis à jour fournis par le client',
    'Autorisations d\'accès sécurisé obtenues',
    'Matériel de protection individuelle fourni selon les normes',
    'Budget approuvé pour modifications mineures si nécessaires'
  ];
  
  const specificAssumptions = {
    hospital: [
      'Coordination avec le service de maintenance hospitalière',
      'Respect des protocoles d\'hygiène et de stérilisation',
      'Installation en dehors des heures de soins critiques',
      'Accord du comité d\'hygiène hospitalière'
    ],
    bank: [
      'Autorisations de sécurité bancaire obtenues',
      'Présence du responsable sécurité durant l\'installation',
      'Respect des protocoles de sécurité financière',
      'Validation des équipes de sécurité interne'
    ],
    school: [
      'Autorisation de l\'administration scolaire',
      'Installation durant les vacances ou weekends',
      'Sécurisation des zones de passage étudiant',
      'Coordination avec le personnel de maintenance'
    ],
    government: [
      'Habilitations sécuritaires du personnel validées',
      'Respect des protocoles gouvernementaux',
      'Coordination avec les services de sécurité d\'État',
      'Conformité aux normes de sécurité publique'
    ]
  };
  
  const specific = specificAssumptions[buildingType] || [];
  const allAssumptions = [...commonAssumptions, ...specific];
  
  // Select 3-6 random assumptions
  const count = Math.floor(Math.random() * 4) + 3;
  const selectedAssumptions = [];
  const usedIndices = new Set();
  
  while (selectedAssumptions.length < count && selectedAssumptions.length < allAssumptions.length) {
    const index = Math.floor(Math.random() * allAssumptions.length);
    if (!usedIndices.has(index)) {
      selectedAssumptions.push(allAssumptions[index]);
      usedIndices.add(index);
    }
  }
  
  return selectedAssumptions;
}

function generateAccompanyingPerson(clientName) {
  const firstNames = ['Ahmed', 'Mohamed', 'Fatima', 'Amira', 'Karim', 'Nour', 'Sami', 'Leila'];
  const lastNames = ['Ben Ali', 'Gharbi', 'Mansouri', 'Zouari', 'Kallel', 'Mestiri', 'Touati', 'Jrad'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName} - ${clientName}`;
}

// 5. USAGE EXAMPLES:

// For production (connects to Firebase):
// const dashboard = initializeBIDashboard(container);

// For development with mock data:
// const dashboard = initializeDevelopmentDashboard(container);

// Auto-detect environment:
function autoInitialize(container) {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.search.includes('dev=true');
  
  if (isDevelopment) {
    console.log('🚧 Development environment detected');
    return initializeDevelopmentDashboard(container);
  } else {
    console.log('🚀 Production environment detected');
    return initializeBIDashboard(container);
  }
}

// 6. ADDITIONAL FEATURES YOU CAN ADD:

/**
 * Real-time updates using Firebase listeners
 */
function setupRealTimeUpdates(dashboard) {
  // Add Firebase listeners for real-time updates
  const unsubscribe = onSnapshot(
    collection(db, 'technical_visit_reports'),
    (snapshot) => {
      console.log('📡 Real-time update received');
      dashboard.loadData(true);
    }
  );
  
  return unsubscribe;
}

/**
 * Advanced filtering interface
 */
function createAdvancedFilters(dashboard) {
  const filtersHTML = `
    <div class="advanced-filters">
      <h4>Advanced Filters</h4>
      
      <div class="filter-section">
        <label>Multiple Status Selection</label>
        <div class="checkbox-group">
          <label><input type="checkbox" value="draft"> Draft</label>
          <label><input type="checkbox" value="submitted"> Submitted</label>
          <label><input type="checkbox" value="reviewed"> Reviewed</label>
          <label><input type="checkbox" value="approved"> Approved</label>
        </div>
      </div>
      
      <div class="filter-section">
        <label>Component Count Range</label>
        <div class="range-inputs">
          <input type="number" placeholder="Min" id="minComponents">
          <input type="number" placeholder="Max" id="maxComponents">
        </div>
      </div>
      
      <div class="filter-section">
        <label>Completion Time (days)</label>
        <div class="range-inputs">
          <input type="number" placeholder="Min" id="minDays">
          <input type="number" placeholder="Max" id="maxDays">
        </div>
      </div>
    </div>
  `;
  
  return filtersHTML;
}

/**
 * Export to different formats
 */
async function enhancedExportFeatures(dashboard) {
  // Excel export with multiple sheets
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Kony Networks - BI Dashboard Summary'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Key Metrics'],
    ['Total Reports', dashboard.data.analytics.totals.reports],
    ['Total Technicians', dashboard.data.analytics.totals.technicians],
    ['Total Clients', dashboard.data.analytics.totals.clients],
    ['Total Components', dashboard.data.analytics.totals.components]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Reports sheet with full details
  const reportsData = dashboard.data.reports.map(report => [
    report.id,
    report.clientName,
    report.location,
    report.technicianName,
    report.status,
    report.createdAt.toLocaleDateString(),
    report.submittedAt?.toLocaleDateString() || '',
    dashboard.countReportComponents(report),
    report.estimatedDurationDays
  ]);
  
  const reportsSheet = XLSX.utils.aoa_to_sheet([
    ['Report ID', 'Client', 'Location', 'Technician', 'Status', 'Created', 'Submitted', 'Components', 'Duration (days)'],
    ...reportsData
  ]);
  
  XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Reports');
  
  // Save file
  XLSX.writeFile(workbook, `kony-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// 7. INTEGRATION CHECKLIST:

/*
✅ Replace existing dashboard.js
✅ Add Enhanced BI Dashboard files
✅ Update module handlers
✅ Test with mock data
✅ Configure Firebase connection
✅ Set up auto-refresh
✅ Add export functionality
✅ Test responsive design
✅ Verify accessibility
✅ Configure error handling

🎯 BENEFITS OF NEW DASHBOARD:
- Professional, modern UI design
- Comprehensive analytics processing
- Real-time data visualization
- Mobile-responsive layout
- Advanced filtering capabilities
- Multiple export formats
- Better performance monitoring
- Enhanced error handling
- Accessibility improvements
- Mock data for development
*/