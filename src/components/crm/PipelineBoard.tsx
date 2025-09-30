import React, {useEffect, useState, useCallback} from 'react';
import { crmApi } from '../../lib/api';
import StageColumn from './StageColumn';
import SalesOpportunityModal from '../SalesOpportunityModal';

export default function PipelineBoard() {
  const [stages, setStages] = useState<any[]>([]);
  const [opportunitiesByStage, setOpportunitiesByStage] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Use crmApi.getSalesOpportunities (backend returns paginated results) - request all by using a large per_page param
      const res = await crmApi.getSalesOpportunities({ per_page: 1000 });
      const data = (res as any).data?.data || (res as any).data || [];

      // Build stages from returned opportunities (simple inference)
      const stagesMap: Record<string, any[]> = {};
      data.forEach((op: any) => {
        const stageId = String(op.sales_pipeline_stage_id ?? op.stage ?? 'unspecified');
        if (!stagesMap[stageId]) stagesMap[stageId] = [];
        stagesMap[stageId].push(op);
      });

      const stageEntries = Object.keys(stagesMap).map((id, idx) => ({ id, name: data.find((o:any) => String(o.sales_pipeline_stage_id ?? o.stage) === id)?.salesPipelineStage?.name ?? `Stage ${idx+1}`, position: idx }));

      setStages(stageEntries);
      setOpportunitiesByStage(stagesMap);
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMove = async (opportunity: any, toStageId: string) => {
    // Optimistic UI update
    const fromStageId = String(opportunity.sales_pipeline_stage_id ?? opportunity.stage ?? 'unspecified');
    setOpportunitiesByStage(prev => {
      const copy = {...prev};
      copy[fromStageId] = (copy[fromStageId] || []).filter((o:any) => o.id !== opportunity.id);
      copy[toStageId] = [ ...(copy[toStageId] || []), {...opportunity, sales_pipeline_stage_id: toStageId }];
      return copy;
    });

    try {
      await crmApi.updateSalesOpportunity(opportunity.id, { sales_pipeline_stage_id: Number(toStageId) || toStageId });
    } catch (err) {
      // revert on error
      console.error('Move failed', err);
      fetchData();
    }
  };

  const openOpportunity = (opportunity: any | null) => {
    setSelectedOpportunity(opportunity);
    setModalOpen(true);
  };

  const handleCreateForStage = (stage: any) => {
    // prefill the new opportunity with stage id
    openOpportunity({ sales_pipeline_stage_id: stage.id, salesPipelineStage: stage });
  };

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Sales Pipeline</h2>
        <div className="flex gap-2">
          <button onClick={() => openOpportunity(null)} className="bg-blue-600 text-white px-3 py-1 rounded">+ New Opportunity</button>
          {/* future: filters / export button */}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {stages.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            opportunities={opportunitiesByStage[stage.id] || []}
            onMove={handleMove}
            onOpen={openOpportunity}
            onCreate={() => handleCreateForStage(stage)}
          />
        ))}
      </div>

      <SalesOpportunityModal
        isOpen={modalOpen}
        opportunity={selectedOpportunity}
        onClose={() => { setModalOpen(false); setSelectedOpportunity(null); }}
        onSuccess={() => { fetchData(); }}
      />
    </div>
  );
}
