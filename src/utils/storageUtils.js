export const storageUtils = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
  getJSON: (key) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },
  setJSON: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
};
