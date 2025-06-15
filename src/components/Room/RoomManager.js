import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { roomStorage } from '../../utils/storage';
import { ROOM_TYPES, ROOM_TYPE_LABELS, ROOM_COLORS, DEFAULT_ROOM } from '../../utils/constants';
import RoomCard from './RoomCard';
import Modal from '../Common/Modal';

const RoomManager = ({ rooms, onRoomsUpdate, onRoomSelect = () => {} }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: ROOM_TYPES.BEDROOM,
    color: ROOM_COLORS[0],
    description: ''
  });

  const handleAddRoom = () => {
    if (!formData.name.trim()) return;

    const newRoom = {
      ...DEFAULT_ROOM,
      id: uuidv4(),
      ...formData,
      name: formData.name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = roomStorage.addRoom(newRoom);
    if (success) {
      onRoomsUpdate([...rooms, newRoom]);
      setShowAddModal(false);
      setFormData({
        name: '',
        type: ROOM_TYPES.BEDROOM,
        color: ROOM_COLORS[0],
        description: ''
      });
    }
  };

  const handleEditRoom = (room) => {
    navigate(`/room/${room.id}`);
  };

  const handleDeleteRoom = (roomId) => {
    const success = roomStorage.deleteRoom(roomId);
    if (success) {
      const updatedRooms = rooms.filter(room => room.id !== roomId);
      onRoomsUpdate(updatedRooms);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">房间管理</h1>
          <p className="text-neutral-600">创建和管理您的家居空间</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5" />
          <span>添加房间</span>
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="glass-effect rounded-3xl p-12 text-center">
          <MapPin className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">还没有房间</h3>
          <p className="text-neutral-600 mb-6">创建您的第一个房间来开始管理家居物品</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-primary text-white px-8 py-4 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>创建房间</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => handleEditRoom(room)}
              onDelete={() => handleDeleteRoom(room.id)}
              onClick={() => onRoomSelect(room)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加新房间"
        icon={Plus}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              房间名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入房间名称"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              房间类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            >
              {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              颜色主题
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ROOM_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleInputChange('color', color)}
                  className={`w-12 h-12 rounded-xl transition-all duration-200 ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-primary-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              描述信息
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入房间描述（可选）"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddRoom}
              disabled={!formData.name.trim()}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建房间
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomManager; 