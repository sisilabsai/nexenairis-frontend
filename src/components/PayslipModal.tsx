'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: any;
}

export default function PayslipModal({
  isOpen,
  onClose,
  payslip,
}: PayslipModalProps) {
  if (!payslip) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payslip Details</DialogTitle>
        </DialogHeader>
        <div>
          <p><strong>Period:</strong> {payslip.period.period_name}</p>
          <p><strong>Paid on:</strong> {new Date(payslip.paid_at).toLocaleDateString()}</p>
          <p><strong>Gross Salary:</strong> UGX {payslip.gross_salary}</p>
          <p><strong>Tax:</strong> UGX {payslip.tax_amount}</p>
          <p><strong>Deductions:</strong> UGX {payslip.total_deductions}</p>
          <p><strong>Net Salary:</strong> UGX {payslip.net_salary}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
