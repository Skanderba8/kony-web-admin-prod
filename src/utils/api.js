// src/utils/api.js - Basic API utilities (keeping existing functionality)
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

/**
 * Get reports by status
 */
export async function getReportsByStatus(status) {
  try {
    console.log(`Getting reports with status: ${status}`);
    const reportsRef = collection(db, 'technical_visit_reports');
    let q;
    
    if (status === 'all') {
      q = query(reportsRef, orderBy('createdAt', 'desc'));
    } else {
      q = query(reportsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} reports`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting reports:", error);
    throw error;
  }
}

/**
 * Get a single report by ID
 */
export async function getReportById(reportId) {
  try {
    console.log(`Getting report with ID: ${reportId}`);
    const docRef = doc(db, 'technical_visit_reports', reportId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Report found');
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log('Report not found');
      throw new Error('Report not found');
    }
  } catch (error) {
    console.error("Error getting report:", error);
    throw error;
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(reportId, newStatus) {
  try {
    console.log(`Updating report ${reportId} to status: ${newStatus}`);
    await updateDoc(doc(db, 'technical_visit_reports', reportId), {
      status: newStatus,
      lastModified: new Date().toISOString()
    });
    console.log('Report status updated successfully');
    return true;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
}

/**
 * Delete report
 */
export async function deleteReport(reportId) {
  try {
    console.log(`Deleting report with ID: ${reportId}`);
    await deleteDoc(doc(db, 'technical_visit_reports', reportId));
    console.log('Report deleted successfully');
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getUsers() {
  try {
    console.log('Getting all users');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('displayName', 'asc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.docs.length} users`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}

/**
 * Update user data
 */
export async function updateUser(userId, userData) {
  try {
    console.log(`Updating user ${userId}`);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      lastModified: new Date().toISOString()
    });
    console.log('User updated successfully');
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  try {
    console.log(`Deleting user with ID: ${userId}`);
    await deleteDoc(doc(db, 'users', userId));
    console.log('User deleted successfully');
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Add new user
 */
export async function addUser(userData) {
  try {
    console.log('Adding new user');
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
    console.log('User added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role) {
  try {
    console.log(`Getting users with role: ${role}`);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.docs.length} users with role ${role}`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting users by role:", error);
    throw error;
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(searchTerm) {
  try {
    console.log(`Searching users with term: ${searchTerm}`);
    
    // Get all users first (Firestore doesn't support complex text search)
    const allUsers = await getUsers();
    
    // Filter on client side
    const filteredUsers = allUsers.filter(user => 
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    console.log(`Found ${filteredUsers.length} matching users`);
    return filteredUsers;
    
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

// Export all functions
export {
  getReportsByStatus,
  getReportById,
  updateReportStatus,
  deleteReport,
  getUsers,
  updateUser,
  deleteUser,
  addUser,
  getUsersByRole,
  searchUsers
};