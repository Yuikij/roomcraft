import React, { useState } from 'react';
import { Edit, Trash2, MapPin, Package, Calendar, Plus, Clock, AlertTriangle, TrendingDown } from 'lucide-react';
import { ITEM_CATEGORY_LABELS, EXPIRY_STATUS, EXPIRY_STATUS_LABELS, EXPIRY_COLORS, getDefaultReminderDays, getDefaultStockThreshold } from '../../utils/constants';
import { getExpiryStatus, formatRemainingDays, getReminderDaysByCategory, calculateExpiryDate } from '../../utils/expiryUtils';
import { getStockStatusInfo, formatStockStatusText, getDefaultThreshold } from '../../utils/stockUtils';
import Modal from '../Common/Modal';

const ItemCard = ({ item, rooms, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, expiry, stock
  const [editForm, setEditForm] = useState({
    name: item.name,
    category: item.category,
    description: item.description || '',
    quantity: item.quantity,
    roomId: item.roomId || '',
    furnitureId: item.furnitureId || '',
    compartmentId: item.compartmentId || '',
    // 过期管理字段
    hasExpiryManagement: item.hasExpiryManagement || false,
    purchaseDate: item.purchaseDate || '',
    expiryDate: item.expiryDate || '',
    productionDate: item.productionDate || '',
    shelfLifeDays: item.shelfLifeDays || '',
    reminderEnabled: item.reminderEnabled || false,
    reminderDays: item.reminderDays || '',
    batchNumber: item.batchNumber || '',
    brand: item.brand || '',
    model: item.model || '',
    // 库存管理字段
    hasStockManagement: item.hasStockManagement || false,
    minStock: item.minStock || '',
    maxStock: item.maxStock || '',
    stockUnit: item.stockUnit || '个',
    stockLocation: item.stockLocation || '',
    supplier: item.supplier || '',
    averageUsage: item.averageUsage || ''
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
      compartmentId: item.compartmentId || '',
      // 过期管理字段
      hasExpiryManagement: item.hasExpiryManagement || false,
      purchaseDate: item.purchaseDate || '',
      expiryDate: item.expiryDate || '',
      productionDate: item.productionDate || '',
      shelfLifeDays: item.shelfLifeDays || '',
      reminderEnabled: item.reminderEnabled || false,
      reminderDays: item.reminderDays || '',
      batchNumber: item.batchNumber || '',
      brand: item.brand || '',
      model: item.model || '',
      // 库存管理字段
      hasStockManagement: item.hasStockManagement || false,
      minStock: item.minStock || '',
      maxStock: item.maxStock || '',
      stockUnit: item.stockUnit || '个',
      stockLocation: item.stockLocation || '',
      supplier: item.supplier || '',
      averageUsage: item.averageUsage || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) return;

    // 处理过期管理数据
    const expiryData = editForm.hasExpiryManagement ? {
      hasExpiryManagement: true,
      purchaseDate: editForm.purchaseDate || null,
      expiryDate: editForm.expiryDate || null,
      productionDate: editForm.productionDate || null,
      shelfLifeDays: editForm.shelfLifeDays ? parseInt(editForm.shelfLifeDays) : null,
      reminderEnabled: editForm.reminderEnabled || false,
      reminderDays: editForm.reminderDays ? parseInt(editForm.reminderDays) : getReminderDaysByCategory(editForm.category),
      batchNumber: editForm.batchNumber || '',
      brand: editForm.brand || '',
      model: editForm.model || ''
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
      model: ''
    };

    // 处理库存管理数据
    const stockData = editForm.hasStockManagement ? {
      hasStockManagement: true,
      minStock: editForm.minStock ? parseInt(editForm.minStock) : getDefaultThreshold(editForm.category, 'lowStock'),
      maxStock: editForm.maxStock ? parseInt(editForm.maxStock) : null,
      stockUnit: editForm.stockUnit || '个',
      stockLocation: editForm.stockLocation || '',
      supplier: editForm.supplier || '',
      averageUsage: editForm.averageUsage ? parseFloat(editForm.averageUsage) : null,
      lastPurchaseDate: item.lastPurchaseDate || null,
      stockNotes: item.stockNotes || ''
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

    const updatedItem = {
      name: editForm.name.trim(),
      category: editForm.category,
      description: editForm.description || '',
      quantity: parseInt(editForm.quantity) || 1,
      roomId: editForm.roomId || '',
      furnitureId: editForm.furnitureId || '',
      compartmentId: editForm.compartmentId || '',
      tags: item.tags || [],
      status: item.status || 'active',
      updatedAt: new Date().toISOString(),
      ...expiryData,
      ...stockData
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

  // 标签页配置
  const tabs = [
    { id: 'basic', label: '基本信息', icon: Package },
    { id: 'expiry', label: '过期管理', icon: Clock, disabled: !editForm.hasExpiryManagement },
    { id: 'stock', label: '库存管理', icon: TrendingDown, disabled: !editForm.hasStockManagement }
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

          {/* 数量、库存状态和过期状态 */}
          <div className="mb-4 flex items-center space-x-2 flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              数量: {item.quantity} {item.stockUnit || '个'}
            </span>
            
            {/* 库存状态标签 */}
            {item.hasStockManagement && (
              (() => {
                const stockInfo = getStockStatusInfo(item);
                return (
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: stockInfo.color }}
                  >
                    {stockInfo.status !== 'sufficient' && (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {stockInfo.label}
                  </span>
                );
              })()
            )}
            
            {/* 过期状态标签 */}
            {item.hasExpiryManagement && item.expiryDate && (
              (() => {
                const expiryStatus = getExpiryStatus(item);
                const statusColor = EXPIRY_COLORS[expiryStatus];
                const isExpired = expiryStatus === EXPIRY_STATUS.EXPIRED;
                const isNearExpiry = expiryStatus === EXPIRY_STATUS.NEAR_EXPIRY;
                
                return (
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: statusColor + '20', 
                      color: statusColor 
                    }}
                  >
                    {(isExpired || isNearExpiry) && (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {EXPIRY_STATUS_LABELS[expiryStatus]}
                  </span>
                );
              })()
            )}
            
            {item.isConsumed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                已消耗
              </span>
            )}
          </div>

          {/* 描述 */}
          {item.description && (
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* 过期信息 */}
          {item.hasExpiryManagement && item.expiryDate && (
            <div className="mb-4 p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-600">
                  {formatRemainingDays(item)}
                </span>
              </div>
              {item.brand && (
                <div className="text-xs text-neutral-500 mt-1">
                  品牌: {item.brand}
                </div>
              )}
            </div>
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
        onClose={() => {
          setShowEditModal(false);
          setActiveTab('basic');
        }}
        title="编辑物品"
        icon={Edit}
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
                  checked={editForm.hasExpiryManagement}
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
                  checked={editForm.hasStockManagement}
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
              </div>
            )}

            {/* 过期管理标签页 */}
            {activeTab === 'expiry' && editForm.hasExpiryManagement && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      品牌
                    </label>
                    <input
                      type="text"
                      value={editForm.brand}
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
                      value={editForm.model}
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
                      value={editForm.purchaseDate}
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
                      value={editForm.shelfLifeDays}
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
                    value={editForm.expiryDate}
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
                    value={editForm.reminderDays}
                    onChange={(e) => handleInputChange('reminderDays', parseInt(e.target.value) || '')}
                    placeholder={`默认 ${getDefaultReminderDays(editForm.category)} 天`}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 库存管理标签页 */}
            {activeTab === 'stock' && editForm.hasStockManagement && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      最低库存阈值
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.minStock}
                      onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || '')}
                      placeholder={`默认 ${getDefaultStockThreshold(editForm.category)} 个`}
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
                      value={editForm.maxStock}
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
                      value={editForm.stockUnit}
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
                      value={editForm.averageUsage}
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
                    value={editForm.stockLocation}
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
                    value={editForm.supplier}
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
                setShowEditModal(false);
                setActiveTab('basic');
              }}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editForm.name}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-floating transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存更改
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
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            确定要删除这个物品吗？
          </h3>
          <p className="text-neutral-600 mb-6">
            删除后将无法恢复，请谨慎操作。
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              确定删除
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ItemCard; 