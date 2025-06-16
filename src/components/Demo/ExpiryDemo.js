import React from 'react';
import { Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react';

// 演示数据
const demoItems = [
  {
    id: '1',
    name: '牛奶',
    category: 'food',
    expiryDate: '2024-01-15', // 已过期
    purchaseDate: '2024-01-05',
    brand: '蒙牛',
    reminderEnabled: true,
    quantity: 1,
    roomId: 'kitchen',
    isConsumed: false
  },
  {
    id: '2',
    name: '面包',
    category: 'food',
    expiryDate: '2024-01-20', // 即将过期
    purchaseDate: '2024-01-17',
    brand: '桃李',
    reminderEnabled: true,
    quantity: 1,
    roomId: 'kitchen',
    isConsumed: false
  },
  {
    id: '3',
    name: '感冒药',
    category: 'medicine',
    expiryDate: '2025-06-15', // 新鲜
    purchaseDate: '2024-01-10',
    brand: '999',
    batchNumber: 'ABC123',
    reminderEnabled: true,
    quantity: 1,
    roomId: 'bedroom',
    isConsumed: false
  },
  {
    id: '4',
    name: '护手霜',
    category: 'cosmetics',
    expiryDate: '2024-02-28', // 即将过期
    purchaseDate: '2023-12-01',
    brand: '妮维雅',
    reminderEnabled: true,
    quantity: 1,
    roomId: 'bathroom',
    isConsumed: false
  }
];

const ExpiryDemo = () => {
  const getStatusColor = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return '#ef4444'; // 红色 - 已过期
    if (diffInDays <= 7) return '#f59e0b'; // 橙色 - 即将过期
    return '#10b981'; // 绿色 - 新鲜
  };

  const getStatusText = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return `已过期 ${Math.abs(diffInDays)} 天`;
    if (diffInDays === 0) return '今天到期';
    if (diffInDays === 1) return '明天到期';
    return `还有 ${diffInDays} 天到期`;
  };

  const getStatusIcon = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return <AlertTriangle className="w-4 h-4" />;
    if (diffInDays <= 7) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">过期管理功能演示</h2>
        <p className="text-neutral-600">展示不同过期状态的物品</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoItems.map((item) => {
          const statusColor = getStatusColor(item.expiryDate);
          const statusText = getStatusText(item.expiryDate);
          const statusIcon = getStatusIcon(item.expiryDate);

          return (
            <div key={item.id} className="glass-effect rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">{item.name}</h3>
                    <p className="text-sm text-neutral-500">{item.brand}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: statusColor + '20', 
                      color: statusColor 
                    }}
                  >
                    {statusIcon}
                    <span className="ml-1">{statusText}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-neutral-600">
                <div>
                  <span className="font-medium">过期日期:</span> {new Date(item.expiryDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">购买日期:</span> {new Date(item.purchaseDate).toLocaleDateString()}
                </div>
                {item.batchNumber && (
                  <div>
                    <span className="font-medium">批次号:</span> {item.batchNumber}
                  </div>
                )}
                <div>
                  <span className="font-medium">提醒状态:</span> 
                  <span className={`ml-1 ${item.reminderEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {item.reminderEnabled ? '已启用' : '未启用'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">功能说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-medium text-red-800">已过期</div>
              <div className="text-red-600">物品已超过保质期</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <div className="font-medium text-orange-800">即将过期</div>
              <div className="text-orange-600">7天内将到期</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium text-green-800">新鲜</div>
              <div className="text-green-600">距离过期还有较长时间</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiryDemo; 