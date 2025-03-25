import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

type ActivityItem = {
  id: number;
  userId: number;
  username?: string;
  action: string;
  target?: string;
  timestamp: string;
  icon?: React.ReactNode;
  type?: string;
};

export function ActivityFeed() {
  const { user } = useAuth();
  
  // In a real implementation, fetch from an activity log API
  // For now, we'll combine transactions and notifications as activity items
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });
  
  // Combine and format transactions and notifications into activity items
  const activityItems: ActivityItem[] = [
    ...transactions.map((transaction: any) => ({
      id: transaction.id,
      userId: transaction.userId,
      action: `${transaction.type === 'income' ? 'Received' : 'Spent'} ${transaction.amount} ${transaction.currency}`,
      target: transaction.description || `${transaction.type} transaction`,
      timestamp: transaction.date,
      type: transaction.type === 'income' ? 'success' : 'expense'
    })),
    ...notifications.map((notification: any) => ({
      id: notification.id,
      userId: notification.userId,
      action: notification.title,
      target: notification.content,
      timestamp: notification.timestamp,
      type: notification.type
    }))
  ]
  // Sort by timestamp, most recent first
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  // Limit to 10 items
  .slice(0, 10);

  // Helper to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  // Helper to get badge variant based on activity type
  const getBadgeVariant = (type?: string) => {
    switch (type) {
      case 'success':
      case 'info':
        return 'default';
      case 'expense':
        return 'outline';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Helper to get avatar fallback based on user or action
  const getAvatarFallback = (userId: number, action: string) => {
    if (action.toLowerCase().includes('income') || action.toLowerCase().includes('received')) {
      return '💰';
    }
    if (action.toLowerCase().includes('expense') || action.toLowerCase().includes('spent')) {
      return '💸';
    }
    if (action.toLowerCase().includes('alert') || action.toLowerCase().includes('warning')) {
      return '⚠️';
    }
    if (action.toLowerCase().includes('insight') || action.toLowerCase().includes('analysis')) {
      return '🧠';
    }
    return user?.username?.[0].toUpperCase() || 'U';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest transactions and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {activityItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activity found</p>
            <p className="text-sm">Your activity will appear here as you use the system</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getAvatarFallback(item.userId, item.action)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{item.action}</p>
                    <Badge variant={getBadgeVariant(item.type)}>
                      {formatRelativeTime(item.timestamp)}
                    </Badge>
                  </div>
                  {item.target && (
                    <p className="text-xs text-muted-foreground">{item.target}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
