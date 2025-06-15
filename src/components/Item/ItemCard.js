import React, { useState } from 'react';
import { Edit, Trash2, MapPin, Package, Calendar, Plus } from 'lucide-react';
import { ITEM_CATEGORY_LABELS } from '../../utils/constants';
import Modal from '../Common/Modal';

const ItemCard = ({ item, rooms, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: item.name,
    category: item.category,
    description: item.description || '',
    quantity: item.quantity,
    roomId: item.roomId || '',
    furnitureId: item.furnitureId || '',
    compartmentId: item.compartmentId || ''
  });

  const room = rooms.find(r => r.id === item.roomId);
  const furniture = room?.furniture?.find(f => f.id === item.furnitureId);
  const compartment = furniture?.compartments?.find(c => c.id === item.compartmentId);

  const getLocationText = () => {
    let location = room?.name || '未知位置';
    if (furniture) {
      location += ` - ${furniture.name}`;
      if (compartment) {
        location += ` - ${compartment.name}`;
      }
    }
    return location;
  };

  const handleEdit = () => {
    setEditForm({
      name: item.name,
      category: item.category,
      description: item.description || '',
      quantity: item.quantity,
      roomId: item.roomId || '',
      furnitureId: item.furnitureId || '',
      compartmentId: item.compartmentId || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) return;

    const updatedItem = {
      ...editForm,
      name: editForm.name.trim(),
      updatedAt: new Date().toISOString()
    };

    onUpdate(item.id, updatedItem);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setShowDeleteModal(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const availableFurniture = editForm.roomId 
    ? rooms.find(room => room.id === editForm.roomId)?.furniture || []
    : [];

  const availableCompartments = editForm.furnitureId
    ? availableFurniture.find(furniture => furniture.id === editForm.furnitureId)?.compartments || []
    : [];

  return (
    <>
      <div className="glass-effect rounded-2xl p-6 card-hover group relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary-500/10 rounded-full" />
        
        {/* 物品信息 */}
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-neutral-500">
                  {ITEM_CATEGORY_LABELS[item.category]}
                </p>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg hover:bg-white/80 transition-colors"
                title="编辑物品"
              >
                <Edit className="w-4 h-4 text-neutral-600" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="删除物品"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* 位置信息 */}
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">{getLocationText()}</span>
          </div>

          {/* 数量 */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              数量: {item.quantity}
            </span>
          </div>

          {/* 描述 */}
          {item.description && (
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-neutral-500">
              <Calendar className="w-4 h-4" />
              <span>
                {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            {item.lastUsed && (
              <span className="text-xs text-neutral-400">
                最近使用: {new Date(item.lastUsed).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 编辑模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑物品"
        icon={Edit}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                物品名称 *
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入物品名称"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                物品类别
              </label>
              <select
                value={editForm.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              >
                {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                所在房间
              </label>
              <select
                value={editForm.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              >
                <option value="">请选择房间</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                所在家具
              </label>
              <select
                value={editForm.furnitureId}
                onChange={(e) => handleInputChange('furnitureId', e.target.value)}
                disabled={!editForm.roomId}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors disabled:opacity-50"
              >
                <option value="">请选择家具</option>
                {availableFurniture.map(furniture => (
                  <option key={furniture.id} value={furniture.id}>{furniture.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                具体位置
              </label>
              <select
                value={editForm.compartmentId}
                onChange={(e) => handleInputChange('compartmentId', e.target.value)}
                disabled={!editForm.furnitureId}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors disabled:opacity-50"
              >
                <option value="">请选择位置</option>
                {availableCompartments.map(compartment => (
                  <option key={compartment.id} value={compartment.id}>{compartment.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              数量
            </label>
            <input
              type="number"
              min="1"
              value={editForm.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              描述信息
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入物品描述（可选）"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editForm.name.trim()}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除物品"
        icon={Trash2}
        type="danger"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            确定要删除物品 "<span className="font-medium">{item.name}</span>" 吗？
            此操作无法恢复。
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ItemCard; 