import React from 'react';
import { useOffline } from '@/context/offline-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineStatusProps {
  className?: string;
}

export function OfflineStatus({ className }: OfflineStatusProps) {
  const { isOnline, isSyncing, pendingChanges, syncNow, lastSyncTime } = useOffline();
  
  // Format the last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    
    // If less than a minute ago
    if (diff < 60000) {
      return 'Just now';
    }
    
    // If less than an hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // If less than a day ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // If more than a day ago
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {isOnline ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <Cloud className="h-3 w-3" />
          <span>Online</span>
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          <span>Offline</span>
        </Badge>
      )}
      
      {isOnline && pendingChanges > 0 && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          {pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'}
        </Badge>
      )}
      
      {isOnline && pendingChanges > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={syncNow} 
          disabled={isSyncing}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", isSyncing && "animate-spin")} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      )}
      
      {lastSyncTime && (
        <span className="text-xs text-muted-foreground">
          Last synced: {formatLastSync()}
        </span>
      )}
    </div>
  );
}