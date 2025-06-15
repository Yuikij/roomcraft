import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, Archive, Plus, TrendingUp, Clock, MapPin, Grid, BarChart3 } from 'lucide-react';
import { ROOM_TYPE_LABELS, ITEM_CATEGORY_LABELS } from '../../utils/constants';
import GlobalView from './GlobalView';

const Dashboard = ({ rooms, items, onRoomSelect = () => {}, onRoomsUpdate }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('overview'); // 'overview' 或 'global'

  // 统计数据
  const totalRooms = rooms.length;
  const totalItems = items.length;
  const totalFurniture = rooms.reduce((total, room) => total + (room.furniture?.length || 0), 0);

  // 最近添加的物品
  const recentItems = items
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // 房间物品统计
  const roomStats = rooms.map(room => ({
    ...room,
    itemCount: items.filter(item => item.roomId === room.id).length
  }));

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => (
    <div className="glass-effect rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl gradient-${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <TrendingUp className="w-5 h-5 text-neutral-400" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 mb-1">{value}</h3>
        <p className="text-neutral-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, onClick, color = 'primary' }) => (
    <button
      onClick={onClick}
      className="glass-effect rounded-2xl p-4 card-hover text-left w-full"
    >
      <div className={`w-10 h-10 rounded-xl gradient-${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-semibold text-neutral-800 mb-1">{title}</h4>
      <p className="text-sm text-neutral-600">{description}</p>
    </button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon={Archive}
          title="房间总数"
          value={totalRooms}
          subtitle="已创建的房间"
          color="primary"
        />
        <StatCard
          icon={Package}
          title="物品总数"
          value={totalItems}
          subtitle="已记录的物品"
          color="accent"
        />
        <StatCard
          icon={Home}
          title="家具总数"
          value={totalFurniture}
          subtitle="已添加的家具"
          color="primary"
        />
      </div>

      {/* 房间概览和快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="space-y-3">
              {roomStats.slice(0, 4).map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onRoomSelect(room);
                    navigate('/rooms');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: room.color }}
                    />
                    <div className="text-left">
                      <p className="font-medium text-neutral-800">{room.name}</p>
                      <p className="text-sm text-neutral-500">
                        {ROOM_TYPE_LABELS[room.type]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-800">{room.itemCount}</p>
                    <p className="text-xs text-neutral-500">物品</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="glass-effect rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">快速操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon={Archive}
              title="添加房间"
              description="创建新的房间"
              onClick={() => navigate('/rooms')}
              color="primary"
            />
            <QuickAction
              icon={Package}
              title="添加物品"
              description="记录新的物品"
              onClick={() => navigate('/items')}
              color="accent"
            />
            <QuickAction
              icon={Home}
              title="编辑房间"
              description="修改房间布局"
              onClick={() => navigate('/rooms')}
              color="primary"
            />
            <QuickAction
              icon={Package}
              title="搜索物品"
              description="查找物品位置"
              onClick={() => navigate('/search')}
              color="accent"
            />
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">最近添加</h2>
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
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
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