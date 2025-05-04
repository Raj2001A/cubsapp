import React, { useState } from 'react';

interface SystemMaintenanceProps {
  onBackupNow: () => void;
  onOptimizeDatabase: () => void;
  onClearCache: () => void;
  onViewLogs: () => void;
}

const SystemMaintenance: React.FC<SystemMaintenanceProps> = ({
  onBackupNow,
  onOptimizeDatabase,
  onClearCache,
  onViewLogs
}) => {
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [backupTime, setBackupTime] = useState('02:00');
  const [retentionDays, setRetentionDays] = useState(30);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>('2023-11-15 02:00:00');
  const [backupStatus, setBackupStatus] = useState<'success' | 'failed' | 'in_progress' | null>('success');
  const [isLoading, setIsLoading] = useState(false);

  // Handle backup now
  const handleBackupNow = () => {
    setIsLoading(true);
    setBackupStatus('in_progress');
    
    // Simulate backup process
    setTimeout(() => {
      setIsLoading(false);
      setBackupStatus('success');
      setLastBackupDate(new Date().toISOString().replace('T', ' ').substring(0, 19));
      onBackupNow();
    }, 2000);
  };

  // Handle optimize database
  const handleOptimizeDatabase = () => {
    setIsLoading(true);
    
    // Simulate optimization process
    setTimeout(() => {
      setIsLoading(false);
      onOptimizeDatabase();
      alert('Database optimization completed successfully.');
    }, 2000);
  };

  // Handle clear cache
  const handleClearCache = () => {
    setIsLoading(true);
    
    // Simulate cache clearing process
    setTimeout(() => {
      setIsLoading(false);
      onClearCache();
      alert('Cache cleared successfully.');
    }, 1000);
  };

  // Save backup settings
  const handleSaveBackupSettings = () => {
    alert(`Backup settings saved. Schedule: ${backupSchedule}, Time: ${backupTime}, Retention: ${retentionDays} days`);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 20px', color: '#333' }}>System Backup & Maintenance</h2>
      
      {/* Backup Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '15px' }}>Database Backup</h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '20px',
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontWeight: '500', marginBottom: '5px' }}>Last Backup</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {lastBackupDate ? new Date(lastBackupDate).toLocaleString() : 'Never'}
            </div>
            <div style={{ 
              marginTop: '5px',
              fontSize: '0.8rem',
              color: backupStatus === 'success' ? '#10b981' : 
                    backupStatus === 'failed' ? '#ef4444' : 
                    backupStatus === 'in_progress' ? '#f59e0b' : '#6b7280'
            }}>
              {backupStatus === 'success' ? 'Backup successful' : 
               backupStatus === 'failed' ? 'Backup failed' : 
               backupStatus === 'in_progress' ? 'Backup in progress...' : 'No backup status'}
            </div>
          </div>
          
          <button
            onClick={handleBackupNow}
            disabled={isLoading || backupStatus === 'in_progress'}
            style={{
              backgroundColor: isLoading || backupStatus === 'in_progress' ? '#d1d5db' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: isLoading || backupStatus === 'in_progress' ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {isLoading || backupStatus === 'in_progress' ? 'Backing Up...' : 'Backup Now'}
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '1rem', color: '#555', marginBottom: '10px' }}>Backup Schedule</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Frequency:</label>
            <select
              value={backupSchedule}
              onChange={(e) => setBackupSchedule(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Time:</label>
            <input
              type="time"
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                width: '100%',
                maxWidth: '300px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Retention Period (days):</label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value))}
              min="1"
              max="365"
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                width: '100%',
                maxWidth: '300px'
              }}
            />
          </div>
          
          <button
            onClick={handleSaveBackupSettings}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Save Backup Settings
          </button>
        </div>
      </div>
      
      {/* Maintenance Section */}
      <div>
        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '15px' }}>System Maintenance</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '15px', 
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <h4 style={{ fontSize: '0.95rem', color: '#333', marginTop: 0, marginBottom: '10px' }}>Database Optimization</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 15px', flex: 1 }}>
              Optimize database tables, rebuild indexes, and clean up unused data to improve performance.
            </p>
            <button
              onClick={handleOptimizeDatabase}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {isLoading ? 'Processing...' : 'Optimize Database'}
            </button>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '15px', 
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <h4 style={{ fontSize: '0.95rem', color: '#333', marginTop: 0, marginBottom: '10px' }}>Clear System Cache</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 15px', flex: 1 }}>
              Clear application cache to free up memory and resolve potential issues with stale data.
            </p>
            <button
              onClick={handleClearCache}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#d1d5db' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {isLoading ? 'Processing...' : 'Clear Cache'}
            </button>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '15px', 
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <h4 style={{ fontSize: '0.95rem', color: '#333', marginTop: 0, marginBottom: '10px' }}>System Logs</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 15px', flex: 1 }}>
              View system logs to diagnose issues, track errors, and monitor system performance.
            </p>
            <button
              onClick={onViewLogs}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              View Logs
            </button>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 10px', fontWeight: '500', color: '#333' }}>System Maintenance Best Practices:</p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Schedule backups during off-peak hours to minimize impact on system performance.</li>
            <li>Regularly verify backup integrity by performing test restores.</li>
            <li>Optimize the database at least once a month for best performance.</li>
            <li>Clear cache if you notice performance degradation or unexpected behavior.</li>
            <li>Review system logs periodically to identify and address potential issues.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SystemMaintenance;
