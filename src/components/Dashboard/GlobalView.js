import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, Edit, Plus, Move, Save, ArrowLeft, BarChart3 } from 'lucide-react';
import { ROOM_TYPE_LABELS } from '../../utils/constants';

const GlobalView = ({ rooms, items, onRoomsUpdate, onBackToOverview }) => {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [livePosition, setLivePosition] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tempRoomPositions, setTempRoomPositions] = useState({});
  
  // 使用 useRef 来存储拖拽状态，避免 useCallback 频繁重新创建
  const dragStateRef = useRef({
    isDragging: false,
    isResizing: false,
    dragOffset: { x: 0, y: 0 },
    resizeHandle: null,
    selectedRoom: null
  });

  // 获取事件的坐标（支持鼠标和触屏）
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleRoomMouseDown = (e, room) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedRoom(room);
    
    const container = document.getElementById('global-canvas');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const index = rooms.findIndex(r => r.id === room.id);
    
    // 获取当前房间位置（可能是临时位置或原始位置）
    const currentPos = tempRoomPositions[room.id];
    const roomX = currentPos?.x ?? room.globalX ?? 50 + (index % 4) * 220;
    const roomY = currentPos?.y ?? room.globalY ?? 50 + Math.floor(index / 4) * 170;
    const roomWidth = currentPos?.width ?? room.globalWidth ?? 200;
    const roomHeight = currentPos?.height ?? room.globalHeight ?? 150;

    // 考虑容器的 border，计算鼠标相对于容器内容区域的位置
    const borderWidth = 2;
    const { clientX, clientY } = getEventCoordinates(e);
    const mouseX = clientX - containerRect.left - borderWidth;
    const mouseY = clientY - containerRect.top - borderWidth;

    // 检查是否点击了调整大小手柄
    if (e.target.classList.contains('resize-handle')) {
      document.body.style.cursor = getComputedStyle(e.target).cursor;
      dragStateRef.current = {
        isDragging: false,
        isResizing: true,
        resizeHandle: e.target.dataset.handle,
        selectedRoom: room,
        dragOffset: { x: 0, y: 0 }
      };
      
      setLivePosition({ 
        x: roomX, 
        y: roomY, 
        width: roomWidth, 
        height: roomHeight 
      });
      return;
    }

    // 更新 ref 状态
    dragStateRef.current = {
      isDragging: true,
      isResizing: false,
      selectedRoom: room,
      resizeHandle: null,
      dragOffset: {
        x: mouseX - roomX,
        y: mouseY - roomY
      }
    };

    setLivePosition({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
  };

  const handleMouseMove = useCallback((e) => {
    const { isDragging, isResizing, selectedRoom, dragOffset, resizeHandle } = dragStateRef.current;
    
    if (!isDragging && !isResizing || !selectedRoom) return;

    const container = document.getElementById('global-canvas');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // 考虑容器的 border (border-2 = 2px)
    const borderWidth = 2;
    const availableWidth = containerRect.width - borderWidth * 2;
    const availableHeight = containerRect.height - borderWidth * 2;
    
    // 计算鼠标相对于容器内容区域的位置
    const { clientX, clientY } = getEventCoordinates(e);
    const mouseX = clientX - containerRect.left - borderWidth;
    const mouseY = clientY - containerRect.top - borderWidth;
    
    if (isDragging) {
      const roomWidth = livePosition?.width ?? selectedRoom.globalWidth ?? 200;
      const roomHeight = livePosition?.height ?? selectedRoom.globalHeight ?? 150;
      
      // 计算元素应该的位置（考虑拖拽偏移）
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;
      
      // 边界限制：确保元素完全在容器内容区域内，并且能够贴合边界
      newX = Math.max(0, Math.min(availableWidth - roomWidth, newX));
      newY = Math.max(0, Math.min(availableHeight - roomHeight, newY));

      // 直接更新位置，不依赖其他状态
      setLivePosition(prev => ({ ...prev, x: newX, y: newY }));
      
    } else if (isResizing) {
      const currentPos = tempRoomPositions[selectedRoom.id];
      const originalX = currentPos?.x ?? selectedRoom.globalX ?? 50;
      const originalY = currentPos?.y ?? selectedRoom.globalY ?? 50;
      const originalWidth = currentPos?.width ?? selectedRoom.globalWidth ?? 200;
      const originalHeight = currentPos?.height ?? selectedRoom.globalHeight ?? 150;

      let { x, y, width, height } = { 
        x: originalX, 
        y: originalY, 
        width: originalWidth, 
        height: originalHeight 
      };

      switch (resizeHandle) {
        case 'se':
          width = Math.max(100, Math.min(availableWidth - originalX, mouseX - originalX));
          height = Math.max(80, Math.min(availableHeight - originalY, mouseY - originalY));
          break;
        case 'sw':
          width = Math.max(100, originalX + originalWidth - mouseX);
          height = Math.max(80, Math.min(availableHeight - originalY, mouseY - originalY));
          x = Math.max(0, mouseX);
          break;
        case 'ne':
          width = Math.max(100, Math.min(availableWidth - originalX, mouseX - originalX));
          height = Math.max(80, originalY + originalHeight - mouseY);
          y = Math.max(0, mouseY);
          break;
        case 'nw':
          width = Math.max(100, originalX + originalWidth - mouseX);
          height = Math.max(80, originalY + originalHeight - mouseY);
          x = Math.max(0, mouseX);
          y = Math.max(0, mouseY);
          break;
        default: break;
      }
      
      setLivePosition({ x, y, width, height });
    }
  }, [livePosition, tempRoomPositions]); // 空依赖数组，避免重新创建

  const handleMouseUp = useCallback(() => {
    const { isDragging, isResizing, selectedRoom } = dragStateRef.current;
    
    document.body.style.cursor = 'default';
    
    if ((isDragging || isResizing) && selectedRoom && livePosition) {
      // 保存到临时位置，不立即更新到 rooms
      setTempRoomPositions(prev => ({
        ...prev,
        [selectedRoom.id]: { 
          x: livePosition.x, 
          y: livePosition.y,
          width: livePosition.width,
          height: livePosition.height
        }
      }));
      setHasUnsavedChanges(true);
    }
    
    // 重置拖拽状态
    dragStateRef.current = {
      isDragging: false,
      isResizing: false,
      selectedRoom: null,
      resizeHandle: null,
      dragOffset: { x: 0, y: 0 }
    };
    
    setLivePosition(null);
  }, [livePosition]);

  // 保存所有位置变更
  const handleSaveChanges = () => {
    if (!hasUnsavedChanges) return;
    
    const updatedRooms = rooms.map(room => {
      const tempPos = tempRoomPositions[room.id];
      if (tempPos) {
        return { 
          ...room, 
          globalX: tempPos.x, 
          globalY: tempPos.y,
          globalWidth: tempPos.width,
          globalHeight: tempPos.height
        };
      }
      return room;
    });
    
    onRoomsUpdate(updatedRooms);
    setTempRoomPositions({});
    setHasUnsavedChanges(false);
  };

  // 取消所有未保存的变更
  const handleCancelChanges = () => {
    setTempRoomPositions({});
    setHasUnsavedChanges(false);
    setSelectedRoom(null);
  };

  // 添加全局事件监听器以确保拖拽在整个窗口范围内工作
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e) => {
      e.preventDefault(); // 防止页面滚动
      handleMouseMove(e);
    };
    const handleGlobalTouchEnd = () => handleMouseUp();

    // 鼠标事件
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // 触屏事件
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp]);

  const getRoomItems = (roomId) => {
    return items.filter(item => item.roomId === roomId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="glass-effect rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 返回主页按钮 */}
            <button
              onClick={onBackToOverview}
              className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/60 hover:bg-white/80 transition-all duration-300 group"
              title="返回主页"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" />
              <BarChart3 className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" />
              <span className="text-neutral-600 group-hover:text-neutral-800 font-medium transition-colors">返回概览</span>
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-1">全局视图</h1>
              <p className="text-neutral-600">查看和编辑所有房间的布局</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <>
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveChanges}
                className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>保存布局</span>
              </button>
            </>
          )}
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

      {/* 全局画布 */}
      <div className="glass-effect rounded-2xl p-6">
        <div
          id="global-canvas"
          className="relative w-full h-[600px] bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 overflow-hidden touch-optimized"
          onClick={(e) => {
            // 点击空白区域时清除选中状态
            if (e.target === e.currentTarget) {
              setSelectedRoom(null);
            }
          }}
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
              
              const isSelected = selectedRoom?.id === room.id;
              const isBeingInteracted = isSelected && (dragStateRef.current.isDragging || dragStateRef.current.isResizing);
              const hasUnsavedPosition = tempRoomPositions[room.id];

              // 获取房间位置和尺寸：交互中 > 临时位置 > 原始位置 > 默认位置
              let roomX, roomY, roomWidth, roomHeight;
              if (isBeingInteracted && livePosition) {
                roomX = livePosition.x;
                roomY = livePosition.y;
                roomWidth = livePosition.width;
                roomHeight = livePosition.height;
              } else if (hasUnsavedPosition) {
                roomX = hasUnsavedPosition.x;
                roomY = hasUnsavedPosition.y;
                roomWidth = hasUnsavedPosition.width;
                roomHeight = hasUnsavedPosition.height;
              } else {
                roomX = room.globalX ?? 50 + (index % 4) * 220;
                roomY = room.globalY ?? 50 + Math.floor(index / 4) * 170;
                roomWidth = room.globalWidth || 200;
                roomHeight = room.globalHeight || 150;
              }
              
              return (
                <div
                  key={room.id}
                  className={`absolute cursor-move rounded-lg border-2 draggable-element ${
                    isSelected
                      ? 'border-primary-500 shadow-floating z-10'
                      : hasUnsavedPosition
                      ? 'border-orange-400 shadow-md'
                      : 'border-neutral-300 hover:border-neutral-400'
                  } ${isBeingInteracted ? '' : 'transition-all duration-200'}`}
                  style={{
                    left: roomX,
                    top: roomY,
                    width: roomWidth,
                    height: roomHeight,
                    backgroundColor: room.color + '20'
                  }}
                  onMouseDown={(e) => handleRoomMouseDown(e, room)}
                  onTouchStart={(e) => handleRoomMouseDown(e, room)}
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
                      {hasUnsavedPosition && (
                        <span className="text-white/80 text-xs">●</span>
                      )}
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
                    <>
                      <div className="resize-handle absolute -bottom-1 -right-1 bg-primary-500 border border-white cursor-se-resize" data-handle="se"></div>
                      <div className="resize-handle absolute -bottom-1 -left-1 bg-primary-500 border border-white cursor-sw-resize" data-handle="sw"></div>
                      <div className="resize-handle absolute -top-1 -right-1 bg-primary-500 border border-white cursor-ne-resize" data-handle="ne"></div>
                      <div className="resize-handle absolute -top-1 -left-1 bg-primary-500 border border-white cursor-nw-resize" data-handle="nw"></div>
                    </>
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
              <div className="w-4 h-4 rounded border-2 border-orange-400"></div>
              <span>未保存变更</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>物品位置</span>
            </div>
          </div>
          <div className="text-xs">
            全局视图 • {rooms.length} 个房间 • {items.length} 个物品
            {hasUnsavedChanges && <span className="text-orange-600 ml-2">• 有未保存的变更</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalView; 