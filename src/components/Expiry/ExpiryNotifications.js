import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, X, CheckCircle } from 'lucide-react';
import { generateExpiryNotifications } from '../../utils/expiryUtils';

const ExpiryNotifications = ({ items, onItemUpdate, onNotificationDismiss }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const expiryNotifications = generateExpiryNotifications(items);
    setNotifications(expiryNotifications);
  }, [items]);

  const handleMarkAsConsumed = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item && onItemUpdate) {
      onItemUpdate(itemId, { 
        ...item, 
        isConsumed: true,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleDismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (onNotificationDismiss) {
      onNotificationDismiss(notificationId);
    }
  };

  const NotificationItem = ({ notification }) => {
    const { item, type, title, message, priority } = notification;
    
    const getIcon = () => {
      switch (type) {
        case 'expired':
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'near_expiry':
          return <Clock className="w-5 h-5 text-orange-500" />;
        default:
          return <Bell className="w-5 h-5 text-blue-500" />;
      }
    };

    const getBorderColor = () => {
      switch (priority) {
        case 'high':
          return 'border-red-200 bg-red-50';
        case 'medium':
          return 'border-orange-200 bg-orange-50';
        default:
          return 'border-blue-200 bg-blue-50';
      }
    };

    return (
      <div className={`rounded-xl p-4 border ${getBorderColor()} transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getIcon()}
            <div className="flex-1">
              <h4 className="font-medium text-neutral-800 mb-1">{title}</h4>
              <p className="text-sm text-neutral-600 mb-2">{message}</p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleMarkAsConsumed(item.id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>标记为已用完</span>
                </button>
                
                <button
                  onClick={() => handleDismissNotification(notification.id)}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  忽略提醒
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => handleDismissNotification(notification.id)}
            className="text-neutral-400 hover:text-neutral-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      {/* 通知按钮 */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="mb-4 flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-neutral-200"
      >
        <div className="relative">
          <Bell className="w-5 h-5 text-neutral-600" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-neutral-700">
          {notifications.length} 个过期提醒
        </span>
      </button>

      {/* 通知列表 */}
      {showNotifications && (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-800">过期提醒</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
          
          {notifications.length > 3 && (
            <div className="p-4 border-t border-neutral-200 text-center">
              <button
                onClick={() => {
                  notifications.forEach(n => handleDismissNotification(n.id));
                }}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                全部忽略
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpiryNotifications; 