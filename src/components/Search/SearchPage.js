import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Package, Clock, Tag } from 'lucide-react';
import { ITEM_CATEGORY_LABELS, ROOM_TYPE_LABELS } from '../../utils/constants';

const SearchPage = ({ rooms, items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // 搜索和过滤逻辑
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesRoom = selectedRoom === 'all' || item.roomId === selectedRoom;
      
      return matchesSearch && matchesCategory && matchesRoom;
    });

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchTerm, selectedCategory, selectedRoom, sortBy]);

  const getItemLocation = (item) => {
    const room = rooms.find(r => r.id === item.roomId);
    const furniture = room?.furniture?.find(f => f.id === item.furnitureId);
    const compartment = furniture?.compartments?.find(c => c.id === item.compartmentId);
    
    let location = room?.name || '未知位置';
    if (furniture) {
      location += ` - ${furniture.name}`;
      if (compartment) {
        location += ` - ${compartment.name}`;
      }
    }
    return location;
  };

  // 快速搜索建议
  const quickSearchTags = [
    '衣服', '电子产品', '文件', '化妆品', '药品', '工具', '书籍', '玩具'
  ];

  const handleQuickSearch = (tag) => {
    setSearchTerm(tag);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedRoom('all');
    setSortBy('name');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">智能搜索</h1>
        <p className="text-neutral-600 text-lg">快速找到您需要的物品</p>
      </div>

      {/* 搜索区域 */}
      <div className="glass-effect rounded-3xl p-6 md:p-8">
        {/* 主搜索框 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索物品名称、描述或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
          />
        </div>

        {/* 快速搜索标签 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-neutral-700 mb-3">快速搜索:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleQuickSearch(tag)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 过滤器 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              物品类别
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            >
              <option value="all">全部类别</option>
              {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              所在房间
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            >
              <option value="all">全部房间</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            >
              <option value="name">名称</option>
              <option value="category">类别</option>
              <option value="date">添加时间</option>
              <option value="quantity">数量</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>清除过滤</span>
            </button>
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            搜索结果 ({filteredItems.length})
          </h2>
          {searchTerm && (
            <p className="text-sm text-neutral-600">
              搜索 "<span className="font-medium">{searchTerm}</span>"
            </p>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              没有找到匹配的物品
            </h3>
            <p className="text-neutral-600 mb-4">
              尝试调整搜索条件或检查拼写
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              清除所有过滤条件
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">{item.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-neutral-600">
                        {ITEM_CATEGORY_LABELS[item.category]}
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-neutral-500">
                        <MapPin className="w-3 h-3" />
                        <span>{getItemLocation(item)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-neutral-800">数量: {item.quantity}</p>
                    {item.createdAt && (
                      <div className="flex items-center space-x-1 text-sm text-neutral-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 