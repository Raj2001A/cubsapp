import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Employee } from '../../types/employees';
import EmployeeListItem from './EmployeeListItem';

interface VirtualizedEmployeeListProps {
  employees: Employee[];
  onViewEmployee: (id: string) => void;
  // headerHeight?: number;
  // rowHeight?: number;
  isLoading?: boolean;
}

// Row renderer for the virtualized list
const Row = ({ data, index, style }: { data: any; index: number; style: React.CSSProperties }) => {
  const { employees, onViewEmployee } = data;
  const employee = employees[index];

  return (
    <div style={style}>
      <EmployeeListItem employee={employee} onViewEmployee={onViewEmployee} />
    </div>
  );
};

const VirtualizedEmployeeList: React.FC<VirtualizedEmployeeListProps> = ({
  employees,
  onViewEmployee,
  // headerHeight = 50,
  // rowHeight = 80,
  isLoading = false
}) => {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = React.useMemo(
    () => ({
      employees,
      onViewEmployee
    }),
    [employees, onViewEmployee]
  );

  // Empty state component
  const EmptyState = useCallback(() => (
    <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
      No employees found matching your search.
    </div>
  ), []);

  // Loading state component
  const LoadingState = useCallback(() => (
    <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
      Loading employees...
    </div>
  ), []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (employees.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={employees.length}
            itemSize={80}
            width={width}
            itemData={itemData}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default React.memo(VirtualizedEmployeeList);
