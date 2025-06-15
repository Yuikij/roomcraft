import React from 'react';
import { Edit, Trash2, Home, ChevronRight } from 'lucide-react';
import { ROOM_TYPE_LABELS } from '../../utils/constants';

const RoomCard = ({ room, onEdit, onDelete, onClick }) => {
  const handleCardClick = (e) => {
    // 如果点击的是操作按钮，不触发卡片点击事件
    if (e.target.closest('.action-button')) {
      return;
    }
    onClick && onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="glass-effect rounded-2xl p-6 card-hover cursor-pointer group relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div 
        className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-10"
        style={{ backgroundColor: room.color }}
      />
      
      {/* 房间信息 */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft"
              style={{ backgroundColor: room.color }}
            >
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                {room.name}
              </h3>
              <p className="text-sm text-neutral-500">
                {ROOM_TYPE_LABELS[room.type]}
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="action-button p-2 rounded-lg hover:bg-white/80 transition-colors"
              title="编辑房间"
            >
              <Edit className="w-4 h-4 text-neutral-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="action-button p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="删除房间"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* 房间统计 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-800">
              {room.furniture?.length || 0}
            </p>
            <p className="text-xs text-neutral-500">家具</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-800">
              0
            </p>
            <p className="text-xs text-neutral-500">物品</p>
          </div>
        </div>

        {/* 描述信息 */}
        {room.description && (
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* 查看详情 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            {room.createdAt && new Date(room.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center space-x-1 text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>查看详情</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 