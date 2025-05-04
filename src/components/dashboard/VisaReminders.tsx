import React from 'react';
import { useVisaReminders } from '../../hooks/useVisaReminders';

export interface VisaReminder {
  id: number;
  name: string;
  department: string;
  visaExpiryDate: string | null;
}

export const VisaReminders: React.FC = () => {
  const { reminders, sendReminder, setThreshold, threshold, isLoading } = useVisaReminders();

  return (
    <div className="p-4 bg-background min-h-screen animate-fade-in">
      <div className="headline-large mb-4 text-primary">Visa Expiry Reminders</div>
      <div className="card bg-surface shadow-md rounded-lg p-4 mb-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-secondary">Show visas expiring in:</span>
          <select className="input bg-surface border border-border rounded px-3 py-2 text-tertiary" value={threshold} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setThreshold(Number(e.target.value))}>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <table className="min-w-full divide-y divide-border bg-surface rounded">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Visa Expiry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Days Left</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><div className="body-text text-tertiary mt-4 animate-pulse">Loading...</div></td></tr>
            ) : reminders.map((rem: VisaReminder) => {
              const visaExpiryDate = rem.visaExpiryDate ? new Date(rem.visaExpiryDate) : null;
              const daysLeft = visaExpiryDate ? Math.ceil((visaExpiryDate.getTime() - Date.now()) / (1000*60*60*24)) : null;
              let statusClass = 'badge-status-other', statusLabel = 'Unknown';
              if (daysLeft !== null) {
                if (daysLeft < 0) { statusClass = 'badge-status-expired'; statusLabel = 'Expired'; }
                else if (daysLeft <= 30) { statusClass = 'badge-status-expiring'; statusLabel = 'Expiring Soon'; }
                else { statusClass = 'badge-status-active'; statusLabel = 'Active'; }
              }
              return (
                <tr key={rem.id} className={daysLeft !== null && daysLeft <= 7 ? 'bg-red-50' : ''}>
                  <td className="body-text text-tertiary">{rem.name}</td>
                  <td className="body-text text-tertiary">{rem.department}</td>
                  <td className="body-text text-tertiary">{rem.visaExpiryDate}</td>
                  <td className="body-text text-tertiary">{daysLeft !== null ? daysLeft : '-'}</td>
                  <td><span className={`caption ${statusClass}`}>{statusLabel}</span></td>
                  <td>
                    <button className="button-primary bg-primary text-white hover:bg-primary-700 rounded px-3 py-1 transition" onClick={(e: React.MouseEvent<HTMLButtonElement>) => sendReminder(rem.id.toString())}>
                      Send Reminder
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisaReminders;
