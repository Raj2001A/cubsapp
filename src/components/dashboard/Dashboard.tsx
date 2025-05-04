import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import Analytics from './Analytics';
import VisaReminders from './VisaReminders';
import RecentActivity from './RecentActivity';
import SmartSearchBar from '../ui/SmartSearchBar';

const DUMMY_ACTIVITIES = [
  // Example activity data for RecentActivity
  { id: '1', type: 'new_employee' as const, description: 'New employee added:', timestamp: new Date().toISOString(), employee: { id: 'e1', name: 'Alice Johnson' } },
  { id: '2', type: 'visa_update' as const, description: 'Visa renewed for', timestamp: new Date(Date.now() - 86400000).toISOString(), employee: { id: 'e2', name: 'John Smith' } },
  { id: '3', type: 'document_upload' as const, description: 'Document uploaded for', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), employee: { id: 'e3', name: 'Jane Doe' } },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'analytics' | 'visa' | 'activity'>('employees');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="p-4 bg-background min-h-screen animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-4">
        <h1 className="headline-large text-primary">Admin Dashboard</h1>
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Dashboard sections">
          <button
            className={`tab-btn ${activeTab === 'employees' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('employees')}
            role="tab"
            aria-selected={activeTab === 'employees'}
            tabIndex={activeTab === 'employees' ? 0 : -1}
          >Employees</button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            role="tab"
            aria-selected={activeTab === 'analytics'}
            tabIndex={activeTab === 'analytics' ? 0 : -1}
          >Analytics</button>
          <button
            className={`tab-btn ${activeTab === 'visa' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('visa')}
            role="tab"
            aria-selected={activeTab === 'visa'}
            tabIndex={activeTab === 'visa' ? 0 : -1}
          >Visa Reminders</button>
          <button
            className={`tab-btn ${activeTab === 'activity' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('activity')}
            role="tab"
            aria-selected={activeTab === 'activity'}
            tabIndex={activeTab === 'activity' ? 0 : -1}
          >Recent Activity</button>
        </div>
      </div>
      <div className="card bg-surface shadow-md rounded-lg p-4 animate-fade-in">
        {activeTab === 'employees' && (
          <>
            <SmartSearchBar
              onSearch={setSearchQuery}
              placeholder="Smart search employees..."
              className="mb-4"
            />
            <EmployeeList onSelect={() => {}} searchQuery={searchQuery} />
          </>
        )}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'visa' && <VisaReminders />}
        {activeTab === 'activity' && <RecentActivity activities={DUMMY_ACTIVITIES} />}
      </div>
    </div>
  );
};

export default Dashboard;