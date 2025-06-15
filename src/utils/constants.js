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
  [ITEM_CATEGORIES.OTHER]: '其他'
};

// 颜色主题
export const COLORS = {
  PRIMARY: '#0ea5e9',
  ACCENT: '#d946ef',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  NEUTRAL: '#6b7280'
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
  imageUrl: null
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