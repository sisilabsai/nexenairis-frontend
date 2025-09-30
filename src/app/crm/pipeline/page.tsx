"use client";

import React from 'react';
import PipelineBoard from '../../../components/crm/PipelineBoard';

// Removed duplicate default export for PipelinePage
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/DashboardLayout';
import { useSalesOpportunities, useSalesPipelineStages, useUpdateSalesOpportunity } from '../../../hooks/useApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { SalesPipelineStage, SalesOpportunity } from '../../../types/crm';
import SalesOpportunityModal from '../../../components/SalesOpportunityModal';
import SalesPipelineStageModal from '../../../components/SalesPipelineStageModal';

const OpportunityCard = ({ opportunity, onEdit }: { opportunity: SalesOpportunity, onEdit: (opportunity: SalesOpportunity) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-4 mb-4 shadow"
      onClick={() => onEdit(opportunity)}
    >
      <h3 className="font-bold">{opportunity.title}</h3>
      <p>{opportunity.contact.name}</p>
      <p>{opportunity.expected_value}</p>
    </div>
  );
};

const PipelineColumn = ({ stage, opportunities, onEditOpportunity }: { stage: SalesPipelineStage, opportunities: SalesOpportunity[], onEditOpportunity: (opportunity: SalesOpportunity) => void }) => {
  const { setNodeRef } = useSortable({ id: stage.id });

  return (
    <div ref={setNodeRef} className="bg-gray-100 rounded-lg p-4 w-1/4">
      <h2 className="font-bold mb-4">{stage.name}</h2>
      <SortableContext items={opportunities.map(o => o.id)} strategy={rectSortingStrategy}>
        <div className="flex-grow">
          {opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} onEdit={onEditOpportunity} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SalesPipelinePage = () => {
  const { data: stagesData, isLoading: stagesLoading, error: stagesError, refetch: refetchStages } = useSalesPipelineStages();
  const { data: opportunitiesData, isLoading: opportunitiesLoading, error: opportunitiesError, refetch: refetchOpportunities } = useSalesOpportunities();
  const updateOpportunityMutation = useUpdateSalesOpportunity();

  const [stages, setStages] = useState<SalesPipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SalesOpportunity | null>(null);

  useEffect(() => {
    // Normalize stages response to always be an array
    const rawStages = (stagesData as any);
    const stagesArr = rawStages?.data ?? (Array.isArray(rawStages) ? rawStages : []);
    setStages(Array.isArray(stagesArr) ? stagesArr : []);
  }, [stagesData]);

  useEffect(() => {
    // Normalize opportunities response to always be an array
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

    if (active && over && active.id !== over.id) {
      const activeContainer = active.data.current.sortable.containerId;
      const overContainer = over.data.current?.sortable.containerId || over.id;

      if (activeContainer !== overContainer) {
        const activeIndex = opportunities.findIndex((o) => o.id === active.id);
        const overIndex = opportunities.findIndex((o) => o.id === over.id);

        const newOpportunities = arrayMove(opportunities, activeIndex, overIndex);
        const movedOpportunity = newOpportunities.find(o => o.id === active.id);

        if (movedOpportunity) {
          // Ensure stage id is numeric when sending to API (server expects existing stage id)
          movedOpportunity.sales_pipeline_stage_id = overContainer;
          setOpportunities(newOpportunities);

          updateOpportunityMutation.mutate({
            id: active.id,
            data: { sales_pipeline_stage_id: Number(overContainer) || overContainer },
          });
        }
      }
    }
  };

  const handleAddOpportunity = () => {
    setSelectedOpportunity(null);
    setIsModalOpen(true);
  };

  const handleEditOpportunity = (opportunity: SalesOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refetchOpportunities();
    refetchStages();
  };

  if (stagesLoading || opportunitiesLoading) {
    return <LoadingSpinner />;
  }

  if (stagesError || opportunitiesError) {
    return <ErrorMessage message="Failed to load sales pipeline" />;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <div>
            <button className="btn btn-primary mr-4" onClick={() => setIsStageModalOpen(true)}>
              Manage Stages
            </button>
            <button className="btn btn-primary" onClick={handleAddOpportunity}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Opportunity
            </button>
          </div>
        </div>
        <SalesPipelineStageModal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          onSuccess={() => refetchStages()}
        />
        <SalesOpportunityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          opportunity={selectedOpportunity}
          onSuccess={handleModalSuccess}
        />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex space-x-4">
            <SortableContext items={stages.map(s => s.id)} strategy={rectSortingStrategy}>
              {stages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  opportunities={opportunities.filter((opp) => opp.sales_pipeline_stage_id === stage.id)}
                  onEditOpportunity={handleEditOpportunity}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SalesPipelinePage;
