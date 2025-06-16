// 房间类型
export const ROOM_TYPES = {
  BEDROOM: 'bedroom',
  LIVING_ROOM: 'living_room',
  KITCHEN: 'kitchen',
  BATHROOM: 'bathroom',
  STUDY: 'study',
  DINING_ROOM: 'dining_room',
  BALCONY: 'balcony',
  STORAGE: 'storage',
  OTHER: 'other'
};

// 房间类型显示名称
export const ROOM_TYPE_LABELS = {
  [ROOM_TYPES.BEDROOM]: '卧室',
  [ROOM_TYPES.LIVING_ROOM]: '客厅',
  [ROOM_TYPES.KITCHEN]: '厨房',
  [ROOM_TYPES.BATHROOM]: '卫生间',
  [ROOM_TYPES.STUDY]: '书房',
  [ROOM_TYPES.DINING_ROOM]: '餐厅',
  [ROOM_TYPES.BALCONY]: '阳台',
  [ROOM_TYPES.STORAGE]: '储物间',
  [ROOM_TYPES.OTHER]: '其他'
};

// 家具类型
export const FURNITURE_TYPES = {
  WARDROBE: 'wardrobe',
  DESK: 'desk',
  BED: 'bed',
  SHELF: 'shelf',
  CABINET: 'cabinet',
  DRAWER: 'drawer',
  BOOKCASE: 'bookcase',
  SOFA: 'sofa',
  TABLE: 'table',
  CHAIR: 'chair',
  OTHER: 'other'
};

// 家具类型显示名称
export const FURNITURE_TYPE_LABELS = {
  [FURNITURE_TYPES.WARDROBE]: '衣柜',
  [FURNITURE_TYPES.DESK]: '书桌',
  [FURNITURE_TYPES.BED]: '床',
  [FURNITURE_TYPES.SHELF]: '架子',
  [FURNITURE_TYPES.CABINET]: '橱柜',
  [FURNITURE_TYPES.DRAWER]: '抽屉',
  [FURNITURE_TYPES.BOOKCASE]: '书柜',
  [FURNITURE_TYPES.SOFA]: '沙发',
  [FURNITURE_TYPES.TABLE]: '桌子',
  [FURNITURE_TYPES.CHAIR]: '椅子',
  [FURNITURE_TYPES.OTHER]: '其他'
};

// 物品类别
export const ITEM_CATEGORIES = {
  CLOTHING: 'clothing',
  BOOKS: 'books',
  ELECTRONICS: 'electronics',
  DOCUMENTS: 'documents',
  KITCHENWARE: 'kitchenware',
  COSMETICS: 'cosmetics',
  TOYS: 'toys',
  TOOLS: 'tools',
  MEDICINE: 'medicine',
  ACCESSORIES: 'accessories',
  FOOD: 'food',
  OTHER: 'other'
};

// 物品类别显示名称
export const ITEM_CATEGORY_LABELS = {
  [ITEM_CATEGORIES.CLOTHING]: '服装',
  [ITEM_CATEGORIES.BOOKS]: '书籍',
  [ITEM_CATEGORIES.ELECTRONICS]: '电子产品',
  [ITEM_CATEGORIES.DOCUMENTS]: '文件',
  [ITEM_CATEGORIES.KITCHENWARE]: '厨具',
  [ITEM_CATEGORIES.COSMETICS]: '化妆品',
  [ITEM_CATEGORIES.TOYS]: '玩具',
  [ITEM_CATEGORIES.TOOLS]: '工具',
  [ITEM_CATEGORIES.MEDICINE]: '药品',
  [ITEM_CATEGORIES.ACCESSORIES]: '配件',
  [ITEM_CATEGORIES.FOOD]: '食品',
  [ITEM_CATEGORIES.OTHER]: '其他'
};

// 过期状态
export const EXPIRY_STATUS = {
  FRESH: 'fresh',
  NEAR_EXPIRY: 'near_expiry',
  EXPIRED: 'expired',
  NO_EXPIRY: 'no_expiry'
};

// 过期状态显示名称
export const EXPIRY_STATUS_LABELS = {
  [EXPIRY_STATUS.FRESH]: '新鲜',
  [EXPIRY_STATUS.NEAR_EXPIRY]: '即将过期',
  [EXPIRY_STATUS.EXPIRED]: '已过期',
  [EXPIRY_STATUS.NO_EXPIRY]: '无保质期'
};

// 提醒时间配置（天数）
export const REMINDER_DAYS = {
  FOOD: 3,        // 食品提前3天提醒
  MEDICINE: 7,    // 药品提前7天提醒
  COSMETICS: 30,  // 化妆品提前30天提醒
  DEFAULT: 7      // 默认提前7天提醒
};

// 需要过期管理的物品类别
export const EXPIRY_REQUIRED_CATEGORIES = [
  ITEM_CATEGORIES.FOOD,
  ITEM_CATEGORIES.MEDICINE,
  ITEM_CATEGORIES.COSMETICS
];

// 过期颜色主题
export const EXPIRY_COLORS = {
  [EXPIRY_STATUS.FRESH]: '#10b981',      // 绿色
  [EXPIRY_STATUS.NEAR_EXPIRY]: '#f59e0b', // 橙色
  [EXPIRY_STATUS.EXPIRED]: '#ef4444',     // 红色
  [EXPIRY_STATUS.NO_EXPIRY]: '#6b7280'    // 灰色
};

// 库存状态
export const STOCK_STATUS = {
  SUFFICIENT: 'sufficient',    // 库存充足
  LOW: 'low',                 // 库存不足
  OUT_OF_STOCK: 'out_of_stock', // 缺货
  ZERO: 'zero'                // 零库存
};

// 库存状态显示名称
export const STOCK_STATUS_LABELS = {
  [STOCK_STATUS.SUFFICIENT]: '库存充足',
  [STOCK_STATUS.LOW]: '库存不足',
  [STOCK_STATUS.OUT_OF_STOCK]: '缺货',
  [STOCK_STATUS.ZERO]: '零库存'
};

// 库存状态颜色
export const STOCK_COLORS = {
  [STOCK_STATUS.SUFFICIENT]: '#10b981',    // 绿色
  [STOCK_STATUS.LOW]: '#f59e0b',          // 橙色
  [STOCK_STATUS.OUT_OF_STOCK]: '#ef4444', // 红色
  [STOCK_STATUS.ZERO]: '#6b7280'          // 灰色
};

// 默认库存阈值配置（按物品类别）
export const DEFAULT_STOCK_THRESHOLDS = {
  [ITEM_CATEGORIES.FOOD]: {
    lowStock: 2,      // 食品低于2个提醒
    outOfStock: 1     // 低于1个为缺货
  },
  [ITEM_CATEGORIES.MEDICINE]: {
    lowStock: 5,      // 药品低于5个提醒
    outOfStock: 2     // 低于2个为缺货
  },
  [ITEM_CATEGORIES.COSMETICS]: {
    lowStock: 1,      // 化妆品低于1个提醒
    outOfStock: 0     // 等于0为缺货
  },
  [ITEM_CATEGORIES.KITCHENWARE]: {
    lowStock: 3,      // 厨具低于3个提醒
    outOfStock: 1     // 低于1个为缺货
  },
  [ITEM_CATEGORIES.TOOLS]: {
    lowStock: 2,      // 工具低于2个提醒
    outOfStock: 0     // 等于0为缺货
  },
  DEFAULT: {
    lowStock: 3,      // 默认低于3个提醒
    outOfStock: 1     // 默认低于1个为缺货
  }
};

// 需要库存管理的物品类别
export const STOCK_MANAGED_CATEGORIES = [
  ITEM_CATEGORIES.FOOD,
  ITEM_CATEGORIES.MEDICINE,
  ITEM_CATEGORIES.COSMETICS,
  ITEM_CATEGORIES.KITCHENWARE,
  ITEM_CATEGORIES.TOOLS
];

// 颜色主题
export const COLORS = {
  PRIMARY: '#0ea5e9',
  ACCENT: '#d946ef',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  NEUTRAL: '#6b7280'
};

// 获取默认提醒天数
export const getDefaultReminderDays = (category) => {
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

// 获取默认库存阈值
export const getDefaultStockThreshold = (category) => {
  const threshold = DEFAULT_STOCK_THRESHOLDS[category] || DEFAULT_STOCK_THRESHOLDS.DEFAULT;
  return threshold.lowStock;
};

// 房间颜色主题
export const ROOM_COLORS = [
  '#0ea5e9', // 蓝色
  '#10b981', // 绿色
  '#8b5cf6', // 紫色
  '#f59e0b', // 橙色
  '#ef4444', // 红色
  '#06b6d4', // 青色
  '#84cc16', // 青绿色
  '#f97316', // 深橙色
  '#ec4899', // 粉色
  '#6366f1'  // 靛蓝色
];

// 默认房间配置
export const DEFAULT_ROOM = {
  id: '',
  name: '',
  type: ROOM_TYPES.BEDROOM,
  color: ROOM_COLORS[0],
  description: '',
  furniture: [],
  createdAt: null,
  updatedAt: null
};

// 默认家具配置
export const DEFAULT_FURNITURE = {
  id: '',
  name: '',
  type: FURNITURE_TYPES.WARDROBE,
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  color: COLORS.NEUTRAL,
  description: '',
  compartments: [],
  createdAt: null,
  updatedAt: null
};

// 默认物品模板
export const DEFAULT_ITEM = {
  id: '',
  name: '',
  category: ITEM_CATEGORIES.OTHER,
  description: '',
  quantity: 1,
  roomId: '',
  furnitureId: '',
  compartmentId: '',
  tags: [],
  status: 'active',
  createdAt: '',
  updatedAt: '',
  lastUsed: null,
  imageUrl: null,
  // 过期管理字段
  hasExpiryManagement: false, // 是否启用过期管理
  purchaseDate: null,      // 购买日期
  expiryDate: null,        // 过期日期
  productionDate: null,    // 生产日期
  shelfLife: null,         // 保质期（天数）
  reminderEnabled: false,  // 是否启用提醒
  reminderDays: null,      // 提前多少天提醒
  batchNumber: '',         // 批次号
  brand: '',               // 品牌
  isConsumed: false,       // 是否已消耗完
  // 库存管理字段
  hasStockManagement: false, // 是否启用库存管理
  minStock: null,          // 最低库存阈值
  maxStock: null,          // 最高库存阈值
  stockUnit: '个',         // 库存单位
  stockLocation: '',       // 库存位置描述
  supplier: '',            // 供应商
  lastPurchaseDate: null,  // 上次购买日期
  averageUsage: null,      // 平均用量（每月）
  stockNotes: ''           // 库存备注
};

// 动画配置
export const ANIMATIONS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
}; 