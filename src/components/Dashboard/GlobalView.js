import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, Edit, Plus, Move } from 'lucide-react';
import { ROOM_TYPE_LABELS } from '../../utils/constants';

const GlobalView = ({ rooms, items, onRoomsUpdate }) => {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleRoomMouseDown = (e, room) => {
    e.preventDefault();
    setSelectedRoom(room);
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedRoom) return;

    const container = document.getElementById('global-canvas');
    const containerRect = container.getBoundingClientRect();
    
    const newX = Math.max(0, Math.min(
      containerRect.width - (selectedRoom.globalWidth || 200),
      e.clientX - containerRect.left - dragOffset.x
    ));
    
    const newY = Math.max(0, Math.min(
      containerRect.height - (selectedRoom.globalHeight || 150),
      e.clientY - containerRect.top - dragOffset.y
    ));

    // 更新房间全局位置
    const updatedRooms = rooms.map(r =>
      r.id === selectedRoom.id
        ? { ...r, globalX: newX, globalY: newY }
        : r
    );
    
    onRoomsUpdate(updatedRooms);
    setSelectedRoom({ ...selectedRoom, globalX: newX, globalY: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const getRoomItems = (roomId) => {
    return items.filter(item => item.roomId === roomId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">全局视图</h1>
          <p className="text-neutral-600">查看和编辑所有房间的布局</p>
        </div>
        <button
          onClick={() => navigate('/rooms')}
          className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>添加房间</span>
        </button>
      </div>

      {/* 全局画布 */}
      <div className="glass-effect rounded-2xl p-6">
        <div
          id="global-canvas"
          className="relative w-full h-96 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {rooms.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Home className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">还没有房间</h3>
                <p className="text-neutral-600 mb-6">创建您的第一个房间来开始管理家居物品</p>
                <button
                  onClick={() => navigate('/rooms')}
                  className="gradient-primary text-white px-8 py-4 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>创建房间</span>
                </button>
              </div>
            </div>
          ) : (
            rooms.map((room, index) => {
              const roomItems = getRoomItems(room.id);
              const roomX = room.globalX || 50 + (index % 4) * 220;
              const roomY = room.globalY || 50 + Math.floor(index / 4) * 170;
              const roomWidth = room.globalWidth || 200;
              const roomHeight = room.globalHeight || 150;
              
              return (
                <div
                  key={room.id}
                  className={`absolute cursor-move rounded-lg border-2 transition-all duration-200 ${
                    selectedRoom?.id === room.id
                      ? 'border-primary-500 shadow-floating z-10'
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  style={{
                    left: roomX,
                    top: roomY,
                    width: roomWidth,
                    height: roomHeight,
                    backgroundColor: room.color + '20'
                  }}
                  onMouseDown={(e) => handleRoomMouseDown(e, room)}
                >
                  {/* 房间头部 */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-8 rounded-t-lg flex items-center justify-between px-3"
                    style={{ backgroundColor: room.color + '80' }}
                  >
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium truncate">
                        {room.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/room/${room.id}`);
                      }}
                      className="p-1 rounded hover:bg-white/20 transition-colors"
                      title="编辑房间"
                    >
                      <Edit className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  {/* 房间内容 */}
                  <div className="absolute top-8 left-0 right-0 bottom-0 p-2">
                    {/* 房间信息 */}
                    <div className="text-center mb-2">
                      <div className="text-xs text-neutral-600">
                        {ROOM_TYPE_LABELS[room.type]}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {room.furniture?.length || 0} 家具 • {roomItems.length} 物品
                      </div>
                    </div>

                    {/* 简化的家具显示 */}
                    <div className="relative flex-1">
                      {room.furniture?.slice(0, 3).map((furniture, furnitureIndex) => (
                        <div
                          key={furniture.id}
                          className="absolute rounded border border-neutral-400"
                          style={{
                            left: `${(furnitureIndex % 2) * 40 + 10}%`,
                            top: `${Math.floor(furnitureIndex / 2) * 30 + 10}%`,
                            width: '35%',
                            height: '25%',
                            backgroundColor: furniture.color + '60'
                          }}
                        />
                      ))}
                      
                      {/* 物品指示器 */}
                      {roomItems.slice(0, 5).map((item, itemIndex) => (
                        <div
                          key={item.id}
                          className="absolute w-2 h-2 bg-primary-500 rounded-full"
                          style={{
                            right: `${itemIndex * 8 + 5}%`,
                            bottom: '10%'
                          }}
                          title={item.name}
                        />
                      ))}
                      
                      {roomItems.length > 5 && (
                        <div
                          className="absolute text-xs text-primary-600 font-medium"
                          style={{ right: '5%', bottom: '5%' }}
                        >
                          +{roomItems.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 调整大小手柄 */}
                  {selectedRoom?.id === room.id && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 border border-white cursor-se-resize"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* 图例 */}
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Move className="w-4 h-4" />
              <span>拖拽移动房间</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border-2 border-primary-500"></div>
              <span>选中状态</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>物品位置</span>
            </div>
          </div>
          <div className="text-xs">
            全局视图 • {rooms.length} 个房间 • {items.length} 个物品
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalView; 