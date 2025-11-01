import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard';

// The most robust way to ensure the DOM is ready before trying to render the app.
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found inside DOMContentLoaded! This should not happen.');
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Dashboard />
    </React.StrictMode>
  );
});
