import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Outlet />
      </main>
      <footer style={{ backgroundColor: 'white', marginTop: '2rem', padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
        <p>
          © {new Date().getFullYear()} HR Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;