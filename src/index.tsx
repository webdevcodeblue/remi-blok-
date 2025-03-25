import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Check for localStorage availability at startup
const checkStorageAvailability = (type: 'localStorage' | 'sessionStorage') => {
  try {
    const storage = window[type];
    const testKey = `test_${Math.random()}`;
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    console.log(`${type} is available and working properly`);
    return true;
  } catch (e) {
    console.error(`${type} is not available:`, e);
    return false;
  }
};

// Test storage methods at startup
const localStorageAvailable = checkStorageAvailability('localStorage');
const sessionStorageAvailable = checkStorageAvailability('sessionStorage');

// Log storage availability
console.log(
  `Storage availability - localStorage: ${localStorageAvailable}, sessionStorage: ${sessionStorageAvailable}`
);

// If neither localStorage nor sessionStorage is available, show a warning
if (!localStorageAvailable && !sessionStorageAvailable) {
  console.warn(
    'Neither localStorage nor sessionStorage is available. Game progress may not be saved!'
  );
  alert(
    'Vaš preglednik ne podržava localStorage ni sessionStorage. Napredak igre možda neće biti spremljen!'
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
