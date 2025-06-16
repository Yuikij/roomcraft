import React, { useState, useMemo } from 'react';
import { Clock, AlertTriangle, Calendar, Package, CheckCircle, X } from 'lucide-react';
import { 
  getExpiryStatus, 
  getNearExpiryItems, 
  getExpiredItems, 
  formatRemainingDays 
} from '../../utils/expiryUtils';
import { 
  EXPIRY_STATUS, 
  EXPIRY_STATUS_LABELS, 
  EXPIRY_COLORS,
  ITEM_CATEGORY_LABELS 
} from '../../utils/constants';

const ExpiryManager = ({ items, rooms, onItemUpdate }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [showConsumedItems, setShowConsumedItems] = useState(false);

  // 过期物品统计
  const expiryStats = useMemo(() => {
    const expiredItems = getExpiredItems(items);
    const nearExpiryItems = getNearExpiryItems(items);
    const totalWithExpiry = items.filter(item => item.hasExpiryManagement && item.expiryDate && !item.isConsumed);
    const consumedItems = items.filter(item => item.hasExpiryManagement && item.isConsumed);

    return {
      expired: expiredItems.length,
      nearExpiry: nearExpiryItems.length,
      total: totalWithExpiry.length,
      consumed: consumedItems.length
    };
  }, [items]);

  // 筛选物品
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      if (!showConsumedItems && item.isConsumed) return false;
      if (!item.hasExpiryManagement || !item.expiryDate) return false;
      
      const status = getExpiryStatus(item);
      
      switch (selectedTab) {
        case 'expired':
          return status === EXPIRY_STATUS.EXPIRED;
        case 'near_expiry':
          return status === EXPIRY_STATUS.NEAR_EXPIRY;
        case 'fresh':
          return status === EXPIRY_STATUS.FRESH;
        default:
          return true;
      }
    });

    // 按过期时间排序
    return filtered.sort((a, b) => {
      if (!a.expiryDate || !b.expiryDate) return 0;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  }, [items, selectedTab, showConsumedItems]);

  const handleMarkAsConsumed = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      onItemUpdate(itemId, { 
        ...item, 
        isConsumed: true,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleMarkAsNotConsumed = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      onItemUpdate(itemId, { 
        ...item, 
        isConsumed: false,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`glass-effect rounded-2xl p-6 card-hover transition-all duration-200 ${
        isActive ? 'ring-2 ring-primary-500 bg-primary-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: color + '20', color: color }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 mb-1">{value}</h3>
        <p className="text-neutral-600 font-medium">{title}</p>
      </div>
    </button>
  );

  const ExpiryItemCard = ({ item }) => {
    const expiryStatus = getExpiryStatus(item);
    const statusColor = EXPIRY_COLORS[expiryStatus];
    const room = rooms.find(r => r.id === item.roomId);

    return (
      <div className="glass-effect rounded-2xl p-6 card-hover">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-neutral-800">{item.name}</h3>
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: statusColor + '20', 
                  color: statusColor 
                }}
              >
                {EXPIRY_STATUS_LABELS[expiryStatus]}
              </span>
              {item.isConsumed && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  已消耗
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>{ITEM_CATEGORY_LABELS[item.category]}</span>
                {item.brand && <span>· {item.brand}</span>}
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>到期时间: {formatRemainingDays(item)}</span>
              </div>
              
              {room && (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <span>{room.name}</span>
                </div>
              )}
              
              {item.quantity > 1 && (
                <div className="text-neutral-500">
                  数量: {item.quantity}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            {!item.isConsumed ? (
              <button
                onClick={() => handleMarkAsConsumed(item.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>标记为已用完</span>
              </button>
            ) : (
              <button
                onClick={() => handleMarkAsNotConsumed(item.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>恢复</span>
              </button>
            )}
          </div>
        </div>

        {item.expiryDate && (
          <div className="border-t border-neutral-200 pt-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {item.purchaseDate && (
                <div>
                  <p className="text-neutral-500">购买日期</p>
                  <p className="font-medium">{new Date(item.purchaseDate).toLocaleDateString()}</p>
                </div>
              )}
              
              <div>
                <p className="text-neutral-500">过期日期</p>
                <p className="font-medium">{new Date(item.expiryDate).toLocaleDateString()}</p>
              </div>
              
              {item.batchNumber && (
                <div>
                  <p className="text-neutral-500">批次号</p>
                  <p className="font-medium">{item.batchNumber}</p>
                </div>
              )}
              
              {item.shelfLife && (
                <div>
                  <p className="text-neutral-500">保质期</p>
                  <p className="font-medium">{item.shelfLife} 天</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">过期管理</h1>
          <p className="text-neutral-600">管理和追踪物品的过期状态</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          title="总计"
          value={expiryStats.total}
          color={EXPIRY_COLORS[EXPIRY_STATUS.NO_EXPIRY]}
          onClick={() => setSelectedTab('all')}
          isActive={selectedTab === 'all'}
        />
        <StatCard
          icon={AlertTriangle}
          title="已过期"
          value={expiryStats.expired}
          color={EXPIRY_COLORS[EXPIRY_STATUS.EXPIRED]}
          onClick={() => setSelectedTab('expired')}
          isActive={selectedTab === 'expired'}
        />
        <StatCard
          icon={Clock}
          title="即将过期"
          value={expiryStats.nearExpiry}
          color={EXPIRY_COLORS[EXPIRY_STATUS.NEAR_EXPIRY]}
          onClick={() => setSelectedTab('near_expiry')}
          isActive={selectedTab === 'near_expiry'}
        />
        <StatCard
          icon={CheckCircle}
          title="新鲜"
          value={expiryStats.total - expiryStats.expired - expiryStats.nearExpiry}
          color={EXPIRY_COLORS[EXPIRY_STATUS.FRESH]}
          onClick={() => setSelectedTab('fresh')}
          isActive={selectedTab === 'fresh'}
        />
      </div>

      {/* 过滤选项 */}
      <div className="glass-effect rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-neutral-700">显示选项:</span>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showConsumedItems}
                onChange={(e) => setShowConsumedItems(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600">包含已消耗物品</span>
            </label>
          </div>
          
          <div className="text-sm text-neutral-500">
            共找到 {filteredItems.length} 个物品
          </div>
        </div>
      </div>

      {/* 物品列表 */}
      {filteredItems.length === 0 ? (
        <div className="glass-effect rounded-3xl p-12 text-center">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">
            没有找到相关物品
          </h3>
          <p className="text-neutral-600">
            {selectedTab === 'all' 
              ? '还没有启用过期管理的物品' 
              : `当前没有${selectedTab === 'expired' ? '已过期' : selectedTab === 'near_expiry' ? '即将过期' : '新鲜'}的物品`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <ExpiryItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpiryManager; 