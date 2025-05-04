import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', current: true },
  { name: 'Employees', href: '/employees', current: false },
  { name: 'Documents', href: '/documents', current: false },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669', textDecoration: 'none' }}>
            HR Portal
          </Link>
          <div style={{ display: 'flex', marginLeft: '2rem' }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  marginRight: '1rem',
                  color: item.current ? '#111827' : '#6B7280',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '0.5rem 0',
                  borderBottom: item.current ? '2px solid #059669' : '2px solid transparent'
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              height: '2rem',
              width: '2rem',
              borderRadius: '9999px',
              backgroundColor: '#D1FAE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              fontWeight: '500'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ marginLeft: '0.5rem', color: '#4B5563' }}>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#F3F4F6',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              color: '#4B5563',
              fontWeight: '500'
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;