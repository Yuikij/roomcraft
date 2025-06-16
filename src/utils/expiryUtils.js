import { 
  EXPIRY_STATUS, 
  REMINDER_DAYS, 
  EXPIRY_REQUIRED_CATEGORIES,
  ITEM_CATEGORIES 
} from './constants';

/**
 * 计算物品的过期状态
 * @param {Object} item - 物品对象
 * @returns {string} - 过期状态
 */
export const getExpiryStatus = (item) => {
  if (!item.hasExpiryManagement || !item.expiryDate) {
    return EXPIRY_STATUS.NO_EXPIRY;
  }

  const now = new Date();
  const expiryDate = new Date(item.expiryDate);
  const diffInDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return EXPIRY_STATUS.EXPIRED;
  }

  const reminderDays = item.reminderDays || getReminderDaysByCategory(item.category);
  
  if (diffInDays <= reminderDays) {
    return EXPIRY_STATUS.NEAR_EXPIRY;
  }

  return EXPIRY_STATUS.FRESH;
};

/**
 * 根据物品类别获取默认提醒天数
 * @param {string} category - 物品类别
 * @returns {number} - 提醒天数
 */
export const getReminderDaysByCategory = (category) => {
  switch (category) {
    case ITEM_CATEGORIES.FOOD:
      return REMINDER_DAYS.FOOD;
    case ITEM_CATEGORIES.MEDICINE:
      return REMINDER_DAYS.MEDICINE;
    case ITEM_CATEGORIES.COSMETICS:
      return REMINDER_DAYS.COSMETICS;
    default:
      return REMINDER_DAYS.DEFAULT;
  }
};

/**
 * 检查物品是否需要过期管理
 * @param {string} category - 物品类别
 * @returns {boolean} - 是否需要过期管理
 */
export const isExpiryRequired = (category) => {
  return EXPIRY_REQUIRED_CATEGORIES.includes(category);
};

/**
 * 计算过期日期（基于购买日期和保质期）
 * @param {string} purchaseDate - 购买日期
 * @param {number} shelfLife - 保质期（天数）
 * @returns {string|null} - 过期日期
 */
export const calculateExpiryDate = (purchaseDate, shelfLife) => {
  if (!purchaseDate || !shelfLife) {
    return null;
  }

  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase);
  expiry.setDate(expiry.getDate() + shelfLife);
  
  return expiry.toISOString().split('T')[0];
};

/**
 * 计算保质期天数（基于生产日期和过期日期）
 * @param {string} productionDate - 生产日期
 * @param {string} expiryDate - 过期日期
 * @returns {number|null} - 保质期天数
 */
export const calculateShelfLife = (productionDate, expiryDate) => {
  if (!productionDate || !expiryDate) {
    return null;
  }

  const production = new Date(productionDate);
  const expiry = new Date(expiryDate);
  const diffInMs = expiry - production;
  
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * 获取即将过期的物品列表
 * @param {Array} items - 物品数组
 * @returns {Array} - 即将过期的物品
 */
export const getNearExpiryItems = (items) => {
  return items.filter(item => {
    const status = getExpiryStatus(item);
    return status === EXPIRY_STATUS.NEAR_EXPIRY;
  });
};

/**
 * 获取已过期的物品列表
 * @param {Array} items - 物品数组
 * @returns {Array} - 已过期的物品
 */
export const getExpiredItems = (items) => {
  return items.filter(item => {
    const status = getExpiryStatus(item);
    return status === EXPIRY_STATUS.EXPIRED;
  });
};

/**
 * 格式化剩余天数显示
 * @param {Object} item - 物品对象
 * @returns {string} - 格式化的剩余时间
 */
export const formatRemainingDays = (item) => {
  if (!item.hasExpiryManagement || !item.expiryDate) {
    return '无保质期';
  }

  const now = new Date();
  const expiryDate = new Date(item.expiryDate);
  const diffInDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `已过期 ${Math.abs(diffInDays)} 天`;
  } else if (diffInDays === 0) {
    return '今天到期';
  } else if (diffInDays === 1) {
    return '明天到期';
  } else {
    return `还有 ${diffInDays} 天到期`;
  }
};

/**
 * 生成过期提醒通知
 * @param {Array} items - 物品数组
 * @returns {Array} - 提醒通知数组
 */
export const generateExpiryNotifications = (items) => {
  const notifications = [];
  
  items.forEach(item => {
    if (!item.hasExpiryManagement || !item.reminderEnabled || !item.expiryDate) {
      return;
    }

    const status = getExpiryStatus(item);
    
    if (status === EXPIRY_STATUS.EXPIRED) {
      notifications.push({
        id: item.id,
        type: 'expired',
        title: '物品已过期',
        message: `${item.name} 已过期，建议及时处理`,
        item: item,
        priority: 'high'
      });
    } else if (status === EXPIRY_STATUS.NEAR_EXPIRY) {
      notifications.push({
        id: item.id,
        type: 'near_expiry',
        title: '物品即将过期',
        message: `${item.name} ${formatRemainingDays(item)}`,
        item: item,
        priority: 'medium'
      });
    }
  });

  // 按优先级排序
  return notifications.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * 检查是否应该显示过期提醒
 * @param {Object} item - 物品对象
 * @returns {boolean} - 是否显示提醒
 */
export const shouldShowExpiryReminder = (item) => {
  if (!item.hasExpiryManagement || !item.reminderEnabled || !item.expiryDate) {
    return false;
  }

  const status = getExpiryStatus(item);
  return status === EXPIRY_STATUS.NEAR_EXPIRY || status === EXPIRY_STATUS.EXPIRED;
}; 