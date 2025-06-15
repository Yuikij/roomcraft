import React, { useState } from 'react';
import { Plus, Package, Filter, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { itemStorage } from '../../utils/storage';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, DEFAULT_ITEM } from '../../utils/constants';
import ItemCard from './ItemCard';
import Modal from '../Common/Modal';

const ItemManager = ({ rooms, items, onItemsUpdate, selectedRoom }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: ITEM_CATEGORIES.OTHER,
    description: '',
    quantity: 1,
    roomId: selectedRoom?.id || '',
    furnitureId: '',
    compartmentId: '',
    tags: []
  });

  // 过滤物品
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRoom = selectedRoomFilter === 'all' || item.roomId === selectedRoomFilter;
    
    return matchesSearch && matchesCategory && matchesRoom;
  });

  const handleAddItem = () => {
    if (!formData.name.trim()) return;

    const newItem = {
      ...DEFAULT_ITEM,
      id: uuidv4(),
      ...formData,
      name: formData.name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = itemStorage.addItem(newItem);
    if (success) {
      onItemsUpdate([...items, newItem]);
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleUpdateItem = (itemId, updatedItem) => {
    const success = itemStorage.updateItem(itemId, updatedItem);
    if (success) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, ...updatedItem } : item
      );
      onItemsUpdate(updatedItems);
    }
  };

  const handleDeleteItem = (itemId) => {
    const success = itemStorage.deleteItem(itemId);
    if (success) {
      const updatedItems = items.filter(item => item.id !== itemId);
      onItemsUpdate(updatedItems);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: ITEM_CATEGORIES.OTHER,
      description: '',
      quantity: 1,
      roomId: selectedRoom?.id || '',
      furnitureId: '',
      compartmentId: '',
      tags: []
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const availableFurniture = formData.roomId 
    ? rooms.find(room => room.id === formData.roomId)?.furniture || []
    : [];

  const availableCompartments = formData.furnitureId
    ? availableFurniture.find(furniture => furniture.id === formData.furnitureId)?.compartments || []
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">物品管理</h1>
          <p className="text-neutral-600">记录和管理您的家居物品</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5" />
          <span>添加物品</span>
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索物品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            />
          </div>

          {/* 类别过滤 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
          >
            <option value="all">全部类别</option>
            {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* 房间过滤 */}
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
          >
            <option value="all">全部房间</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>

          {/* 统计信息 */}
          <div className="flex items-center justify-center bg-neutral-50 rounded-xl px-4 py-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800">{filteredItems.length}</p>
              <p className="text-sm text-neutral-600">个物品</p>
            </div>
          </div>
        </div>
      </div>

      {/* 物品列表 */}
      {filteredItems.length === 0 ? (
        <div className="glass-effect rounded-3xl p-12 text-center">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">
            {items.length === 0 ? '还没有物品记录' : '没有找到匹配的物品'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {items.length === 0 
              ? '开始记录您的第一个物品吧' 
              : '尝试调整搜索条件或添加新物品'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-primary text-white px-8 py-4 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>添加物品</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              rooms={rooms}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* 添加物品模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加新物品"
        icon={Plus}
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
                value={formData.name}
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
                value={formData.category}
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
                value={formData.roomId}
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
                value={formData.furnitureId}
                onChange={(e) => handleInputChange('furnitureId', e.target.value)}
                disabled={!formData.roomId}
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
                value={formData.compartmentId}
                onChange={(e) => handleInputChange('compartmentId', e.target.value)}
                disabled={!formData.furnitureId}
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
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              描述信息
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入物品描述（可选）"
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
              onClick={handleAddItem}
              disabled={!formData.name.trim()}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加物品
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemManager; 