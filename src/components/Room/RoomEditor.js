import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Move, Trash2, Home, ArrowLeft, Package } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { roomStorage } from '../../utils/storage';
import { FURNITURE_TYPES, FURNITURE_TYPE_LABELS, DEFAULT_FURNITURE } from '../../utils/constants';
import Modal from '../Common/Modal';

const RoomEditor = ({ rooms, onRoomsUpdate, items = [] }) => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedFurniture, setExpandedFurniture] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
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
  }, [roomId, rooms, navigate]);

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

  const handleMouseDown = (e, furniture) => {
    e.preventDefault();
    setSelectedFurniture(furniture);
    
    // 检查是否点击了调整大小的手柄
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(e.target.dataset.handle);
      return;
    }
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

    const handleMouseMove = (e) => {
    if (!selectedFurniture && !selectedItem) return;

    const container = document.getElementById('room-canvas');
    const containerRect = container.getBoundingClientRect();
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(
        containerRect.width - selectedFurniture.width,
        e.clientX - containerRect.left - dragOffset.x
      ));
      
      const newY = Math.max(0, Math.min(
        containerRect.height - selectedFurniture.height,
        e.clientY - containerRect.top - dragOffset.y
      ));

      const updatedRoom = {
        ...room,
        furniture: room.furniture.map(f =>
          f.id === selectedFurniture.id
            ? { ...f, x: newX, y: newY }
            : f
        )
      };
      
      setRoom(updatedRoom);
      setSelectedFurniture({ ...selectedFurniture, x: newX, y: newY });
    } else if (isResizing) {
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      let newWidth = selectedFurniture.width;
      let newHeight = selectedFurniture.height;
      let newX = selectedFurniture.x;
      let newY = selectedFurniture.y;
      
      switch (resizeHandle) {
        case 'se': // 右下角
          newWidth = Math.max(50, mouseX - selectedFurniture.x);
          newHeight = Math.max(30, mouseY - selectedFurniture.y);
          break;
        case 'sw': // 左下角
          newWidth = Math.max(50, selectedFurniture.x + selectedFurniture.width - mouseX);
          newHeight = Math.max(30, mouseY - selectedFurniture.y);
          newX = Math.min(selectedFurniture.x, mouseX);
          break;
        case 'ne': // 右上角
          newWidth = Math.max(50, mouseX - selectedFurniture.x);
          newHeight = Math.max(30, selectedFurniture.y + selectedFurniture.height - mouseY);
          newY = Math.min(selectedFurniture.y, mouseY);
          break;
        case 'nw': // 左上角
          newWidth = Math.max(50, selectedFurniture.x + selectedFurniture.width - mouseX);
          newHeight = Math.max(30, selectedFurniture.y + selectedFurniture.height - mouseY);
          newX = Math.min(selectedFurniture.x, mouseX);
          newY = Math.min(selectedFurniture.y, mouseY);
          break;
      }
      
      const updatedRoom = {
        ...room,
        furniture: room.furniture.map(f =>
          f.id === selectedFurniture.id
            ? { ...f, x: newX, y: newY, width: newWidth, height: newHeight }
            : f
        )
      };
      
      setRoom(updatedRoom);
      setSelectedFurniture({ ...selectedFurniture, x: newX, y: newY, width: newWidth, height: newHeight });
    } else if (isDraggingItem && selectedItem) {
      // 处理物品拖拽
      const newX = Math.max(0, Math.min(
        containerRect.width - 40, // 物品宽度
        e.clientX - containerRect.left - dragOffset.x
      ));
      
      const newY = Math.max(0, Math.min(
        containerRect.height - 40, // 物品高度
        e.clientY - containerRect.top - dragOffset.y
      ));

      // 更新物品位置（这里需要通过回调更新全局状态）
      // 暂时先更新本地状态，后面会添加全局更新
      setSelectedItem({ ...selectedItem, x: newX, y: newY });
    }
  };

  const handleItemMouseDown = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setIsDraggingItem(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingItem(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragOffset({ x: 0, y: 0 });
  };

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
          className="relative w-full h-96 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 overflow-hidden"
          style={{ backgroundColor: `${room.color}10` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 房间家具 */}
          {room.furniture?.map((furniture) => {
            // 获取这个家具中的物品
            const furnitureItems = roomItems.filter(item => item.furnitureId === furniture.id);
            
            return (
            <div key={furniture.id}>
              <div
                className={`absolute cursor-move rounded-lg border-2 transition-all duration-200 ${
                  selectedFurniture?.id === furniture.id
                    ? 'border-primary-500 shadow-floating z-10'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                style={{
                  left: furniture.x,
                  top: furniture.y,
                  width: furniture.width,
                  height: furniture.height,
                  backgroundColor: furniture.color + '80'
                }}
                onMouseDown={(e) => handleMouseDown(e, furniture)}
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
              
              {/* 调整大小手柄和删除按钮 */}
              {selectedFurniture?.id === furniture.id && (
                <>
                  {/* 调整大小手柄 */}
                  <div className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 border border-white cursor-se-resize" data-handle="se"></div>
                  <div className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 border border-white cursor-sw-resize" data-handle="sw"></div>
                  <div className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary-500 border border-white cursor-ne-resize" data-handle="ne"></div>
                  <div className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary-500 border border-white cursor-nw-resize" data-handle="nw"></div>
                  
                  {/* 删除按钮 */}
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
              
              {/* 展开的家具内物品 */}
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
                        <div key={item.id} className="flex items-center space-x-2 p-2 bg-neutral-50 rounded">
                          <Package className="w-4 h-4 text-primary-500" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-neutral-800">{item.name}</div>
                            <div className="text-xs text-neutral-500">数量: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })}

          {/* 独立物品（没有指定家具的物品） */}
          {roomItems
            .filter(item => !item.furnitureId)
            .map((item, index) => {
              const itemX = selectedItem?.id === item.id ? selectedItem.x : (item.x || 20 + (index % 8) * 45);
              const itemY = selectedItem?.id === item.id ? selectedItem.y : (item.y || 20 + Math.floor(index / 8) * 45);
              
              return (
                <div
                  key={item.id}
                  className={`absolute bg-white rounded-lg shadow-lg border-2 transition-all cursor-move ${
                    selectedItem?.id === item.id ? 'border-primary-500 z-10' : 'border-neutral-200 hover:border-primary-300'
                  }`}
                  style={{
                    left: itemX,
                    top: itemY,
                    minWidth: '80px',
                    maxWidth: '120px'
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                >
                  <div className="p-2 text-center">
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
                </div>
              );
            })}
          
          {/* 提示信息 */}
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