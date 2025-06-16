import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Plus, Move, Trash2, Home, ArrowLeft, Package } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { roomStorage, itemStorage } from '../../utils/storage';
import { FURNITURE_TYPES, FURNITURE_TYPE_LABELS, DEFAULT_FURNITURE } from '../../utils/constants';
import Modal from '../Common/Modal';

const RoomEditor = ({ rooms, onRoomsUpdate, items = [], onItemsUpdate }) => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedFurniture, setExpandedFurniture] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  
  // 简化状态管理，使用独立状态
  const [liveFurnitureStyle, setLiveFurnitureStyle] = useState(null);
  const [liveItemPosition, setLiveItemPosition] = useState(null);

  // 使用 useRef 来存储拖拽状态，避免 useCallback 频繁重新创建
  const dragStateRef = useRef({
    isDragging: false,
    isResizing: false,
    isDraggingItem: false,
    isResizingItem: false,
    dragOffset: { x: 0, y: 0 },
    resizeHandle: null,
    selectedFurniture: null,
    selectedItem: null
  });

  const [showAddFurnitureModal, setShowAddFurnitureModal] = useState(false);
  const [furnitureForm, setFurnitureForm] = useState({
    name: '',
    type: FURNITURE_TYPES.WARDROBE,
    color: '#8b7355'
  });

  // 获取当前房间的物品
  const roomItems = items.filter(item => item.roomId === roomId);

  useEffect(() => {
    const currentRoom = rooms.find(r => r.id === roomId);
    if (currentRoom) {
      setRoom(currentRoom);
    } else {
      navigate('/rooms');
    }

    // 处理高亮物品参数
    const highlightItem = searchParams.get('highlightItem');
    if (highlightItem) {
      setHighlightedItemId(highlightItem);
      // 5秒后清除高亮效果
      const timer = setTimeout(() => {
        setHighlightedItemId(null);
        // 清除URL参数
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('highlightItem');
        setSearchParams(newSearchParams);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [roomId, rooms, navigate, searchParams, setSearchParams]);

  const handleSaveRoom = () => {
    if (!room) return;
    
    const success = roomStorage.updateRoom(room.id, room);
    if (success) {
      const updatedRooms = rooms.map(r => r.id === room.id ? room : r);
      onRoomsUpdate(updatedRooms);
      navigate('/rooms');
    }
  };

  const handleAddFurniture = () => {
    if (!furnitureForm.name.trim()) return;

    const newFurniture = {
      ...DEFAULT_FURNITURE,
      id: uuidv4(),
      ...furnitureForm,
      name: furnitureForm.name.trim(),
      x: 50,
      y: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRoom = {
      ...room,
      furniture: [...(room.furniture || []), newFurniture],
      updatedAt: new Date().toISOString()
    };

    setRoom(updatedRoom);
    setShowAddFurnitureModal(false);
    setFurnitureForm({
      name: '',
      type: FURNITURE_TYPES.WARDROBE,
      color: '#8b7355'
    });
  };

  const handleDeleteFurniture = (furnitureId) => {
    const updatedRoom = {
      ...room,
      furniture: room.furniture.filter(f => f.id !== furnitureId),
      updatedAt: new Date().toISOString()
    };
    setRoom(updatedRoom);
    setSelectedFurniture(null);
  };

  const handleFurnitureClick = (e, furniture) => {
    // 如果是双击，展开/收起家具内物品
    if (e.detail === 2) {
      e.preventDefault();
      setExpandedFurniture(expandedFurniture?.id === furniture.id ? null : furniture);
      return;
    }
  };

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

  const handleMouseDown = (e, furniture) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 设置选中的家具状态
    setSelectedFurniture(furniture);
    
    const container = document.getElementById('room-canvas');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // 检查是否点击了调整大小手柄
    if (e.target.classList.contains('resize-handle')) {
      document.body.style.cursor = getComputedStyle(e.target).cursor;
      dragStateRef.current = {
        isDragging: false,
        isResizing: true,
        resizeHandle: e.target.dataset.handle,
        selectedFurniture: furniture,
        dragOffset: { x: 0, y: 0 }
      };
      
      setLiveFurnitureStyle({ 
        x: furniture.x, 
        y: furniture.y, 
        width: furniture.width, 
        height: furniture.height 
      });
      return;
    }

    // 考虑容器的 border (border-2 = 2px)
    const borderWidth = 2;
    const { clientX, clientY } = getEventCoordinates(e);
    const mouseX = clientX - containerRect.left - borderWidth;
    const mouseY = clientY - containerRect.top - borderWidth;

    // 更新 ref 状态
    dragStateRef.current = {
      isDragging: true,
      isResizing: false,
      selectedFurniture: furniture,
      resizeHandle: null,
      dragOffset: {
        x: mouseX - furniture.x,
        y: mouseY - furniture.y
      }
    };

    setLiveFurnitureStyle({ 
      x: furniture.x, 
      y: furniture.y, 
      width: furniture.width, 
      height: furniture.height 
    });
  };

  const handleMouseMove = useCallback((e) => {
    const { 
      isDragging, 
      isResizing, 
      isDraggingItem, 
      isResizingItem, 
      selectedFurniture, 
      selectedItem, 
      dragOffset, 
      resizeHandle 
    } = dragStateRef.current;
    
    if (!isDragging && !isResizing && !isDraggingItem && !isResizingItem) return;

    const container = document.getElementById('room-canvas');
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
    
    if (isDragging && selectedFurniture) {
      const furnitureWidth = liveFurnitureStyle?.width ?? selectedFurniture.width;
      const furnitureHeight = liveFurnitureStyle?.height ?? selectedFurniture.height;
      
      // 计算元素应该的位置（考虑拖拽偏移）
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;
      
      // 边界限制：确保元素完全在容器内容区域内，并且能够贴合边界
      newX = Math.max(0, Math.min(availableWidth - furnitureWidth, newX));
      newY = Math.max(0, Math.min(availableHeight - furnitureHeight, newY));

      setLiveFurnitureStyle(prev => ({ ...prev, x: newX, y: newY }));

    } else if (isResizing && selectedFurniture) {
      let { x, y, width, height } = { 
        x: selectedFurniture.x, 
        y: selectedFurniture.y, 
        width: selectedFurniture.width, 
        height: selectedFurniture.height 
      };

      switch (resizeHandle) {
        case 'se':
          width = Math.max(60, Math.min(availableWidth - selectedFurniture.x, mouseX - selectedFurniture.x));
          height = Math.max(40, Math.min(availableHeight - selectedFurniture.y, mouseY - selectedFurniture.y));
          break;
        case 'sw':
          width = Math.max(60, selectedFurniture.x + selectedFurniture.width - mouseX);
          height = Math.max(40, Math.min(availableHeight - selectedFurniture.y, mouseY - selectedFurniture.y));
          x = Math.max(0, mouseX);
          break;
        case 'ne':
          width = Math.max(60, Math.min(availableWidth - selectedFurniture.x, mouseX - selectedFurniture.x));
          height = Math.max(40, selectedFurniture.y + selectedFurniture.height - mouseY);
          y = Math.max(0, mouseY);
          break;
        case 'nw':
          width = Math.max(60, selectedFurniture.x + selectedFurniture.width - mouseX);
          height = Math.max(40, selectedFurniture.y + selectedFurniture.height - mouseY);
          x = Math.max(0, mouseX);
          y = Math.max(0, mouseY);
          break;
        default: break;
      }
      
      setLiveFurnitureStyle({ x, y, width, height });

    } else if (isDraggingItem && selectedItem) {
      const itemWidth = liveItemPosition?.width ?? selectedItem.width ?? 80;
      const itemHeight = liveItemPosition?.height ?? selectedItem.height ?? 60;
      
      // 计算元素应该的位置（考虑拖拽偏移）
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;
      
      // 边界限制：确保元素完全在容器内容区域内，并且能够贴合边界
      newX = Math.max(0, Math.min(availableWidth - itemWidth, newX));
      newY = Math.max(0, Math.min(availableHeight - itemHeight, newY));

      setLiveItemPosition(prev => ({ ...prev, x: newX, y: newY }));
      
    } else if (isResizingItem && selectedItem) {
      // 使用当前的liveItemPosition作为基准位置
      const currentX = liveItemPosition?.x ?? 0;
      const currentY = liveItemPosition?.y ?? 0;
      const currentWidth = liveItemPosition?.width ?? selectedItem.width ?? 80;
      const currentHeight = liveItemPosition?.height ?? selectedItem.height ?? 60;
      
      let { x, y, width, height } = { 
        x: currentX, 
        y: currentY, 
        width: currentWidth, 
        height: currentHeight 
      };

      switch (resizeHandle) {
        case 'se':
          width = Math.max(60, Math.min(availableWidth - currentX, mouseX - currentX));
          height = Math.max(40, Math.min(availableHeight - currentY, mouseY - currentY));
          break;
        case 'sw':
          width = Math.max(60, currentX + currentWidth - mouseX);
          height = Math.max(40, Math.min(availableHeight - currentY, mouseY - currentY));
          x = Math.max(0, mouseX);
          break;
        case 'ne':
          width = Math.max(60, Math.min(availableWidth - currentX, mouseX - currentX));
          height = Math.max(40, currentY + currentHeight - mouseY);
          y = Math.max(0, mouseY);
          break;
        case 'nw':
          width = Math.max(60, currentX + currentWidth - mouseX);
          height = Math.max(40, currentY + currentHeight - mouseY);
          x = Math.max(0, mouseX);
          y = Math.max(0, mouseY);
          break;
        default: break;
      }
      
      setLiveItemPosition({ x, y, width, height });
    }
  }, [liveFurnitureStyle, liveItemPosition]);

  const handleMouseUp = useCallback(() => {
    const { isDragging, isResizing, isDraggingItem, isResizingItem, selectedFurniture, selectedItem } = dragStateRef.current;
    
    document.body.style.cursor = 'default';
    
    if (isDragging || isResizing) {
      if (selectedFurniture && liveFurnitureStyle) {
        const { x, y, width, height } = liveFurnitureStyle;
        const updatedFurniture = { ...selectedFurniture, x, y, width, height, updatedAt: new Date().toISOString() };
        
        const updatedRoom = {
          ...room,
          furniture: room.furniture.map(f =>
            f.id === selectedFurniture.id ? updatedFurniture : f
          ),
          updatedAt: new Date().toISOString(),
        };
        setRoom(updatedRoom);
        setSelectedFurniture(updatedFurniture);
      }
    } else if ((isDraggingItem || isResizingItem) && selectedItem && liveItemPosition) {
      const itemUpdate = {
        x: liveItemPosition.x,
        y: liveItemPosition.y,
        ...(liveItemPosition.width && { width: liveItemPosition.width }),
        ...(liveItemPosition.height && { height: liveItemPosition.height })
      };
      
      const updatedItems = items.map(item =>
        item.id === selectedItem.id
          ? { ...item, ...itemUpdate }
          : item
      );
      onItemsUpdate(updatedItems);
      const updatedItem = updatedItems.find(i => i.id === selectedItem.id);
      if (updatedItem) {
        itemStorage.updateItem(updatedItem.id, updatedItem);
      }
    }

    // 重置拖拽状态
    dragStateRef.current = {
      isDragging: false,
      isResizing: false,
      isDraggingItem: false,
      isResizingItem: false,
      dragOffset: { x: 0, y: 0 },
      resizeHandle: null,
      selectedFurniture: null,
      selectedItem: null
    };
    
    setLiveFurnitureStyle(null);
    setLiveItemPosition(null);
  }, [room, liveFurnitureStyle, liveItemPosition, onItemsUpdate, items]);

  const handleItemMouseDown = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 设置选中的物品状态
    setSelectedItem(item);
    
    const container = document.getElementById('room-canvas');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // 计算物品的实际位置（与渲染逻辑保持一致）
    const independentItems = roomItems.filter(item => !item.furnitureId);
    const itemIndex = independentItems.findIndex(i => i.id === item.id);
    const actualX = item.x !== undefined ? item.x : 20 + (itemIndex % 8) * 45;
    const actualY = item.y !== undefined ? item.y : 20 + Math.floor(itemIndex / 8) * 45;
    const actualWidth = item.width || 80;
    const actualHeight = item.height || 60;
    
    // 检查是否点击了调整大小手柄
    if (e.target.classList.contains('item-resize-handle')) {
      document.body.style.cursor = getComputedStyle(e.target).cursor;
      dragStateRef.current = {
        isDragging: false,
        isResizing: false,
        isResizingItem: true,
        resizeHandle: e.target.dataset.handle,
        selectedItem: item,
        dragOffset: { x: 0, y: 0 }
      };
      
      setLiveItemPosition({ 
        x: actualX, 
        y: actualY, 
        width: actualWidth, 
        height: actualHeight 
      });
      return;
    }

    // 考虑容器的 border (border-2 = 2px)
    const borderWidth = 2;
    const { clientX, clientY } = getEventCoordinates(e);
    const mouseX = clientX - containerRect.left - borderWidth;
    const mouseY = clientY - containerRect.top - borderWidth;

    // 更新 ref 状态
    dragStateRef.current = {
      isDragging: false,
      isResizing: false,
      isResizingItem: false,
      isDraggingItem: true,
      selectedItem: item,
      resizeHandle: null,
      dragOffset: {
        x: mouseX - actualX,
        y: mouseY - actualY
      }
    };

    setLiveItemPosition({ 
      x: actualX, 
      y: actualY, 
      width: actualWidth, 
      height: actualHeight 
    });
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

  if (!room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rooms')}
            className="p-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">编辑房间: {room.name}</h1>
            <p className="text-neutral-600">拖拽家具调整位置，点击家具进行编辑</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddFurnitureModal(true)}
            className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-white/50 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>添加家具</span>
          </button>
          <button
            onClick={handleSaveRoom}
            className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>保存</span>
          </button>
        </div>
      </div>

      {/* 房间画布 */}
      <div className="glass-effect rounded-2xl p-6">
        <div
          id="room-canvas"
          className="relative w-full h-96 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 overflow-hidden touch-optimized"
          style={{ backgroundColor: `${room.color}10` }}
          onClick={(e) => {
            // 点击空白区域时清除选中状态
            if (e.target === e.currentTarget) {
              setSelectedFurniture(null);
              setSelectedItem(null);
            }
          }}
        >
          {room.furniture?.map((furniture) => {
            const furnitureItems = roomItems.filter(item => item.furnitureId === furniture.id);
            const isSelected = selectedFurniture?.id === furniture.id;
            const isInteracting = isSelected && (dragStateRef.current.isDragging || dragStateRef.current.isResizing);

            const style = {
              left: isInteracting ? liveFurnitureStyle.x : furniture.x,
              top: isInteracting ? liveFurnitureStyle.y : furniture.y,
              width: isInteracting ? liveFurnitureStyle.width : furniture.width,
              height: isInteracting ? liveFurnitureStyle.height : furniture.height,
              backgroundColor: furniture.color + '80'
            };
            
            return (
            <div key={furniture.id}>
              <div
                className={`absolute cursor-move rounded-lg border-2 draggable-element ${
                  isSelected
                    ? 'border-primary-500 shadow-floating z-10'
                    : 'border-neutral-300 hover:border-neutral-400'
                } ${isInteracting ? '' : 'transition-all duration-200'}`}
                style={style}
                                      onMouseDown={(e) => handleMouseDown(e, furniture)}
                      onTouchStart={(e) => handleMouseDown(e, furniture)}
                onClick={(e) => handleFurnitureClick(e, furniture)}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <div className="text-white text-sm font-medium truncate w-full">
                    {furniture.name}
                  </div>
                  <div className="text-white/80 text-xs">
                    {FURNITURE_TYPE_LABELS[furniture.type]}
                  </div>
                  {furnitureItems.length > 0 && (
                    <div className="text-white/90 text-xs mt-1 bg-black/20 px-2 py-1 rounded">
                      {furnitureItems.length} 个物品
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <>
                    <div className="resize-handle absolute -bottom-1 -right-1 bg-primary-500 border border-white cursor-se-resize" data-handle="se"></div>
                    <div className="resize-handle absolute -bottom-1 -left-1 bg-primary-500 border border-white cursor-sw-resize" data-handle="sw"></div>
                    <div className="resize-handle absolute -top-1 -right-1 bg-primary-500 border border-white cursor-ne-resize" data-handle="ne"></div>
                    <div className="resize-handle absolute -top-1 -left-1 bg-primary-500 border border-white cursor-nw-resize" data-handle="nw"></div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFurniture(furniture.id);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
              
              {expandedFurniture?.id === furniture.id && (
                <div className="absolute bg-white rounded-lg shadow-xl border border-neutral-200 p-3 z-20"
                     style={{
                       left: furniture.x + furniture.width + 10,
                       top: furniture.y,
                       minWidth: '200px',
                       maxHeight: '300px',
                       overflowY: 'auto'
                     }}>
                  <div className="text-sm font-semibold text-neutral-800 mb-2">
                    {furniture.name} 内的物品
                  </div>
                  {furnitureItems.length === 0 ? (
                    <div className="text-xs text-neutral-500">暂无物品</div>
                  ) : (
                    <div className="space-y-2">
                      {furnitureItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/items?highlightItem=${item.id}`)}
                          className={`w-full flex items-center space-x-2 p-2 rounded transition-all duration-300 hover:bg-primary-50 hover:border-primary-200 border ${
                            highlightedItemId === item.id 
                              ? 'bg-yellow-100 border-yellow-400 shadow-lg animate-pulse' 
                              : 'bg-neutral-50 border-transparent'
                          }`}
                          title="点击查看物品详情"
                        >
                          <Package className="w-4 h-4 text-primary-500" />
                          <div className="flex-1 text-left">
                            <div className="text-xs font-medium text-neutral-800">{item.name}</div>
                            <div className="text-xs text-neutral-500">数量: {item.quantity}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}

          {roomItems
            .filter(item => !item.furnitureId)
            .map((item, index) => {
              const isSelectedItem = selectedItem?.id === item.id;
              const isInteractingItem = isSelectedItem && (dragStateRef.current.isDraggingItem || dragStateRef.current.isResizingItem);

              let itemX, itemY, itemWidth, itemHeight;
              if (isInteractingItem && liveItemPosition) {
                itemX = liveItemPosition.x;
                itemY = liveItemPosition.y;
                itemWidth = liveItemPosition.width || item.width || 80;
                itemHeight = liveItemPosition.height || item.height || 60;
              } else {
                // 使用与 handleItemMouseDown 相同的位置计算逻辑
                itemX = item.x !== undefined ? item.x : 20 + (index % 8) * 45;
                itemY = item.y !== undefined ? item.y : 20 + Math.floor(index / 8) * 45;
                itemWidth = item.width || 80;
                itemHeight = item.height || 60;
              }
              
              return (
                <div
                  key={item.id}
                  className={`absolute bg-white rounded-lg shadow-lg border-2 cursor-move draggable-element ${
                    isSelectedItem ? 'border-primary-500 z-10' : 
                    highlightedItemId === item.id ? 'border-yellow-400 bg-yellow-100 shadow-xl animate-pulse z-20' :
                    'border-neutral-200 hover:border-primary-300'
                  } ${isInteractingItem ? '' : 'transition-all'}`}
                  style={{
                    left: itemX,
                    top: itemY,
                    width: itemWidth,
                    height: itemHeight,
                    minWidth: '60px',
                    minHeight: '40px'
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemMouseDown(e, item)}
                  onDoubleClick={() => navigate(`/items?highlightItem=${item.id}`)}
                  title="拖拽移动物品位置，双击跳转到物品管理查看详情"
                >
                  <div className="p-2 text-center h-full flex flex-col justify-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white mx-auto mb-1">
                      <Package className="w-4 h-4" />
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-neutral-800 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      数量: {item.quantity}
                    </div>
                  </div>
                  
                  {/* 物品调整大小手柄 */}
                  {isSelectedItem && (
                    <>
                      <div className="item-resize-handle absolute -bottom-1 -right-1 bg-primary-500 border border-white cursor-se-resize" data-handle="se"></div>
                      <div className="item-resize-handle absolute -bottom-1 -left-1 bg-primary-500 border border-white cursor-sw-resize" data-handle="sw"></div>
                      <div className="item-resize-handle absolute -top-1 -right-1 bg-primary-500 border border-white cursor-ne-resize" data-handle="ne"></div>
                      <div className="item-resize-handle absolute -top-1 -left-1 bg-primary-500 border border-white cursor-nw-resize" data-handle="nw"></div>
                    </>
                  )}
                </div>
              );
            })}
          
          {(!room.furniture || room.furniture.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Home className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600 mb-2">房间还没有家具</p>
                <button
                  onClick={() => setShowAddFurnitureModal(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  添加第一个家具
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Move className="w-4 h-4" />
              <span>拖拽移动</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border-2 border-primary-500"></div>
              <span>选中状态</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-500 rounded-full border-2 border-white"></div>
              <span>独立物品</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">双击家具查看内部物品</span>
            </div>
          </div>
          <div className="text-xs">
            房间尺寸: 600 × 384 px • {roomItems.length} 个物品
          </div>
        </div>
      </div>

      {/* 添加家具模态框 */}
      <Modal
        isOpen={showAddFurnitureModal}
        onClose={() => setShowAddFurnitureModal(false)}
        title="添加家具"
        icon={Plus}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              家具名称 *
            </label>
            <input
              type="text"
              value={furnitureForm.name}
              onChange={(e) => setFurnitureForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入家具名称"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              家具类型
            </label>
            <select
              value={furnitureForm.type}
              onChange={(e) => setFurnitureForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            >
              {Object.entries(FURNITURE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              颜色
            </label>
            <input
              type="color"
              value={furnitureForm.color}
              onChange={(e) => setFurnitureForm(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-12 rounded-xl border border-neutral-200 cursor-pointer"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddFurnitureModal(false)}
              className="px-6 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddFurniture}
              disabled={!furnitureForm.name.trim()}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加家具
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomEditor; 