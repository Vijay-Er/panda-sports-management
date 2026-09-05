const USERS_STORAGE_KEY = 'panda_sports_users';
const SESSION_STORAGE_KEY = 'panda_sports_session';

export const INITIAL_USERS = [
  {
    id: 'user-super-1',
    name: 'Academy Director',
    mobile: '9876543210',
    pin: '1234',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    isRoot: true // Root super admin cannot be deleted
  },
  {
    id: 'user-admin-2',
    name: 'Frontdesk Manager',
    mobile: '9123456780',
    pin: '1234',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    isRoot: false
  }
];

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load users:', e);
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function getActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load session:', e);
    return null;
  }
}

export function setActiveSession(user) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function clearActiveSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export function authenticateUser(mobile, pin) {
  const users = getStoredUsers();
  const cleanMobile = mobile.trim().replace(/\D/g, '');
  const cleanPin = pin.trim();

  const user = users.find(u => u.mobile === cleanMobile);
  if (!user) {
    return { success: false, error: 'Mobile number not registered.' };
  }

  if (user.status !== 'active') {
    return { success: false, error: 'This account has been deactivated. Please contact Super Admin.' };
  }

  if (user.pin !== cleanPin) {
    return { success: false, error: 'Incorrect 4-digit PIN. Please try again.' };
  }

  // Sanitize user (omit sensitive pin from session state)
  const sessionUser = {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    isRoot: !!user.isRoot
  };

  setActiveSession(sessionUser);
  return { success: true, user: sessionUser };
}

export function createNewAdmin({ name, mobile, pin, role = 'admin' }) {
  const users = getStoredUsers();
  const cleanMobile = mobile.trim().replace(/\D/g, '');
  const cleanPin = pin.trim();

  if (cleanMobile.length !== 10) {
    return { success: false, error: 'Mobile number must be exactly 10 digits.' };
  }

  if (cleanPin.length !== 4) {
    return { success: false, error: 'Security PIN must be exactly 4 digits.' };
  }

  if (users.some(u => u.mobile === cleanMobile)) {
    return { success: false, error: 'An admin with this mobile number already exists.' };
  }

  const newAdmin = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    mobile: cleanMobile,
    pin: cleanPin,
    role: role === 'super_admin' ? 'super_admin' : 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    isRoot: false
  };

  const updatedUsers = [...users, newAdmin];
  saveStoredUsers(updatedUsers);
  return { success: true, user: newAdmin, updatedUsers };
}

export function toggleUserStatus(userId) {
  const users = getStoredUsers();
  const updated = users.map(u => {
    if (u.id === userId) {
      if (u.isRoot) return u; // Safeguard root super admin
      return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
    }
    return u;
  });
  saveStoredUsers(updated);
  return updated;
}

export function deleteStoredUser(userId, currentUserId) {
  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);

  if (!target) return { success: false, error: 'User not found.' };
  if (target.isRoot) return { success: false, error: 'Root Super Admin cannot be deleted.' };
  if (target.id === currentUserId) return { success: false, error: 'You cannot delete your own active account.' };

  const updated = users.filter(u => u.id !== userId);
  saveStoredUsers(updated);
  return { success: true, updatedUsers: updated };
}
