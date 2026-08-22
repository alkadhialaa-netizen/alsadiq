import { UserAccount } from '../types';
import defaultUsersData from '../data/defaultUsers.json';

const USERS_STORAGE_KEY = 'traffic_police_users_taiz_v3';
const CURRENT_USER_KEY = 'traffic_police_current_user_taiz_v3';

// Initialize and retrieve all users from storage or fallback to default JSON
export function getAllUsers(): UserAccount[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure صادق account is present in list
        const hasSadeq = parsed.some(
          (u) => u.username === 'صادق' || u.username.toLowerCase() === 'sadeq'
        );
        if (!hasSadeq) {
          const defaults = defaultUsersData as UserAccount[];
          const combined = [...defaults.filter(d => d.username === 'صادق' || d.username === 'sadeq'), ...parsed];
          saveAllUsers(combined);
          return combined;
        }
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error reading users from localStorage, using default JSON', error);
  }

  // Fallback to default JSON and save
  const defaults = defaultUsersData as UserAccount[];
  saveAllUsers(defaults);
  return defaults;
}

// Save all users to JSON storage
export function saveAllUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Failed to save users JSON', error);
  }
}

// Verify login credentials against JSON users list
export function authenticateUser(username: string, password: string): { success: boolean; user?: UserAccount; message?: string } {
  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = password.trim();

  if (!trimmedUser || !trimmedPass) {
    return { success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
  }

  const users = getAllUsers();
  const matched = users.find(
    (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
  );

  if (!matched) {
    return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة، يرجى التأكد والمحاولة مجدداً.' };
  }

  if (!matched.isActive) {
    return { success: false, message: 'هذا الحساب موقوف حالياً من قبل مدير النظام.' };
  }

  // Update last login timestamp
  const updatedUser: UserAccount = {
    ...matched,
    lastLogin: new Date().toISOString(),
  };

  const updatedList = users.map((u) => (u.id === matched.id ? updatedUser : u));
  saveAllUsers(updatedList);
  setCurrentSession(updatedUser);

  return { success: true, user: updatedUser };
}

// Session management
export function getCurrentSession(): UserAccount | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to parse current user session', e);
  }
  return null;
}

export function setCurrentSession(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to update user session', e);
  }
}

export function logoutUser(): void {
  setCurrentSession(null);
}

// User CRUD Helpers
export function addUser(newUser: Omit<UserAccount, 'id' | 'createdAt'>): { success: boolean; message?: string } {
  const users = getAllUsers();
  const exists = users.some((u) => u.username.toLowerCase() === newUser.username.trim().toLowerCase());
  
  if (exists) {
    return { success: false, message: 'اسم المستخدم مسجل مسبقاً لموظف آخر' };
  }

  const user: UserAccount = {
    ...newUser,
    id: `usr-${Date.now()}`,
    username: newUser.username.trim(),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveAllUsers(users);
  return { success: true };
}

export function updateUser(id: string, updates: Partial<UserAccount>): { success: boolean; message?: string } {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return { success: false, message: 'المستخدم غير موجود' };
  }

  users[index] = { ...users[index], ...updates };
  saveAllUsers(users);

  // If updating current active user session, sync it
  const current = getCurrentSession();
  if (current && current.id === id) {
    setCurrentSession(users[index]);
  }

  return { success: true };
}

export function deleteUser(id: string): { success: boolean; message?: string } {
  const users = getAllUsers();
  const current = getCurrentSession();
  
  if (current && current.id === id) {
    return { success: false, message: 'لا يمكنك حذف حسابك أثناء تسجيل الدخول به' };
  }

  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === 0) {
    return { success: false, message: 'لا يمكن حذف جميع المستخدمين، يجب أن يبقى مستخدم واحد على الأقل' };
  }

  saveAllUsers(filtered);
  return { success: true };
}

// Export users as JSON file
export function exportUsersJSON(): void {
  const users = getAllUsers();
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(users, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `traffic_officers_users_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Reset users back to default JSON
export function resetUsersToDefault(): void {
  const defaults = defaultUsersData as UserAccount[];
  saveAllUsers(defaults);
}
