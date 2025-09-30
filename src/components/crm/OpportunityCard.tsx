import React from 'react';

export default function OpportunityCard({ opportunity, onOpen }: any) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(opportunity));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = () => {
    if (onOpen) onOpen();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div draggable onDragStart={handleDragStart} className="bg-white rounded shadow p-3 cursor-pointer" onClick={handleClick} role="button" tabIndex={0} onKeyPress={handleKeyPress}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{opportunity.title}</div>
        <div className="text-sm text-gray-600">{opportunity.expected_value ? `$${opportunity.expected_value}` : ''}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{opportunity.contact?.name ?? opportunity.contact_name}</div>
    </div>
  );
}
