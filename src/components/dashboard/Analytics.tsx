import React from 'react';
import { useAnalytics, EmployeeDocStatus } from '../../hooks/useAnalytics';

export const Analytics: React.FC = () => {
  const { visaStats, percentCompliant, employeeDocStatus } = useAnalytics();

  return (
    <div className="p-4 bg-background min-h-screen animate-fade-in">
      <div className="headline-large mb-4 text-primary">Dashboard Analytics</div>
      <div className="card bg-surface shadow-md rounded-lg p-4 mb-4 animate-fade-in">
        <div className="flex flex-wrap gap-8 mb-4">
          <div>
            <div className="headline-medium text-secondary">Visas expiring in 30 days</div>
            <div className="body-text text-tertiary">{visaStats['30']}</div>
          </div>
          <div>
            <div className="headline-medium text-secondary">Visas expiring in 60 days</div>
            <div className="body-text text-tertiary">{visaStats['60']}</div>
          </div>
          <div>
            <div className="headline-medium text-secondary">Visas expiring in 90 days</div>
            <div className="body-text text-tertiary">{visaStats['90']}</div>
          </div>
          <div>
            <div className="headline-medium text-secondary">Compliant Employees (%)</div>
            <div className="body-text text-tertiary">{percentCompliant}%</div>
            <div className="w-40 h-2 bg-statusOther rounded-full mt-1">
              <div className="h-2 rounded-full bg-statusActive" style={{ width: `${percentCompliant}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="card bg-surface shadow-md rounded-lg p-4 animate-fade-in">
        <div className="font-bold mb-2 text-secondary">Document Status by Employee</div>
        <table className="min-w-full divide-y divide-border bg-surface rounded">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Uploaded</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Missing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Expired</th>
            </tr>
          </thead>
          <tbody>
            {employeeDocStatus.map((emp: EmployeeDocStatus) => (
              <tr key={emp.id}>
                <td className="body-text text-tertiary">{emp.name}</td>
                <td><span className="caption badge-status-active">{emp.uploaded}</span></td>
                <td><span className="caption badge-status-other">{emp.missing}</span></td>
                <td><span className="caption badge-status-expired">{emp.expired}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
