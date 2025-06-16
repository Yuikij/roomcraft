import { 
  STOCK_STATUS, 
  STOCK_STATUS_LABELS, 
  STOCK_COLORS,
  DEFAULT_STOCK_THRESHOLDS,
  STOCK_MANAGED_CATEGORIES 
} from './constants';

/**
 * 获取库存状态
 * @param {Object} item - 物品对象
 * @returns {string} 库存状态
 */
export const getStockStatus = (item) => {
  if (!item || !item.hasStockManagement) {
    return STOCK_STATUS.SUFFICIENT;
  }

  const quantity = item.quantity || 0;
  const minStock = item.minStock || getDefaultThreshold(item.category, 'lowStock');
  const outOfStockThreshold = getDefaultThreshold(item.category, 'outOfStock');

  if (quantity === 0) {
    return STOCK_STATUS.ZERO;
  } else if (quantity <= outOfStockThreshold) {
    return STOCK_STATUS.OUT_OF_STOCK;
  } else if (quantity <= minStock) {
    return STOCK_STATUS.LOW;
  } else {
    return STOCK_STATUS.SUFFICIENT;
  }
};

/**
 * 获取默认库存阈值
 * @param {string} category - 物品类别
 * @param {string} type - 阈值类型 ('lowStock' 或 'outOfStock')
 * @returns {number} 阈值
 */
export const getDefaultThreshold = (category, type) => {
  const thresholds = DEFAULT_STOCK_THRESHOLDS[category] || DEFAULT_STOCK_THRESHOLDS.DEFAULT;
  return thresholds[type];
};

/**
 * 检查是否需要库存管理
 * @param {string} category - 物品类别
 * @returns {boolean} 是否需要库存管理
 */
export const isStockManagedCategory = (category) => {
  return STOCK_MANAGED_CATEGORIES.includes(category);
};

/**
 * 获取库存不足的物品
 * @param {Array} items - 物品数组
 * @returns {Array} 库存不足的物品
 */
export const getLowStockItems = (items) => {
  return items.filter(item => {
    if (!item.hasStockManagement) return false;
    const status = getStockStatus(item);
    return status === STOCK_STATUS.LOW || status === STOCK_STATUS.OUT_OF_STOCK;
  });
};

/**
 * 获取缺货物品
 * @param {Array} items - 物品数组
 * @returns {Array} 缺货物品
 */
export const getOutOfStockItems = (items) => {
  return items.filter(item => {
    if (!item.hasStockManagement) return false;
    const status = getStockStatus(item);
    return status === STOCK_STATUS.OUT_OF_STOCK || status === STOCK_STATUS.ZERO;
  });
};

/**
 * 获取零库存物品
 * @param {Array} items - 物品数组
 * @returns {Array} 零库存物品
 */
export const getZeroStockItems = (items) => {
  return items.filter(item => {
    if (!item.hasStockManagement) return false;
    return getStockStatus(item) === STOCK_STATUS.ZERO;
  });
};

/**
 * 获取库存状态显示信息
 * @param {Object} item - 物品对象
 * @returns {Object} 包含状态、标签、颜色的对象
 */
export const getStockStatusInfo = (item) => {
  const status = getStockStatus(item);
  return {
    status,
    label: STOCK_STATUS_LABELS[status],
    color: STOCK_COLORS[status]
  };
};

/**
 * 计算预计消耗完时间
 * @param {Object} item - 物品对象
 * @returns {number|null} 预计天数，null表示无法计算
 */
export const calculateEstimatedRunoutDays = (item) => {
  if (!item.hasStockManagement || !item.averageUsage || item.averageUsage <= 0) {
    return null;
  }

  const currentStock = item.quantity || 0;
  const monthlyUsage = item.averageUsage;
  const dailyUsage = monthlyUsage / 30;

  if (dailyUsage <= 0) return null;

  return Math.ceil(currentStock / dailyUsage);
};

/**
 * 格式化库存状态文本
 * @param {Object} item - 物品对象
 * @returns {string} 格式化的状态文本
 */
export const formatStockStatusText = (item) => {
  if (!item.hasStockManagement) {
    return '未启用库存管理';
  }

  const status = getStockStatus(item);
  const quantity = item.quantity || 0;
  const unit = item.stockUnit || '个';
  
  switch (status) {
    case STOCK_STATUS.ZERO:
      return `零库存 (0${unit})`;
    case STOCK_STATUS.OUT_OF_STOCK:
      return `缺货 (${quantity}${unit})`;
    case STOCK_STATUS.LOW:
      return `库存不足 (${quantity}${unit})`;
    case STOCK_STATUS.SUFFICIENT:
      return `库存充足 (${quantity}${unit})`;
    default:
      return `${quantity}${unit}`;
  }
};

/**
 * 生成库存提醒通知
 * @param {Array} items - 物品数组
 * @returns {Array} 通知对象数组
 */
export const generateStockNotifications = (items) => {
  const notifications = [];

  // 零库存提醒
  const zeroStockItems = getZeroStockItems(items);
  if (zeroStockItems.length > 0) {
    notifications.push({
      id: 'zero-stock',
      type: 'error',
      priority: 'high',
      title: '零库存提醒',
      message: `${zeroStockItems.length} 个物品已无库存`,
      items: zeroStockItems,
      action: '立即补货',
      route: '/stock'
    });
  }

  // 缺货提醒
  const outOfStockItems = getOutOfStockItems(items).filter(item => 
    !zeroStockItems.includes(item)
  );
  if (outOfStockItems.length > 0) {
    notifications.push({
      id: 'out-of-stock',
      type: 'warning',
      priority: 'high',
      title: '缺货提醒',
      message: `${outOfStockItems.length} 个物品库存严重不足`,
      items: outOfStockItems,
      action: '查看详情',
      route: '/stock'
    });
  }

  // 库存不足提醒
  const lowStockItems = getLowStockItems(items).filter(item => 
    !zeroStockItems.includes(item) && !outOfStockItems.includes(item)
  );
  if (lowStockItems.length > 0) {
    notifications.push({
      id: 'low-stock',
      type: 'warning',
      priority: 'medium',
      title: '库存不足提醒',
      message: `${lowStockItems.length} 个物品库存偏低`,
      items: lowStockItems,
      action: '查看详情',
      route: '/stock'
    });
  }

  return notifications;
};

/**
 * 获取库存统计信息
 * @param {Array} items - 物品数组
 * @returns {Object} 统计信息
 */
export const getStockStatistics = (items) => {
  const managedItems = items.filter(item => item.hasStockManagement);
  const total = managedItems.length;
  const sufficient = managedItems.filter(item => getStockStatus(item) === STOCK_STATUS.SUFFICIENT).length;
  const low = managedItems.filter(item => getStockStatus(item) === STOCK_STATUS.LOW).length;
  const outOfStock = managedItems.filter(item => getStockStatus(item) === STOCK_STATUS.OUT_OF_STOCK).length;
  const zero = managedItems.filter(item => getStockStatus(item) === STOCK_STATUS.ZERO).length;

  return {
    total,
    sufficient,
    low,
    outOfStock,
    zero,
    needsAttention: low + outOfStock + zero
  };
};

/**
 * 建议补货数量
 * @param {Object} item - 物品对象
 * @returns {number|null} 建议补货数量
 */
export const suggestRestockQuantity = (item) => {
  if (!item.hasStockManagement) return null;

  const currentStock = item.quantity || 0;
  const maxStock = item.maxStock;
  const minStock = item.minStock || getDefaultThreshold(item.category, 'lowStock');

  // 如果设置了最大库存，补货到最大库存
  if (maxStock && maxStock > currentStock) {
    return maxStock - currentStock;
  }

  // 否则补货到最小库存的2倍
  const targetStock = minStock * 2;
  return Math.max(0, targetStock - currentStock);
};

/**
 * 获取库存趋势分析
 * @param {Object} item - 物品对象
 * @returns {Object} 趋势分析结果
 */
export const getStockTrend = (item) => {
  if (!item.hasStockManagement || !item.averageUsage) {
    return { trend: 'unknown', message: '数据不足' };
  }

  const runoutDays = calculateEstimatedRunoutDays(item);
  
  if (!runoutDays) {
    return { trend: 'stable', message: '库存稳定' };
  }

  if (runoutDays <= 7) {
    return { trend: 'critical', message: `预计${runoutDays}天内用完` };
  } else if (runoutDays <= 30) {
    return { trend: 'declining', message: `预计${runoutDays}天内用完` };
  } else {
    return { trend: 'stable', message: `预计${runoutDays}天内用完` };
  }
}; 