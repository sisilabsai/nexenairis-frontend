export interface SalesPipelineStage {
  id: number;
  name: string;
  order: number;
}

export interface SalesOpportunity {
  id: number;
  title: string;
  description?: string;
  contact: {
    name: string;
  };
  expected_value: number;
  currency: string;
  sales_pipeline_stage_id: number;
  contact_id: number;
  probability: number;
  expected_close_date: string;
  stage: string;
  source?: string;
  assigned_to?: number;
  notes?: string;
}

export interface Contact {
  id: number;
  name: string;
}
