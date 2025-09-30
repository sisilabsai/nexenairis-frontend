export interface Branch {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  address?: string;
  contact_person?: string;
  contact_person_id?: number;
  phone?: string;
  email?: string;
  is_main_branch: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface BranchFormData {
  name: string;
  code: string;
  address?: string;
  contact_person?: string;
  contact_person_id?: number;
  phone?: string;
  email?: string;
  is_main_branch?: boolean;
}

export interface BranchContext {
  currentBranch?: Branch | null;
  isConsolidated: boolean;
  availableBranches: Branch[];
}