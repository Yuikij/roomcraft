import React from 'react';
import { Menu, Bell, Settings, User } from 'lucide-react';

const Header = ({ onSidebarToggle }) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-80 h-16 glass-effect backdrop-blur-xl border-b border-white/20 z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* 左侧 - 移动端菜单按钮 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            <Menu className="w-5 h-5 text-neutral-600" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-neutral-800">智能家居管理系统</h1>
          </div>
        </div>

        {/* 右侧 - 用户菜单 */}
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-xl hover:bg-white/50 transition-colors relative">
            <Bell className="w-5 h-5 text-neutral-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 rounded-xl hover:bg-white/50 transition-colors">
            <Settings className="w-5 h-5 text-neutral-600" />
          </button>
          
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:inline text-sm font-medium text-neutral-800">用户</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 