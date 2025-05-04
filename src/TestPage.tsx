import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      marginTop: '50px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>Test Page</h1>
      <p style={{ color: '#666', marginTop: '20px' }}>
        If you can see this page, the React application is rendering correctly.
      </p>
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff', borderRadius: '4px' }}>
        <h2 style={{ color: '#333', fontSize: '18px' }}>Debugging Information</h2>
        <ul style={{ textAlign: 'left', lineHeight: '1.6', marginTop: '10px' }}>
          <li>React is loaded and rendering components</li>
          <li>The application's routing system is working</li>
          <li>The browser can display basic HTML and CSS</li>
        </ul>
      </div>
      <div style={{ marginTop: '30px' }}>
        <button 
          style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Button click works!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestPage;
