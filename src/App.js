import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { roomStorage, itemStorage } from './utils/storage';
import { DEFAULT_ROOM, DEFAULT_ITEM } from './utils/constants';
import { v4 as uuidv4 } from 'uuid';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import RoomManager from './components/Room/RoomManager';
import RoomEditor from './components/Room/RoomEditor';
import ItemManager from './components/Item/ItemManager';
import SearchPage from './components/Search/SearchPage';

function App() {
  const [rooms, setRooms] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 初始化数据
  useEffect(() => {
    const loadData = () => {
      const savedRooms = roomStorage.getRooms();
      const savedItems = itemStorage.getItems();
      
      if (savedRooms.length === 0) {
        // 创建示例房间
        const sampleRoom = {
          ...DEFAULT_ROOM,
          id: uuidv4(),
          name: '我的卧室',
          type: 'bedroom',
          colorScheme: 'blue',
          color: '#3B82F6',
          furniture: [
            {
              id: uuidv4(),
              name: '衣柜',
              type: 'wardrobe',
              x: 50,
              y: 50,
              width: 150,
              height: 60,
              color: '#8b7355',
              compartments: [
                { id: uuidv4(), name: '上层', type: 'shelf' },
                { id: uuidv4(), name: '下层', type: 'drawer' }
              ]
            }
          ]
        };
        
        roomStorage.addRoom(sampleRoom);
        setRooms([sampleRoom]);
        
        // 创建示例物品
        const sampleItems = [
          {
            ...DEFAULT_ITEM,
            id: uuidv4(),
            name: '夏季T恤',
            category: 'clothing',
            description: '白色棉质T恤，夏季必备',
            quantity: 3,
            roomId: sampleRoom.id,
            furnitureId: sampleRoom.furniture[0].id,
            compartmentId: sampleRoom.furniture[0].compartments[0].id,
            createdAt: new Date().toISOString()
          },
          {
            ...DEFAULT_ITEM,
            id: uuidv4(),
            name: '手机充电器',
            category: 'electronics',
            description: 'iPhone充电器',
            quantity: 1,
            roomId: sampleRoom.id,
            createdAt: new Date().toISOString()
          }
        ];
        
        sampleItems.forEach(item => itemStorage.addItem(item));
        setItems(sampleItems);
      } else {
        setRooms(savedRooms);
        setItems(savedItems);
      }
    };

    loadData();
  }, []);

  const handleRoomsUpdate = (updatedRooms) => {
    setRooms(updatedRooms);
  };

  const handleItemsUpdate = (updatedItems) => {
    setItems(updatedItems);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            rooms={rooms}
            onRoomSelect={handleRoomSelect}
            selectedRoom={selectedRoom}
          />
          <div className="flex-1 lg:ml-80 min-h-screen">
            <Header onSidebarToggle={handleSidebarToggle} />
            <main className="p-6 pt-20">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      rooms={rooms} 
                      items={items}
                      onRoomSelect={handleRoomSelect}
                      onRoomsUpdate={handleRoomsUpdate}
                    />
                  } 
                />
                <Route 
                  path="/rooms" 
                  element={
                    <RoomManager 
                      rooms={rooms} 
                      onRoomsUpdate={handleRoomsUpdate}
                      onRoomSelect={handleRoomSelect}
                    />
                  } 
                />
                <Route 
                  path="/room/:id" 
                  element={
                    <RoomEditor 
                      rooms={rooms} 
                      onRoomsUpdate={handleRoomsUpdate}
                      items={items}
                    />
                  } 
                />
                <Route 
                  path="/items" 
                  element={
                    <ItemManager 
                      rooms={rooms}
                      items={items}
                      onItemsUpdate={handleItemsUpdate}
                      selectedRoom={selectedRoom}
                    />
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <SearchPage 
                      rooms={rooms}
                      items={items}
                    />
                  } 
                />
              </Routes>
            </main>
          </div>
        </div>
        
        {/* 遮罩层（移动端侧边栏打开时） */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App; 