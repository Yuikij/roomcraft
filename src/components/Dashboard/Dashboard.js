import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, Archive, Plus, TrendingUp, Clock, MapPin, Grid, BarChart3, AlertTriangle, PieChart, Calendar, Activity, Star, CheckCircle, TrendingDown } from 'lucide-react';
import { ROOM_TYPE_LABELS, ITEM_CATEGORY_LABELS } from '../../utils/constants';
import { getExpiredItems, getNearExpiryItems } from '../../utils/expiryUtils';
import { getStockStatistics } from '../../utils/stockUtils';
import GlobalView from './GlobalView';

const Dashboard = ({ rooms, items, onRoomSelect = () => {}, onRoomsUpdate }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('overview'); // 'overview' 或 'global'

  // 统计数据
  const totalRooms = rooms.length;
  const totalItems = items.length;
  const totalFurniture = rooms.reduce((total, room) => total + (room.furniture?.length || 0), 0);

  // 过期物品统计
  const expiryStats = useMemo(() => {
    const expiredItems = getExpiredItems(items);
    const nearExpiryItems = getNearExpiryItems(items);
    return {
      expired: expiredItems.length,
      nearExpiry: nearExpiryItems.length,
      total: expiredItems.length + nearExpiryItems.length
    };
  }, [items]);

  // 库存统计
  const stockStats = useMemo(() => getStockStatistics(items), [items]);

  // 最近添加的物品
  const recentItems = items
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // 房间物品统计
  const roomStats = rooms.map(room => ({
    ...room,
    itemCount: items.filter(item => item.roomId === room.id).length
  }));

  // 物品类别统计
  const categoryStats = useMemo(() => {
    const stats = {};
    items.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1;
    });
    return Object.entries(stats).map(([category, count]) => ({
      category,
      label: ITEM_CATEGORY_LABELS[category] || category,
      count,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [items, totalItems]);

  // 房间类型统计
  const roomTypeStats = useMemo(() => {
    const stats = {};
    rooms.forEach(room => {
      stats[room.type] = (stats[room.type] || 0) + 1;
    });
    return Object.entries(stats).map(([type, count]) => ({
      type,
      label: ROOM_TYPE_LABELS[type] || type,
      count,
      percentage: totalRooms > 0 ? Math.round((count / totalRooms) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [rooms, totalRooms]);

  // 月度物品添加趋势
  const monthlyTrend = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('zh-CN', { month: 'short' });
      
      const itemsInMonth = items.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate.getFullYear() === date.getFullYear() && 
               itemDate.getMonth() === date.getMonth();
      }).length;
      
      last6Months.push({
        month: monthName,
        items: itemsInMonth,
        key: monthKey
      });
    }
    
    return last6Months;
  }, [items]);

  // 颜色配置
  const chartColors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary', trend = null, onClick = null }) => (
    <div 
      className={`glass-effect rounded-2xl p-6 card-hover ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl gradient-${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-neutral-500'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 mb-1">{value}</h3>
        <p className="text-neutral-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  // 饼图组件
  const PieChartComponent = ({ data, title, emptyMessage }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-600">{emptyMessage}</p>
        </div>
      );
    }

    const radius = 80;
    const centerX = 120;
    const centerY = 120;
    let currentAngle = 0;

    return (
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <svg width="240" height="240" className="transform -rotate-90">
              {data.map((item, index) => {
                const angle = (item.percentage / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={chartColors[index % chartColors.length]}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                    <span className="text-sm text-neutral-500">{item.count}</span>
                  </div>
                  <div className="text-xs text-neutral-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 柱状图组件
  const BarChartComponent = ({ data, title, emptyMessage }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-600">{emptyMessage}</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.items));
    const chartHeight = 160;

    return (
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-40 px-4">
            {data.map((item, index) => {
              const height = maxValue > 0 ? (item.items / maxValue) * chartHeight : 0;
              return (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="relative group">
                    <div
                      className="bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-300 hover:from-primary-600 hover:to-primary-500 min-w-[40px] flex items-end justify-center"
                      style={{ height: `${height}px` }}
                    >
                      <span className="text-white text-xs font-medium pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.items}
                      </span>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {item.items} 个物品
                    </div>
                  </div>
                  <span className="text-xs text-neutral-600 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-neutral-500 px-4">
            <span>过去6个月</span>
            <span>总计: {data.reduce((sum, item) => sum + item.items, 0)} 个物品</span>
          </div>
        </div>
      </div>
    );
  };

  // 房间活跃度组件
  const RoomActivityComponent = () => (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        房间活跃度
      </h3>
      {roomStats.length === 0 ? (
        <div className="text-center py-6">
          <Home className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
          <p className="text-neutral-600">暂无房间数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roomStats.sort((a, b) => b.itemCount - a.itemCount).slice(0, 5).map((room, index) => {
            const maxItems = Math.max(...roomStats.map(r => r.itemCount));
            const percentage = maxItems > 0 ? (room.itemCount / maxItems) * 100 : 0;
            
            return (
              <div key={room.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {index < 3 && <Star className="w-4 h-4 text-yellow-500" />}
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="text-sm font-medium text-neutral-700">{room.name}</span>
                  </div>
                  <span className="text-sm text-neutral-600">{room.itemCount} 物品</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );



  // 如果是全局视图模式，直接返回全局视图组件
  if (viewMode === 'global') {
    return <GlobalView rooms={rooms} items={items} onRoomsUpdate={onRoomsUpdate} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 欢迎信息 */}
      <div className="glass-effect rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
              欢迎回来！
            </h1>
            <p className="text-neutral-600 text-lg">
              让我们开始管理您的家居物品吧
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {/* 视图切换按钮 */}
            <div className="flex items-center bg-white/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'overview'
                    ? 'bg-white text-primary-600 shadow-soft'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>概览</span>
              </button>
              <button
                onClick={() => setViewMode('global')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'global'
                    ? 'bg-white text-primary-600 shadow-soft'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>全局视图</span>
              </button>
            </div>
            
            <button
              onClick={() => navigate('/rooms')}
              className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>添加房间</span>
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={Archive}
          title="房间总数"
          value={totalRooms}
          subtitle="已创建的房间"
          color="primary"
          trend={totalRooms > 0 ? Math.round(Math.random() * 20) : null}
          onClick={() => navigate('/rooms')}
        />
        <StatCard
          icon={Package}
          title="物品总数"
          value={totalItems}
          subtitle="已记录的物品"
          color="accent"
          trend={totalItems > 0 ? Math.round(Math.random() * 15) : null}
          onClick={() => navigate('/items')}
        />
        <StatCard
          icon={Home}
          title="家具总数"
          value={totalFurniture}
          subtitle="已添加的家具"
          color="primary"
          trend={totalFurniture > 0 ? Math.round(Math.random() * 10) : null}
          onClick={() => navigate('/furniture')}
        />
        <StatCard
          icon={AlertTriangle}
          title="过期提醒"
          value={expiryStats.total}
          subtitle={`${expiryStats.expired}已过期 ${expiryStats.nearExpiry}将过期`}
          color={expiryStats.total > 0 ? "warning" : "success"}
          onClick={() => navigate('/expiry')}
        />
      </div>

      {/* 库存统计卡片 */}
      {stockStats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            icon={Package}
            title="库存管理"
            value={stockStats.total}
            subtitle="启用库存管理的物品"
            color="primary"
            onClick={() => navigate('/stock')}
          />
          <StatCard
            icon={AlertTriangle}
            title="库存不足"
            value={stockStats.low}
            subtitle="需要关注补货"
            color="warning"
            onClick={() => navigate('/stock')}
          />
          <StatCard
            icon={TrendingDown}
            title="缺货物品"
            value={stockStats.outOfStock + stockStats.zero}
            subtitle="急需补货"
            color="error"
            onClick={() => navigate('/stock')}
          />
          <StatCard
            icon={CheckCircle}
            title="库存充足"
            value={stockStats.sufficient}
            subtitle="库存状态良好"
            color="success"
            onClick={() => navigate('/stock')}
                     />
         </div>
       )}

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent 
          data={categoryStats}
          title="物品类别分布"
          emptyMessage="暂无物品数据"
        />
        <BarChartComponent 
          data={monthlyTrend}
          title="物品添加趋势"
          emptyMessage="暂无趋势数据"
        />
      </div>

      {/* 房间分析和活跃度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent 
          data={roomTypeStats}
          title="房间类型分布"
          emptyMessage="暂无房间数据"
        />
        <RoomActivityComponent />
      </div>

      {/* 房间概览 */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">房间概览</h2>
          <button
            onClick={() => navigate('/rooms')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            查看全部
          </button>
        </div>
        
        {roomStats.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-2">还没有创建房间</p>
            <button
              onClick={() => navigate('/rooms')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              创建第一个房间
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomStats.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  onRoomSelect(room);
                  navigate('/rooms');
                }}
                className="flex flex-col items-center p-4 rounded-xl hover:bg-white/50 transition-colors border border-white/20"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <p className="font-medium text-neutral-800">{room.name}</p>
                </div>
                <p className="text-sm text-neutral-500 mb-2">
                  {ROOM_TYPE_LABELS[room.type]}
                </p>
                <div className="text-center">
                  <p className="text-lg font-bold text-neutral-800">{room.itemCount}</p>
                  <p className="text-xs text-neutral-500">物品</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 最近活动 */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            最近添加
          </h2>
          <Clock className="w-5 h-5 text-neutral-400" />
        </div>
        
        {recentItems.length === 0 ? (
          <div className="text-center py-6">
            <Package className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">暂无物品记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  <div>
                    <p className="font-medium text-neutral-800">{item.name}</p>
                    <p className="text-sm text-neutral-500">
                      {ITEM_CATEGORY_LABELS[item.category]} • 数量: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-neutral-500">
                  {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 