import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  Filter, 
  Search,
  ArrowUpDown,
  ShoppingCart,
  Zap,
  Info,
  Clock,
  CheckCircle
} from 'lucide-react';
import { 
  getStockStatus, 
  getStockStatusInfo, 
  getLowStockItems, 
  getOutOfStockItems, 
  getZeroStockItems,
  getStockStatistics,
  formatStockStatusText,
  suggestRestockQuantity,
  calculateEstimatedRunoutDays,
  getStockTrend
} from '../../utils/stockUtils';
import { ITEM_CATEGORY_LABELS, STOCK_STATUS } from '../../utils/constants';

const StockManager = ({ items, onItemUpdate }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, low, out_of_stock, zero
  const [sortBy, setSortBy] = useState('status'); // status, name, quantity, category
  const [searchTerm, setSearchTerm] = useState('');

  // 库存统计
  const stockStats = useMemo(() => getStockStatistics(items), [items]);

  // 筛选和排序物品
  const filteredAndSortedItems = useMemo(() => {
    let filteredItems = items.filter(item => item.hasStockManagement);

    // 根据搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term)
      );
    }

    // 根据状态筛选
    switch (filter) {
      case 'low':
        filteredItems = getLowStockItems(filteredItems);
        break;
      case 'out_of_stock':
        filteredItems = getOutOfStockItems(filteredItems);
        break;
      case 'zero':
        filteredItems = getZeroStockItems(filteredItems);
        break;
      default:
        break;
    }

    // 排序
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          const statusA = getStockStatus(a);
          const statusB = getStockStatus(b);
          const statusOrder = [STOCK_STATUS.ZERO, STOCK_STATUS.OUT_OF_STOCK, STOCK_STATUS.LOW, STOCK_STATUS.SUFFICIENT];
          return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return (a.quantity || 0) - (b.quantity || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filteredItems;
  }, [items, filter, sortBy, searchTerm]);

  // 统计卡片组件
  const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
    <div 
      className={`glass-effect rounded-2xl p-6 card-hover ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl gradient-${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 mb-1">{value}</h3>
        <p className="text-neutral-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  // 物品卡片组件
  const ItemCard = ({ item }) => {
    const stockInfo = getStockStatusInfo(item);
    const suggestedQuantity = suggestRestockQuantity(item);
    const runoutDays = calculateEstimatedRunoutDays(item);
    const trend = getStockTrend(item);

    const handleRestock = () => {
      if (suggestedQuantity && suggestedQuantity > 0) {
        const newQuantity = (item.quantity || 0) + suggestedQuantity;
        onItemUpdate(item.id, { quantity: newQuantity });
      }
    };

    const handleMarkAsRestocked = () => {
      const restockQuantity = prompt(`请输入${item.name}的补货数量:`, suggestedQuantity || 1);
      if (restockQuantity && !isNaN(restockQuantity)) {
        const newQuantity = (item.quantity || 0) + parseInt(restockQuantity);
        onItemUpdate(item.id, { 
          quantity: newQuantity,
          lastPurchaseDate: new Date().toISOString()
        });
      }
    };

    return (
      <div className="glass-effect rounded-2xl p-6 card-hover">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">{item.name}</h3>
            <p className="text-sm text-neutral-600 mb-2">
              {ITEM_CATEGORY_LABELS[item.category]} {item.brand && `• ${item.brand}`}
            </p>
            <div className="flex items-center space-x-2">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: stockInfo.color }}
              >
                {stockInfo.label}
              </span>
              <span className="text-sm text-neutral-600">
                {item.quantity || 0} {item.stockUnit || '个'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500 mb-1">
              {item.minStock && `最低库存: ${item.minStock}`}
            </div>
            {runoutDays && (
              <div className={`text-xs ${runoutDays <= 7 ? 'text-red-600' : runoutDays <= 30 ? 'text-orange-600' : 'text-neutral-500'}`}>
                {trend.message}
              </div>
            )}
          </div>
        </div>

        {/* 库存趋势和建议 */}
        {(suggestedQuantity > 0 || runoutDays) && (
          <div className="bg-white/30 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-neutral-700">库存建议</span>
            </div>
            {suggestedQuantity > 0 && (
              <p className="text-sm text-neutral-600 mb-1">
                建议补货 {suggestedQuantity} {item.stockUnit || '个'}
              </p>
            )}
            {runoutDays && (
              <p className="text-sm text-neutral-600">
                按当前用量，{trend.message}
              </p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2">
          {stockInfo.status !== STOCK_STATUS.SUFFICIENT && (
            <button
              onClick={handleMarkAsRestocked}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>补货</span>
            </button>
          )}
          <button
            onClick={() => navigate(`/items?edit=${item.id}`)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-white/50 transition-colors flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>编辑</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-2">库存管理</h1>
          <p className="text-neutral-600">管理物品库存，及时补货提醒</p>
        </div>
        <button
          onClick={() => navigate('/items')}
          className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>添加物品</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={Package}
          title="管理中物品"
          value={stockStats.total}
          subtitle="启用库存管理的物品"
          color="primary"
        />
        <StatCard
          icon={CheckCircle}
          title="库存充足"
          value={stockStats.sufficient}
          subtitle="库存状态良好"
          color="success"
          onClick={() => setFilter('all')}
        />
        <StatCard
          icon={AlertTriangle}
          title="库存不足"
          value={stockStats.low}
          subtitle="需要关注补货"
          color="warning"
          onClick={() => setFilter('low')}
        />
        <StatCard
          icon={TrendingDown}
          title="缺货/零库存"
          value={stockStats.outOfStock + stockStats.zero}
          subtitle="急需补货"
          color="error"
          onClick={() => setFilter('out_of_stock')}
        />
      </div>

      {/* 筛选和搜索 */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* 搜索框 */}
          <div className="flex-1 lg:max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索物品名称、类别、品牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/50 backdrop-blur-sm text-neutral-800 placeholder-neutral-500 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* 筛选和排序 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-neutral-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/50 border-0 text-neutral-700 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="all">全部状态</option>
                <option value="low">库存不足</option>
                <option value="out_of_stock">缺货</option>
                <option value="zero">零库存</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-neutral-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/50 border-0 text-neutral-700 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="status">按状态排序</option>
                <option value="name">按名称排序</option>
                <option value="quantity">按数量排序</option>
                <option value="category">按类别排序</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 物品列表 */}
      <div className="space-y-4">
        {stockStats.total === 0 ? (
          <div className="glass-effect rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">暂无库存管理</h3>
            <p className="text-neutral-600 mb-6">还没有启用库存管理的物品</p>
            <button
              onClick={() => navigate('/items')}
              className="gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-floating transition-all duration-300"
            >
              去添加物品
            </button>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="glass-effect rounded-2xl p-12 text-center">
            <Search className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">没有找到物品</h3>
            <p className="text-neutral-600">尝试调整筛选条件或搜索关键词</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* 操作提示 */}
      {stockStats.needsAttention > 0 && (
        <div className="glass-effect rounded-2xl p-6 border-l-4 border-orange-500">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-neutral-800">需要关注</h3>
              <p className="text-neutral-600">
                有 {stockStats.needsAttention} 个物品需要补货，建议及时处理以免影响日常使用。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManager; 