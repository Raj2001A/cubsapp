import React, { ReactNode } from 'react';

interface Column {
  id: string;
  header: string;
  accessor: (item: any) => ReactNode;
  minWidth?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyExtractor: (item: any) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  isLoading = false,
  loadingMessage = 'Loading data...'
}) => {
  // Filter columns that should be visible on mobile
  const mobileVisibleColumns = columns.filter(col => !col.hideOnMobile);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        {loadingMessage}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border rounded-lg">
      {/* Desktop Table - Hidden on small screens */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ minWidth: column.minWidth }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => {
              const key = keyExtractor(item);
              if (!key) {
                // eslint-disable-next-line no-console
                console.error('ResponsiveTable: Row key is missing or invalid', item);
              }
              return (
                <tr key={key}>
                  {columns.map(column => {
                    // Make ID and Name columns extra compact
                    const isCompact = column.id === 'id' || column.id === 'name';
                    const isActions = column.id === 'actions';
                    return (
                      <td
                        key={column.id}
                        className={`py-2 ${isCompact ? 'px-1' : isActions ? 'px-3' : 'px-4'} whitespace-nowrap overflow-visible text-ellipsis ${isActions ? 'sticky right-0 bg-white' : ''}`}
                        style={{
                          maxWidth: isActions ? '180px' : isCompact ? '80px' : '300px',
                          minWidth: isActions ? '140px' : isCompact ? '60px' : 'auto',
                          zIndex: isActions ? 20 : undefined
                        }}
                      >
                        {isActions ? (
                          <div className="flex gap-2 justify-end items-center w-full">
                            {column.accessor ? column.accessor(item) : item[column.id]}
                          </div>
                        ) : (
                          column.accessor ? column.accessor(item) : item[column.id]
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Shown only on small screens */}
      <div className="md:hidden">
        {data.map((item) => {
          const key = keyExtractor(item);
          if (!key) {
            // eslint-disable-next-line no-console
            console.error('ResponsiveTable: Row key is missing or invalid (mobile view)', item);
          }
          return (
            <div
              key={key}
              className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {mobileVisibleColumns.map(column => (
                  <div key={column.id} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {column.header}
                    </span>
                    <div className="mt-1">
                      {column.accessor(item)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsiveTable;
