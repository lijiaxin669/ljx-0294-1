import React, { useState, useEffect } from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { GuestSidebar } from '../components/GuestSidebar/GuestSidebar';
import { Canvas } from '../components/Canvas/Canvas';
import { RuleModal } from '../components/RuleModal/RuleModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSeatingStore } from '../store/useSeatingStore';

const Home: React.FC = () => {
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const { guests, tables } = useSeatingStore();

  useKeyboardShortcuts();

  useEffect(() => {
    if (guests.length === 0 && tables.length === 0) {
      const saved = localStorage.getItem('seating-planner-storage');
      if (!saved) {
        // First time load, auto-initialize mock data
        useSeatingStore.getState().initMockData();
      }
    }
  }, [guests.length, tables.length]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar onOpenRules={() => setIsRuleModalOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <GuestSidebar />
        <Canvas />
      </div>

      <RuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
      />
    </div>
  );
};

export default Home;
