import React, { useState, useRef } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  keyExtractor,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate which items should be visible
  const visibleItemCount = Math.ceil(height / itemHeight) + 2; // +2 for buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1); // -1 for buffer
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount);
  
  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);
    
    // Check if we've scrolled near the end
    if (onEndReached && 
        scrollTop + clientHeight >= scrollHeight * endReachedThreshold && 
        scrollHeight > clientHeight) {
      onEndReached();
    }
  };
  
  // Calculate total content height
  const totalHeight = items.length * itemHeight;
  
  // Calculate padding to position visible items correctly
  const paddingTop = startIndex * itemHeight;
  
  // Render only the visible items
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => {
    const actualIndex = startIndex + index;
    return (
      <div 
        key={keyExtractor(item, actualIndex)} 
        style={{ height: `${itemHeight}px` }}
      >
        {renderItem(item, actualIndex)}
      </div>
    );
  });

  return (
    <div
      ref={containerRef}
      style={{ 
        height: `${height}px`, 
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: `${paddingTop}px`, width: '100%' }}>
          {visibleItems}
        </div>
      </div>
    </div>
  );
}

export default VirtualizedList;
