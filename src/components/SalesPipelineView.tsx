'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSalesPipelineStages, useSalesOpportunities, useUpdateSalesOpportunity } from '../hooks/useApi';
import { SalesPipelineStage, SalesOpportunity } from '../types/crm';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../lib/utils';

const OpportunityCard = ({ opportunity }: { opportunity: SalesOpportunity }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeft: `5px solid ${opportunity.expected_value > 5000 ? 'var(--color-success)' : 'var(--color-warning)'}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-4 bg-white rounded-lg shadow-md border-l-4"
    >
      <h3 className="font-semibold text-gray-800">{opportunity.title}</h3>
      <p className="text-sm text-gray-600">{opportunity.contact.name}</p>
      <p className="text-sm font-bold mt-2 text-gray-800">{formatCurrency(opportunity.expected_value, opportunity.currency)}</p>
    </div>
  );
};

const PipelineColumn = ({ stage, opportunities }: { stage: SalesPipelineStage, opportunities: SalesOpportunity[] }) => {
  const { setNodeRef } = useSortable({ id: stage.id });
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.expected_value, 0);

  return (
    <div ref={setNodeRef} className="flex flex-col w-80 bg-gray-50 rounded-lg p-4 m-2 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">{stage.name}</h2>
        <span className="text-sm font-semibold text-gray-500">{opportunities.length}</span>
      </div>
      <div className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b-2">
        {formatCurrency(totalValue, opportunities[0]?.currency || 'UGX')}
      </div>
      <SortableContext items={opportunities.map(o => o.id)} strategy={rectSortingStrategy}>
        <div className="flex-grow p-2 bg-gray-100 rounded-md min-h-[200px]">
          {opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SalesPipelineView = () => {
  const { data: stagesData, isLoading: stagesLoading } = useSalesPipelineStages();
  const { data: opportunitiesData, isLoading: opportunitiesLoading, refetch: refetchOpportunities } = useSalesOpportunities();
  const updateOpportunityMutation = useUpdateSalesOpportunity();

  const stages = (stagesData as any)?.data || [];
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);

  useEffect(() => {
    // Normalize API responses: some endpoints return paginated objects { data: [...] }
    // while others may return the array directly. Ensure we always store an array.
    const raw = (opportunitiesData as any);
    const arr = raw?.data?.data ?? raw?.data ?? (Array.isArray(raw) ? raw : []);
    setOpportunities(Array.isArray(arr) ? arr : []);
  }, [opportunitiesData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
  const currentOpportunities = Array.isArray(opportunities) ? opportunities : [];
  const activeIndex = currentOpportunities.findIndex(o => o.id === active.id);
  const overIndex = currentOpportunities.findIndex(o => o.id === over.id);

  const newOpportunities = arrayMove(currentOpportunities, activeIndex, overIndex);
      setOpportunities(newOpportunities);

  const activeOpportunity = currentOpportunities.find(o => o.id === active.id);
  const overContainerId = over?.data?.current?.sortable?.containerId;
      
      if (activeOpportunity && activeOpportunity.sales_pipeline_stage_id !== overContainerId) {
        updateOpportunityMutation.mutate({
          id: active.id,
          data: { sales_pipeline_stage_id: Number(overContainerId) || overContainerId },
        }, {
          onSuccess: () => {
            refetchOpportunities();
          }
        });
      }
    }
  };

  if (stagesLoading || opportunitiesLoading) {
    return <LoadingSpinner />;
  }

  // Defensive: ensure opportunities is always an array for rendering
  const safeOpportunities: SalesOpportunity[] = Array.isArray(opportunities) ? opportunities : [];

  return (
    <div className="flex h-full overflow-x-auto p-4 bg-gray-200">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((s: SalesPipelineStage) => s.id)} strategy={rectSortingStrategy}>
          {stages.map((stage: SalesPipelineStage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              opportunities={safeOpportunities.filter(o => o.sales_pipeline_stage_id === stage.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SalesPipelineView;
