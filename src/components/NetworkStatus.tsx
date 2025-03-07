 
import { Badge, createStyles, Group, Tooltip } from '@mantine/core';
import { IconRefresh, IconWifi, IconWifiOff } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { offlineTransactionManager } from '../services/OfflineTransactionManager';

// Create styles for the component
const useStyles = createStyles(() => ({
  rotating: {
    animation: 'rotate 1.5s linear infinite',
  },
  '@keyframes rotate': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
}));

/**
 * Component for displaying network status
 * Shows online/offline status and pending sync operations
 */
export function NetworkStatus() {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Update online status when it changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check for pending sync items
  useEffect(() => {
    let isMounted = true;
    
    const checkSyncStatus = async () => {
      try {
        if (isMounted) {
          setIsSyncing(true);
          const count = await offlineTransactionManager.getPendingSyncCount();
          if (isMounted) {
            setPendingSyncCount(count);
            setIsSyncing(false);
          }
        }
      } catch (error) {
        console.error('Error checking sync status:', error);
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };
    
    // Check immediately
    void checkSyncStatus();
    
    // Set up interval to check regularly
    const interval = setInterval(checkSyncStatus, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOnline]);
  
  // Trigger manual sync
  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      await offlineTransactionManager.syncTransactions();
      const count = await offlineTransactionManager.getPendingSyncCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error('Error during manual sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Group spacing="xs">
      <Badge 
        size="sm"
        color={isOnline ? 'green' : 'red'}
        leftSection={isOnline ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
      >
        {isOnline ? t('network.online') : t('network.offline')}
      </Badge>
      
      {isOnline && pendingSyncCount > 0 && (
        <Tooltip label={t('network.pendingSyncTooltip')}>
          <Badge 
            size="sm"
            color="blue"
            leftSection={<IconRefresh size={12} className={isSyncing ? classes.rotating : ''} />}
            style={{ cursor: 'pointer' }}
            onClick={handleManualSync}
          >
            {isSyncing 
              ? t('network.syncing') 
              : t('network.pendingSyncCount', { count: pendingSyncCount })}
          </Badge>
        </Tooltip>
      )}
    </Group>
  );
} 