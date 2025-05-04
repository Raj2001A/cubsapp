import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Document } from '../../types/documents';
import DocumentListItem from './DocumentListItem';

interface VirtualizedDocumentListProps {
  documents: Document[];
  onViewEmployee: (id: string) => void;
  onDownload: (id: string, name: string) => void;
  onPreview: (id: string) => void;
  getDaysUntilExpiry: (expiryDate: string | undefined) => number | null;
  getStatusBadgeStyle: (expiryDate: string | undefined) => React.CSSProperties;
  // headerHeight?: number;
  // rowHeight?: number;
  isLoading?: boolean;
}

// Row renderer for the virtualized list
const Row = ({ data, index, style }: { data: any; index: number; style: React.CSSProperties }) => {
  const { documents, onViewEmployee, onDownload, onPreview, getDaysUntilExpiry, getStatusBadgeStyle } = data;
  const document = documents[index];

  return (
    <div style={style}>
      <DocumentListItem
        document={document}
        onViewEmployee={onViewEmployee}
        onDownload={onDownload}
        onPreview={onPreview}
        getDaysUntilExpiry={getDaysUntilExpiry}
        getStatusBadgeStyle={getStatusBadgeStyle}
      />
    </div>
  );
};

const VirtualizedDocumentList: React.FC<VirtualizedDocumentListProps> = ({
  documents,
  onViewEmployee,
  onDownload,
  onPreview,
  getDaysUntilExpiry,
  getStatusBadgeStyle,
  // headerHeight = 50,
  // rowHeight = 100,
  isLoading = false
}) => {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = React.useMemo(
    () => ({
      documents,
      onViewEmployee,
      onDownload,
      onPreview,
      getDaysUntilExpiry,
      getStatusBadgeStyle
    }),
    [documents, onViewEmployee, onDownload, onPreview, getDaysUntilExpiry, getStatusBadgeStyle]
  );

  // Empty state component
  const EmptyState = useCallback(() => (
    <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
      No documents found matching your search.
    </div>
  ), []);

  // Loading state component
  const LoadingState = useCallback(() => (
    <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
      Loading documents...
    </div>
  ), []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={documents.length}
            itemSize={100}
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

export default React.memo(VirtualizedDocumentList);
