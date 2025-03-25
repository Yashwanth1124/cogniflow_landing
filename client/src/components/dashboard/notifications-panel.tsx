import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCircle, AlertCircle, InfoIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/lib/websocket";

export function NotificationsPanel() {
  const [displayCount, setDisplayCount] = useState(5);
  
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Set up websocket for real-time notifications
  const { lastMessage } = useWebSocket({
    onMessage: (data) => {
      if (data.type === "new-notification") {
        // Invalidate the notifications query to re-fetch
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      }
    },
  });

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
          <CardDescription>Stay updated with important alerts</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!notifications || notifications.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground mt-1">
              You don't have any notifications at the moment.
            </p>
          </div>
        )}

        {!isLoading &&
          notifications &&
          notifications.slice(0, displayCount).map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-3 py-3 border-b border-border last:border-0",
                !notification.isRead && "bg-muted/50"
              )}
            >
              <div className="mt-1">{getIconForType(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs mt-2 h-7 px-3"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ))}
      </CardContent>
      {notifications && notifications.length > displayCount && (
        <CardFooter className="border-t pt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setDisplayCount((prev) => prev + 5)}
          >
            Load more
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
