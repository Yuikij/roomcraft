// 本地存储键名
const STORAGE_KEYS = {
  ROOMS: 'home_inventory_rooms',
  ITEMS: 'home_inventory_items',
  SETTINGS: 'home_inventory_settings'
};

// 通用存储操作函数
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('获取存储数据失败:', error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('保存存储数据失败:', error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除存储数据失败:', error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('清空存储数据失败:', error);
      return false;
    }
  }
};

// 房间数据操作
export const roomStorage = {
  getRooms: () => storage.get(STORAGE_KEYS.ROOMS) || [],
  setRooms: (rooms) => storage.set(STORAGE_KEYS.ROOMS, rooms),
  addRoom: (room) => {
    const rooms = roomStorage.getRooms();
    rooms.push(room);
    return roomStorage.setRooms(rooms);
  },
  updateRoom: (roomId, updatedRoom) => {
    const rooms = roomStorage.getRooms();
    const index = rooms.findIndex(room => room.id === roomId);
    if (index !== -1) {
      rooms[index] = { ...rooms[index], ...updatedRoom };
      return roomStorage.setRooms(rooms);
    }
    return false;
  },
  deleteRoom: (roomId) => {
    const rooms = roomStorage.getRooms();
    const filteredRooms = rooms.filter(room => room.id !== roomId);
    return roomStorage.setRooms(filteredRooms);
  }
};

// 物品数据操作
export const itemStorage = {
  getItems: () => storage.get(STORAGE_KEYS.ITEMS) || [],
  setItems: (items) => storage.set(STORAGE_KEYS.ITEMS, items),
  addItem: (item) => {
    const items = itemStorage.getItems();
    items.push(item);
    return itemStorage.setItems(items);
  },
  updateItem: (itemId, updatedItem) => {
    const items = itemStorage.getItems();
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      return itemStorage.setItems(items);
    }
    return false;
  },
  deleteItem: (itemId) => {
    const items = itemStorage.getItems();
    const filteredItems = items.filter(item => item.id !== itemId);
    return itemStorage.setItems(filteredItems);
  },
  getItemsByRoom: (roomId) => {
    const items = itemStorage.getItems();
    return items.filter(item => item.roomId === roomId);
  },
  getItemsByLocation: (roomId, locationId) => {
    const items = itemStorage.getItems();
    return items.filter(item => item.roomId === roomId && item.locationId === locationId);
  }
};

// 设置数据操作
export const settingsStorage = {
  getSettings: () => storage.get(STORAGE_KEYS.SETTINGS) || {},
  setSettings: (settings) => storage.set(STORAGE_KEYS.SETTINGS, settings),
  updateSetting: (key, value) => {
    const settings = settingsStorage.getSettings();
    settings[key] = value;
    return settingsStorage.setSettings(settings);
  }
};

export default storage; 