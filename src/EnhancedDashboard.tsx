import React, { useState, useEffect } from 'react';
import StatisticsCards from './components/dashboard/StatisticsCards';
import DistributionCharts from './components/dashboard/DistributionCharts';
import VisaExpiryTimeline from './components/dashboard/VisaExpiryTimeline';
import RecentActivity from './components/dashboard/RecentActivity';
import VisaExpiryReminders from './VisaExpiryReminders';
import api from './services/api';
// Removed unused import: import { Employee } from './types/employees';
import { EmployeeVisaStatus } from './types/employees';
import { Page } from './App';
import { useEmployees } from './context/EmployeeContext';

// Removed unused OperationType, ErrorSeverity imports

interface EnhancedDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
    id?: string;
  };
  onViewEmployee: (id: string) => void;
  onNavigate: (page: Page) => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  user,
  onViewEmployee,
  onNavigate
}) => {
  // Use EmployeeContext for employees
  const { employees, isLoading } = useEmployees();
  const [companies, setCompanies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies only
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setError(null);
        // Fetch companies
        const companiesResponse = await api.companies.getAll();
        setCompanies(companiesResponse.data);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please try again.');
      }
    };
    fetchCompanies();
  }, []);

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeVisas = employees.filter(emp => emp.visaStatus === EmployeeVisaStatus.ACTIVE).length;
  const expiringVisas = employees.filter(emp => emp.visaStatus === EmployeeVisaStatus.EXPIRING).length;
  const expiredVisas = employees.filter(emp => emp.visaStatus === EmployeeVisaStatus.EXPIRED).length;

  // Calculate document compliance (for now, we'll set it to 0 since we don't have document data)
  const documentCompliance = 0;

  // Calculate new hires (employees joined in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newHires = employees.filter(emp => new Date(emp.joinDate) >= thirtyDaysAgo).length;

  // Generate company distribution data
  const companyDistribution = companies.map((company, index) => {
    const count = employees.filter(emp => emp.companyId === company.id).length;
    return {
      label: company.name.split(',')[0], // Just take the company name without location
      fullName: company.name, // Store the full name for tooltip
      value: count,
      color: getColorByIndex(index)
    };
  }).filter(item => item.value > 0);

  // Generate nationality distribution data
  const nationalityCounts: Record<string, number> = {};
  employees.forEach(emp => {
    nationalityCounts[emp.nationality] = (nationalityCounts[emp.nationality] || 0) + 1;
  });

  const nationalityDistribution = Object.entries(nationalityCounts)
    .map(([nationality, count], index) => ({
      label: nationality,
      value: count,
      color: getColorByIndex(index + 3) // offset to get different colors
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 nationalities

  // Generate trade distribution data
  const tradeCounts: Record<string, number> = {};
  employees.forEach(emp => {
    if (emp.trade !== undefined && emp.trade !== null) {
      tradeCounts[String(emp.trade)] = (tradeCounts[String(emp.trade)] || 0) + 1;
    }
  });

  const tradeDistribution = Object.entries(tradeCounts)
    .map(([trade, count], index) => ({
      label: trade,
      value: count,
      color: getColorByIndex(index + 7) // offset to get different colors
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 trades

  // Generate visa expiry timeline data
  const next12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      count: 0
    };
  });

  employees.forEach(emp => {
    const expiryDate = new Date(emp.visaExpiryDate);
    const today = new Date();

    // Check if expiry is within the next 12 months
    if (expiryDate >= today && expiryDate <= new Date(today.getFullYear(), today.getMonth() + 12, today.getDate())) {
      const monthDiff = (expiryDate.getFullYear() - today.getFullYear()) * 12 + expiryDate.getMonth() - today.getMonth();
      if (monthDiff >= 0 && monthDiff < 12) {
        next12Months[monthDiff].count++;
      }
    }
  });

  // Generate upcoming expirations data
  const upcomingExpirations = employees
    .filter(emp => {
      const expiryDate = new Date(emp.visaExpiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays >= -30; // Include recently expired and soon to expire
    })
    .map(emp => ({
      id: emp.id,
      name: emp.name,
      employeeId: emp.employeeId,
      expiryDate: emp.visaExpiryDate,
      company: emp.companyName.split(',')[0]
    }))
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // Generate mock recent activity (we'll keep this for now)
  const recentActivities = [
    {
      id: '1',
      type: 'new_employee' as const,
      description: 'New employee added:',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      employee: {
        id: employees[0]?.id || '1',
        name: employees[0]?.name || 'Employee'
      }
    },
    {
      id: '2',
      type: 'document_upload' as const,
      description: 'Visa document uploaded for',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      employee: {
        id: employees[1]?.id || '2',
        name: employees[1]?.name || 'Employee'
      }
    },
    {
      id: '3',
      type: 'visa_update' as const,
      description: 'Visa status updated to "Expiring" for',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      employee: {
        id: employees[2]?.id || '3',
        name: employees[2]?.name || 'Employee'
      }
    }
  ];

  // Helper function to get color by index
  function getColorByIndex(index: number): string {
    const colors = [
      '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
      '#6366f1', '#14b8a6', '#a855f7', '#d946ef', '#f43f5e'
    ];
    return colors[index % colors.length];
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Dashboard</h1>
        <div>
          <span style={{ color: '#666' }}>
            Welcome, {user.name}
          </span>
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', margin: '30px 0', fontSize: 18 }}>Loading employees...</div>
      )}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', margin: '20px 0' }}>{error}</div>
      )}

      {/* Statistics Cards */}
      <StatisticsCards
        totalEmployees={totalEmployees}
        activeVisas={activeVisas}
        expiringVisas={expiringVisas}
        expiredVisas={expiredVisas}
        documentCompliance={documentCompliance}
        newHires={newHires}
      />

      {/* Distribution Charts */}
      <DistributionCharts
        companyDistribution={companyDistribution}
        nationalityDistribution={nationalityDistribution}
        tradeDistribution={tradeDistribution}
      />

      {/* Visa Expiry Timeline */}
      <VisaExpiryTimeline
        expiryData={next12Months}
        upcomingExpirations={upcomingExpirations}
      />

      {/* Recent Activity and Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <RecentActivity activities={recentActivities} />

        {/* Quick Actions Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#374151' }}>
            Quick Actions
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <button
              onClick={() => onNavigate('employees')}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" />
              </svg>
              View Employees
            </button>

            <button
              onClick={() => onNavigate('documents')}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
              </svg>
              Manage Documents
            </button>

            <button
              onClick={() => onNavigate('notifications')}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor" />
              </svg>
              View Notifications
            </button>

            <button
              onClick={() => onNavigate('smartEmployeeManagement')}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" fill="currentColor" />
              </svg>
              Smart Search
            </button>
          </div>
        </div>
      </div>

      {/* Legacy Visa Expiry Reminders */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Visa Expiry Reminders</h2>
        <VisaExpiryReminders onViewEmployee={onViewEmployee} limit={5} />
      </div>
    </div>
  );
};

export default EnhancedDashboard;
