import React, { useState } from 'react';
import { Plus, Package, Filter, Search, Clock, TrendingDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { itemStorage } from '../../utils/storage';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, DEFAULT_ITEM, getDefaultReminderDays, getDefaultStockThreshold } from '../../utils/constants';
import { getReminderDaysByCategory, calculateExpiryDate } from '../../utils/expiryUtils';
import { isStockManagedCategory, getDefaultThreshold } from '../../utils/stockUtils';
import ItemCard from './ItemCard';
import Modal from '../Common/Modal';

const ItemManager = ({ rooms, items, onItemsUpdate, selectedRoom }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, expiry, stock
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
    tags: [],
    // 过期管理字段
    hasExpiryManagement: false, // 新增：是否启用过期管理
    purchaseDate: '',
    expiryDate: '',
    productionDate: '',
          shelfLifeDays: '',
    reminderEnabled: false,
    reminderDays: '',
    batchNumber: '',
    brand: '',
    model: '',
    // 库存管理字段
    hasStockManagement: false,
    minStock: '',
    maxStock: '',
    stockUnit: '个',
    stockLocation: '',
    supplier: '',
    averageUsage: ''
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

    // 处理过期管理数据
    const expiryData = formData.hasExpiryManagement ? {
      hasExpiryManagement: true,
      purchaseDate: formData.purchaseDate || null,
      expiryDate: formData.expiryDate || null,
      productionDate: formData.productionDate || null,
      shelfLifeDays: formData.shelfLifeDays ? parseInt(formData.shelfLifeDays) : null,
      reminderEnabled: formData.reminderEnabled || false,
      reminderDays: formData.reminderDays ? parseInt(formData.reminderDays) : getReminderDaysByCategory(formData.category),
      batchNumber: formData.batchNumber || '',
      brand: formData.brand || '',
      model: formData.model || '',
      isConsumed: false
    } : {
      hasExpiryManagement: false,
      purchaseDate: null,
      expiryDate: null,
      productionDate: null,
      shelfLifeDays: null,
      reminderEnabled: false,
      reminderDays: null,
      batchNumber: '',
      brand: '',
      model: '',
      isConsumed: false
    };

    // 处理库存管理数据
    const stockData = formData.hasStockManagement ? {
      hasStockManagement: true,
      minStock: formData.minStock ? parseInt(formData.minStock) : getDefaultThreshold(formData.category, 'lowStock'),
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
      stockUnit: formData.stockUnit || '个',
      stockLocation: formData.stockLocation || '',
      supplier: formData.supplier || '',
      averageUsage: formData.averageUsage ? parseFloat(formData.averageUsage) : null,
      lastPurchaseDate: new Date().toISOString(),
      stockNotes: ''
    } : {
      hasStockManagement: false,
      minStock: null,
      maxStock: null,
      stockUnit: '个',
      stockLocation: '',
      supplier: '',
      averageUsage: null,
      lastPurchaseDate: null,
      stockNotes: ''
    };

    const newItem = {
      ...DEFAULT_ITEM,
      id: uuidv4(),
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description || '',
      quantity: parseInt(formData.quantity) || 1,
      roomId: formData.roomId || '',
      furnitureId: formData.furnitureId || '',
      compartmentId: formData.compartmentId || '',
      tags: formData.tags || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsed: null,
      imageUrl: null,
      ...expiryData,
      ...stockData
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
      tags: [],
      // 过期管理字段
      hasExpiryManagement: false, // 新增：是否启用过期管理
      purchaseDate: '',
      expiryDate: '',
      productionDate: '',
      shelfLifeDays: '',
      reminderEnabled: false,
      reminderDays: '',
      batchNumber: '',
      brand: '',
      model: '',
      // 库存管理字段
      hasStockManagement: false,
      minStock: '',
      maxStock: '',
      stockUnit: '个',
      stockLocation: '',
      supplier: '',
      averageUsage: ''
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

  // 标签页配置
  const tabs = [
    { id: 'basic', label: '基本信息', icon: Package },
    { id: 'expiry', label: '过期管理', icon: Clock, disabled: !formData.hasExpiryManagement },
    { id: 'stock', label: '库存管理', icon: TrendingDown, disabled: !formData.hasStockManagement }
  ];

  // 标签页组件
  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={onClick}
      disabled={tab.disabled}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700 border border-primary-200'
          : tab.disabled
          ? 'text-neutral-400 cursor-not-allowed'
          : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
      }`}
    >
      <tab.icon className="w-4 h-4" />
      <span>{tab.label}</span>
    </button>
  );

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
        <div className="flex flex-col space-y-4">
          {/* 搜索框 - 独立一行，更突出 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索物品名称、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-enhanced w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>

          {/* 过滤器和统计 - 响应式网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 类别过滤 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">类别筛选</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select-enhanced w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              >
                <option value="all">全部类别</option>
                {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 房间过滤 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">房间筛选</label>
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="filter-select-enhanced w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              >
                <option value="all">全部房间</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>

            {/* 统计信息 */}
            <div className="stats-card flex items-center justify-center rounded-xl px-4 py-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">{filteredItems.length}</p>
                <p className="text-sm text-primary-700 font-medium">个物品</p>
              </div>
            </div>
          </div>

          {/* 快速筛选标签 */}
          {(searchTerm || selectedCategory !== 'all' || selectedRoomFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200">
              <span className="text-sm text-neutral-600 font-medium">当前筛选:</span>
              {searchTerm && (
                <span className="filter-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  搜索: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="filter-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  类别: {ITEM_CATEGORY_LABELS[selectedCategory]}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedRoomFilter !== 'all' && (
                <span className="filter-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  房间: {rooms.find(r => r.id === selectedRoomFilter)?.name}
                  <button
                    onClick={() => setSelectedRoomFilter('all')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedRoomFilter('all');
                }}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                清除所有筛选
              </button>
            </div>
          )}
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
        onClose={() => {
          setShowAddModal(false);
          setActiveTab('basic');
        }}
        title="添加新物品"
        icon={Plus}
        size="lg"
      >
        <div className="space-y-6">
          {/* 标签页导航 */}
          <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* 功能开关 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-800">过期管理</h4>
                <p className="text-xs text-neutral-600">启用过期日期管理和提醒功能</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasExpiryManagement}
                  onChange={(e) => {
                    handleInputChange('hasExpiryManagement', e.target.checked);
                    if (!e.target.checked && activeTab === 'expiry') {
                      setActiveTab('basic');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-800">库存管理</h4>
                <p className="text-xs text-neutral-600">启用库存不足提醒和管理功能</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasStockManagement}
                  onChange={(e) => {
                    handleInputChange('hasStockManagement', e.target.checked);
                    if (!e.target.checked && activeTab === 'stock') {
                      setActiveTab('basic');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* 标签页内容 */}
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
            {/* 基本信息标签页 */}
            {activeTab === 'basic' && (
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
              </div>
            )}

            {/* 过期管理标签页 */}
            {activeTab === 'expiry' && formData.hasExpiryManagement && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      品牌
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="请输入品牌名称"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      型号/规格
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="请输入型号或规格"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      购买日期
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      保质期（天）
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.shelfLifeDays}
                      onChange={(e) => handleInputChange('shelfLifeDays', parseInt(e.target.value) || '')}
                      placeholder="请输入保质期天数"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    到期日期
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    提醒天数（提前多少天提醒）
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.reminderDays}
                    onChange={(e) => handleInputChange('reminderDays', parseInt(e.target.value) || '')}
                    placeholder={`默认 ${getDefaultReminderDays(formData.category)} 天`}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 库存管理标签页 */}
            {activeTab === 'stock' && formData.hasStockManagement && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      最低库存阈值
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || '')}
                      placeholder={`默认 ${getDefaultStockThreshold(formData.category)} 个`}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      最高库存阈值
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || '')}
                      placeholder="可选"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      库存单位
                    </label>
                    <select
                      value={formData.stockUnit}
                      onChange={(e) => handleInputChange('stockUnit', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    >
                      <option value="个">个</option>
                      <option value="包">包</option>
                      <option value="盒">盒</option>
                      <option value="瓶">瓶</option>
                      <option value="袋">袋</option>
                      <option value="罐">罐</option>
                      <option value="支">支</option>
                      <option value="条">条</option>
                      <option value="块">块</option>
                      <option value="片">片</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      月平均用量
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.averageUsage}
                      onChange={(e) => handleInputChange('averageUsage', parseFloat(e.target.value) || '')}
                      placeholder="可选，用于预测"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    库存位置描述
                  </label>
                  <input
                    type="text"
                    value={formData.stockLocation}
                    onChange={(e) => handleInputChange('stockLocation', e.target.value)}
                    placeholder="详细的库存位置描述"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    供应商
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="供应商名称或购买渠道"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <button
              onClick={() => {
                setShowAddModal(false);
                setActiveTab('basic');
              }}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddItem}
              disabled={!formData.name}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-floating transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存物品
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemManager; 