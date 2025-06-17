import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home, Archive, Package, Search, Plus, MapPin, Clock, TrendingDown, Sparkles } from 'lucide-react';
import { ROOM_TYPE_LABELS } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose, rooms, onRoomSelect, selectedRoom }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: '仪表盘', path: '/' },
    { icon: Archive, label: '房间管理', path: '/rooms' },
    { icon: Package, label: '物品管理', path: '/items' },
    { icon: Clock, label: '过期管理', path: '/expiry' },
    { icon: TrendingDown, label: '库存管理', path: '/stock' },
    { icon: Search, label: '搜索', path: '/search' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleRoomSelect = (room) => {
    onRoomSelect(room);
    onClose();
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-50 w-80 glass-effect border-r border-white/20 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gradient">家居管家</h2>
                <p className="text-xs text-neutral-500">智能物品管理</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white/80 text-primary-600 shadow-soft'
                    : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            {/* 新增：整理模式入口 */}
            <div className="pt-2 mt-2 border-t border-white/20">
              <button
                onClick={() => handleNavigation('/organization')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  location.pathname === '/organization'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-soft-strong'
                    : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-800'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${location.pathname === '/organization' ? 'text-white' : 'text-amber-500'}`} />
                <span className="font-semibold text-gradient-gold">整理模式</span>
              </button>
            </div>
          </nav>

          {/* 房间列表 */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-700">房间列表</h3>
              <button
                onClick={() => handleNavigation('/rooms')}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                title="添加房间"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            
            <div className="space-y-2">
              {rooms.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">暂无房间</p>
                  <button
                    onClick={() => handleNavigation('/rooms')}
                    className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                  >
                    创建第一个房间
                  </button>
                </div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'bg-white/80 shadow-soft'
                        : 'hover:bg-white/40'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: room.color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-neutral-800">{room.name}</p>
                      <p className="text-xs text-neutral-500">
                        {ROOM_TYPE_LABELS[room.type]} • {room.furniture?.length || 0} 家具
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 侧边栏底部 */}
          <div className="p-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-xs text-neutral-500">
                © 2024 家居管家
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 