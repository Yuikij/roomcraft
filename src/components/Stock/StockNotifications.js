import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Package, 
  TrendingDown,
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { generateStockNotifications } from '../../utils/stockUtils';

const StockNotifications = ({ items, onMarkAsRead }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(new Set());

  // 生成通知
  useEffect(() => {
    const stockNotifications = generateStockNotifications(items);
    setNotifications(stockNotifications);
  }, [items]);

  // 未读通知数量
  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  // 处理通知点击
  const handleNotificationClick = (notification) => {
    // 标记为已读
    setReadNotifications(prev => new Set([...prev, notification.id]));
    
    // 导航到相应页面
    if (notification.route) {
      navigate(notification.route);
      setIsOpen(false);
    }
  };

  // 关闭所有通知
  const handleDismissAll = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(prev => new Set([...prev, ...allIds]));
    if (onMarkAsRead) {
      onMarkAsRead(allIds);
    }
  };

  // 如果没有通知，不显示
  if (notifications.length === 0) {
    return null;
  }

  const NotificationIcon = ({ type }) => {
    switch (type) {
      case 'error':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Package className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      {/* 通知铃铛按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-800 hover:bg-white/50 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 通知内容 */}
          <div className="absolute top-full right-0 mt-2 w-80 z-50">
            <div className="glass-effect rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* 头部 */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-neutral-800">库存提醒</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleDismissAll}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        全部已读
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-white/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 通知列表 */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-neutral-600">库存状态良好</p>
                    <p className="text-sm text-neutral-500">暂无需要关注的库存问题</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => {
                      const isRead = readNotifications.has(notification.id);
                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 text-left hover:bg-white/30 transition-colors ${
                            !isRead ? 'bg-white/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <NotificationIcon type={notification.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium ${
                                  !isRead ? 'text-neutral-900' : 'text-neutral-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                {!isRead && (
                                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-neutral-600 mb-2">
                                {notification.message}
                              </p>
                              
                              {/* 物品预览 */}
                              {notification.items && notification.items.length > 0 && (
                                <div className="space-y-1">
                                  {notification.items.slice(0, 3).map((item) => (
                                    <div key={item.id} className="text-xs text-neutral-500 flex items-center space-x-2">
                                      <span>•</span>
                                      <span>{item.name}</span>
                                      <span className="text-neutral-400">({item.quantity || 0} {item.stockUnit || '个'})</span>
                                    </div>
                                  ))}
                                  {notification.items.length > 3 && (
                                    <div className="text-xs text-neutral-500">
                                      还有 {notification.items.length - 3} 个物品...
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-primary-600 font-medium">
                                  {notification.action}
                                </span>
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 底部操作 */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      navigate('/stock');
                      setIsOpen(false);
                    }}
                    className="w-full gradient-primary text-white py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200"
                  >
                    查看库存管理
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockNotifications; 