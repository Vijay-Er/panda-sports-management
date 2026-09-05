const PREFIX = 'panda_sports_';

export function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export function exportAllDataJSON(data) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `Panda_Sports_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function clearAllStorage() {
  try {
    localStorage.removeItem(PREFIX + 'bookings');
    localStorage.removeItem(PREFIX + 'transactions');
    localStorage.removeItem(PREFIX + 'beverages');
    localStorage.removeItem(PREFIX + 'soundEnabled');
  } catch (e) {
    console.error('Error clearing storage', e);
  }
}
