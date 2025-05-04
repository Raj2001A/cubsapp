import ReactDOM from 'react-dom/client';
import AppWithContext from './AppWithContext.tsx';
import './index.css';
import './styles/cubs-theme.css';
import './styles/animations.css';

// Removed unused React import
// Removed unused OperationType, ErrorSeverity imports

// Apply some basic styles directly to avoid CSS issues
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f9f9f9;
    color: #333;
  }
`;
document.head.appendChild(style);

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  // Temporarily disable StrictMode to prevent double rendering in development
  // <React.StrictMode>
    <AppWithContext />
  // </React.StrictMode>
);
