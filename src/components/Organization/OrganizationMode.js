import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Inbox, Trash2, CheckCircle, Package, Search, Calendar, ChevronDown, ChevronUp, AlertCircle, Info, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

// Mock function to simulate last updated date
const addMockUpdatedDate = (item) => {
  if (!item.updatedAt) {
    const monthsAgo = Math.floor(Math.random() * 12);
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return { ...item, updatedAt: date.toISOString() };
  }
  return item;
};

const OrganizationMode = ({ items, rooms, onItemsUpdate }) => {
  const [activeStage, setActiveStage] = useState('identify'); // identify, review, summary
  const [processingItems, setProcessingItems] = useState([]);
  const [discardedItems, setDiscardedItems] = useState([]);
  const [keptItems, setKeptItems] = useState([]);

  // Add mock data for demonstration
  const itemsWithMockData = useMemo(() => items.map(addMockUpdatedDate), [items]);

  const clutterCandidates = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return itemsWithMockData.filter(item => new Date(item.updatedAt) < sixMonthsAgo);
  }, [itemsWithMockData]);

  const startReview = () => {
    setProcessingItems([...clutterCandidates]);
    setActiveStage('review');
  };

  const handleDecision = (decision) => {
    const currentItem = processingItems[0];
    const remainingItems = processingItems.slice(1);

    if (decision === 'keep') {
      setKeptItems([...keptItems, currentItem]);
      // Here you might want to update the item's `updatedAt` field in your actual data
    } else { // discard
      setDiscardedItems([...discardedItems, currentItem]);
    }

    setProcessingItems(remainingItems);

    if (remainingItems.length === 0) {
      setActiveStage('summary');
    }
  };

  const finishOrganizing = () => {
    const keptItemIds = new Set(keptItems.map(item => item.id));
    const discardedItemIds = new Set(discardedItems.map(item => item.id));

    const updatedItems = items.filter(item => !discardedItemIds.has(item.id))
      .map(item => {
        if (keptItemIds.has(item.id)) {
          return { ...item, updatedAt: new Date().toISOString() };
        }
        return item;
      });
    
    onItemsUpdate(updatedItems);
    
    // Reset state for next time
    setActiveStage('identify');
    setProcessingItems([]);
    setDiscardedItems([]);
    setKeptItems([]);
  };

  const resetState = () => {
    setActiveStage('identify');
    setProcessingItems([]);
    setDiscardedItems([]);
    setKeptItems([]);
  }

  useEffect(() => {
    if (activeStage === 'summary') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [activeStage]);

  if (activeStage === 'review') {
    const currentItem = processingItems[0];
    const room = rooms.find(r => r.id === currentItem.roomId);
    const progress = ((clutterCandidates.length - processingItems.length) / clutterCandidates.length) * 100;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">回顾物品</h1>
          <p className="text-lg text-gray-500 mt-2">是时候决定这些物品的去留了。</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <motion.div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{clutterCandidates.length - processingItems.length} / {clutterCandidates.length} 已回顾</p>
        </header>

        <AnimatePresence>
          {currentItem && (
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white rounded-2xl shadow-soft p-8"
            >
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">上次更新于: {new Date(currentItem.updatedAt).toLocaleDateString()}</p>
                <h2 className="text-4xl font-bold text-gray-800">{currentItem.name}</h2>
                {room && <p className="text-lg text-gray-500 mt-2">位于: {room.name}</p>}
                <p className="text-gray-600 mt-4 max-w-prose mx-auto">{currentItem.description || '没有描述信息。'}</p>
              </div>

              <div className="mt-12 flex justify-center items-center gap-4 md:gap-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDecision('discard')}
                  className="group flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-red-50 rounded-full shadow-inner-soft transition-all duration-300 hover:bg-red-100"
                >
                  <Trash2 className="w-12 h-12 md:w-16 md:h-16 text-red-500 transition-transform duration-300 group-hover:scale-110" />
                  <span className="mt-2 font-semibold text-red-600">扔掉它！</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDecision('keep')}
                  className="group flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-green-50 rounded-full shadow-inner-soft transition-all duration-300 hover:bg-green-100"
                >
                  <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                  <span className="mt-2 font-semibold text-green-600">我还要！</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (activeStage === 'summary') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Sparkles className="w-16 h-16 text-amber-400 mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mt-4">整理完成！</h1>
          <p className="text-lg text-gray-500 mt-2">看看您的成果，享受整洁带来的愉悦吧！</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h3 className="text-xl font-semibold text-red-600 flex items-center">
              <Trash2 className="w-6 h-6 mr-2" />
              已丢弃 ({discardedItems.length})
            </h3>
            <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {discardedItems.map(item => (
                <li key={item.id} className="text-gray-700 p-2 bg-red-50 rounded-lg">{item.name}</li>
              ))}
              {discardedItems.length === 0 && <p className="text-gray-500 text-sm">没有丢弃任何物品。</p>}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h3 className="text-xl font-semibold text-green-600 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              已保留 ({keptItems.length})
            </h3>
            <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {keptItems.map(item => (
                <li key={item.id} className="text-gray-700 p-2 bg-green-50 rounded-lg">{item.name}</li>
              ))}
               {keptItems.length === 0 && <p className="text-gray-500 text-sm">没有保留任何物品。</p>}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={finishOrganizing}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl"
          >
            完成并返回
          </motion.button>
          <button onClick={resetState} className="mt-4 flex items-center justify-center w-full text-sm text-gray-500 hover:text-gray-700">
            <RotateCcw className="w-4 h-4 mr-1" />
            重新整理
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-800">整理模式</h1>
        </div>
        <p className="text-lg text-gray-500">发现、分类并处理不再需要的物品，享受清爽空间带来的快感。</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-soft transition-all hover:shadow-soft-strong">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">准备好开始整理了吗？</h2>
            <p className="text-gray-500 mt-2">
              我们将引导您回顾那些可能被遗忘的物品。
              <br />
              基于物品的最后更新日期，我们为您找到了
              <span className="font-bold text-primary-600 mx-1">{clutterCandidates.length}</span>
              个可能需要整理的物品。
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startReview}
            disabled={clutterCandidates.length === 0}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>{clutterCandidates.length > 0 ? "开始回顾" : "无需整理"}</span>
            </div>
          </motion.button>
        </div>
        {clutterCandidates.length === 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700">太棒了！所有物品都在近期内有更新，您的空间看起来井井有条。</p>
          </div>
        )}
      </div>
    </div>
  )
};

export default OrganizationMode; 