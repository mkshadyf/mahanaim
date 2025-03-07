import { Box, Loader, Text } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PullToRefresh.module.css';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  pullDistance?: number;
  children: React.ReactNode;
}

/**
 * Component for adding pull-to-refresh functionality
 * Optimized for mobile devices
 */
export function PullToRefresh({
  onRefresh,
  isRefreshing = false,
  pullDistance = 80,
  children
}: PullToRefreshProps) {
  const { t } = useTranslation();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState<'idle' | 'pulling' | 'canRelease' | 'refreshing'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullStartTimeRef = useRef<number | null>(null);
  
  // Update state based on props
  useEffect(() => {
    if (isRefreshing) {
      setState('refreshing');
      setRefreshing(true);
    } else if (state === 'refreshing') {
      setState('idle');
      setRefreshing(false);
      setPullY(0);
    }
  }, [isRefreshing, state]);
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull to refresh when at the top of the page
    if (window.scrollY <= 0) {
      startYRef.current = e.touches[0].clientY;
      pullStartTimeRef.current = Date.now();
    }
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshing || !startYRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    // Only allow pulling down
    if (diff > 0 && window.scrollY <= 0) {
      // Apply resistance to make it harder to pull
      const newPullY = Math.min(pullDistance * 1.5, diff * 0.5);
      setPullY(newPullY);
      
      // Update state based on pull distance
      if (newPullY >= pullDistance) {
        setState('canRelease');
      } else {
        setState('pulling');
      }
      
      // Prevent default to avoid scrolling
      e.preventDefault();
    }
  };
  
  // Handle touch end
  const handleTouchEnd = async () => {
    if (!startYRef.current || refreshing) return;
    
    // Reset refs
    startYRef.current = null;
    pullStartTimeRef.current = null;
    
    // If pulled enough, trigger refresh
    if (state === 'canRelease') {
      setState('refreshing');
      setRefreshing(true);
      
      try {
        await onRefresh();
      } finally {
        // Reset after refresh
        setState('idle');
        setRefreshing(false);
        setPullY(0);
      }
    } else {
      // Reset if not pulled enough
      setState('idle');
      setPullY(0);
    }
  };
  
  // Get message based on state
  const getMessage = () => {
    switch (state) {
      case 'pulling':
        return t('pullToRefresh');
      case 'canRelease':
        return t('releaseToRefresh');
      case 'refreshing':
        return t('refreshing');
      default:
        return '';
    }
  };
  
  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: `translateY(${pullY}px)`,
        transition: state === 'idle' ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      <Box 
        className={styles.pullIndicator}
        style={{ 
          height: `${pullY}px`,
          opacity: pullY / pullDistance,
          display: state !== 'idle' ? 'flex' : 'none'
        }}
      >
        {state === 'refreshing' ? (
          <Loader size="sm" />
        ) : (
          <Text size="sm">{getMessage()}</Text>
        )}
      </Box>
      
      {children}
    </Box>
  );
} 