import React from 'react';
import OpportunityCard from './OpportunityCard';

export default function StageColumn({ stage, opportunities, onMove, onOpen, onCreate }: any) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData('application/json');
    if (!payload) return;
    const op = JSON.parse(payload);
    onMove(op, stage.id);
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="w-80 bg-gray-50 rounded shadow-sm p-3" onDrop={handleDrop} onDragOver={allowDrop}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{stage.name || 'Stage'}</div>
          <div className="text-xs text-gray-500">{(opportunities || []).length} deals</div>
        </div>
        <div>
          <button onClick={() => onCreate && onCreate()} className="text-sm px-2 py-1 bg-white border rounded">+ Add</button>
        </div>
      </div>
      <div className="space-y-2">
        {(opportunities || []).map((op: any) => (
          <OpportunityCard key={op.id} opportunity={op} onOpen={() => onOpen && onOpen(op)} />
        ))}
      </div>
    </div>
  );
}
