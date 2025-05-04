import React, { useState, useEffect } from 'react';
import VisaExpiryReminders from './VisaExpiryReminders';
import LoadingSpinner from './components/ui/LoadingSpinner';
import BackendStatus from './components/BackendStatus';
import { getDashboardStats, getRecentActivity, DashboardStats, RecentActivity } from './services/dashboardService';
import { useUI, ErrorSeverity } from './context/UIContext';
import { OperationType } from './types/ui';
import type { User } from './types/user';

interface DashboardProps {
  user: User;
  onViewEmployee: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onViewEmployee }) => {
  // Get UI context for loading and error handling
  const { setLoading, addError } = useUI();

  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeVisas: 0,
    expiringVisas: 0,
    expiredVisas: 0,
    employeesByCompany: [],
    employeesByNationality: [],
    employeesByTrade: []
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(OperationType.FETCH_DASHBOARD_DATA, true);
        setIsLoadingStats(true);

        // Fetch dashboard statistics
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        addError(
          'Failed to load dashboard statistics',
          ErrorSeverity.ERROR,
          OperationType.FETCH_DASHBOARD_DATA,
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        setIsLoadingStats(false);
        setLoading(OperationType.FETCH_DASHBOARD_DATA, false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        setIsLoadingActivity(true);

        // Fetch recent activity
        const activity = await getRecentActivity(3);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchDashboardData();
    fetchRecentActivity();
  }, []);
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Dashboard</h1>
        <div>
          <span style={{ color: '#666' }}>
            Welcome, {user.name ?? user.email ?? 'User'}
          </span>
        </div>
      </div>

      {isLoadingStats ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoadingSpinner size="medium" message="Loading employee data..." />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: '#1976d2', fontSize: '1.25rem', fontWeight: '600' }}>{stats.totalEmployees}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>Total Employees</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{stats.totalEmployees}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: '#388e3c', fontSize: '1.25rem', fontWeight: '600' }}>{stats.activeVisas}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>Active Visas</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{stats.activeVisas}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                backgroundColor: '#fff8e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: '#ffa000', fontSize: '1.25rem', fontWeight: '600' }}>{stats.expiringVisas}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>Expiring Soon</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{stats.expiringVisas}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                backgroundColor: '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <span style={{ color: '#d32f2f', fontSize: '1.25rem', fontWeight: '600' }}>{stats.expiredVisas}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>Expired</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{stats.expiredVisas}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Visa Expiry Reminders</h2>
        {stats.expiringVisas > 0 || stats.expiredVisas > 0 ? (
          <VisaExpiryReminders onViewEmployee={onViewEmployee} limit={5} />
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>
            No visa expiry reminders. All visas are active.
          </p>
        )}
      </div>

      {/* Backend Status - Only visible to admins */}
      {user.role === 'Administrator' && (
        <BackendStatus />
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Recent Activity</h2>
        {isLoadingActivity ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <LoadingSpinner size="small" />
          </div>
        ) : recentActivity.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentActivity.map((activity, index) => (
              <li key={`${activity.employeeId}-${index}`} style={{
                padding: '10px 0',
                borderBottom: index < recentActivity.length - 1 ? '1px solid #eee' : undefined,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>
                  {activity.type === 'employee_added' && (
                    <>New employee <strong>{activity.employeeName}</strong> added</>
                  )}
                  {activity.type === 'document_uploaded' && (
                    <>Document uploaded for <strong>{activity.employeeName}</strong></>
                  )}
                  {activity.type === 'visa_expired' && (
                    <>Visa expired for <strong>{activity.employeeName}</strong></>
                  )}
                  {activity.type === 'visa_expiring' && (
                    <>Visa expiring soon for <strong>{activity.employeeName}</strong></>
                  )}
                  {activity.details && <span style={{ color: '#666' }}> - {activity.details}</span>}
                </span>
                <span style={{ color: '#666', fontSize: '0.875rem' }}>
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>
            No recent activity to display.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
