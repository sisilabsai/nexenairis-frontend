export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  position: string;
  department: { name: string };
  salary: number;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'cheque';
  is_active: boolean;
  department_id: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  employees_count: number;
  budget: number;
  remaining_budget: number;
  is_active: boolean;
}

export interface JobPosition {
  id: number;
  title: string;
  code: string;
  description: string;
  department: { name: string };
  min_salary: number;
  max_salary: number;
  is_active: boolean;
}
