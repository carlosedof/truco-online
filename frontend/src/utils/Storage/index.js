const store = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const get = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return value;
  } catch {
    return null;
  }
};

const clear = (key) => {
  localStorage.removeItem(key);
};

const setMyInfo = (me) => {
  store('chatnel#me', me);
};

const clearMyInfo = () => {
  localStorage.removeItem('chatnel#me');
};

const getMyInfo = () => get('chatnel#me');

const setTheme = (theme) => {
  store('chatnel#theme', theme);
};

const clearTheme = () => {
  localStorage.removeItem('chatnel#theme');
};

const getTheme = () => get('chatnel#theme');

const setUser = (user) => {
  store('chatnel#user', user);
};

const clearUser = () => {
  localStorage.removeItem('chatnel#user');
};

const getUser = () => get('chatnel#user');

const setDismissedBanner = (user) => {
  store('chatnel#banner', user);
};

const clearDismissedBanner = () => {
  localStorage.removeItem('chatnel#banner');
};

const getDismissedBanner = () => get('chatnel#banner');

const setToken = (token) => {
  store('chatnel#token', token);
};

const getToken = () => ({
  token: get('chatnel#token'),
});

const clearToken = () => {
  clear('chatnel#token');
};

export default {
  store,
  get,
  getToken,
  clearToken,
  setToken,
  setUser,
  getUser,
  getMyInfo,
  clearMyInfo,
  setMyInfo,
  setTheme,
  getTheme,
  clearTheme,
  clearUser,
  clear,
  setDismissedBanner,
  clearDismissedBanner,
  getDismissedBanner,
};
