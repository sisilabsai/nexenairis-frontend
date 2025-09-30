import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface PeriodsAuditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PeriodsAuditInfoModal: React.FC<PeriodsAuditInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Financial Periods & Audit Trails</DialogTitle>
        </DialogHeader>
        <div className="prose">
          <h4>Financial Periods</h4>
          <p>Financial periods allow you to define specific timeframes (e.g., months, quarters) for your accounting. This helps in organizing transactions and generating accurate financial reports.</p>
          <ul>
            <li><strong>Open Periods:</strong> Transactions can be freely created and edited within open periods.</li>
            <li><strong>Closed Periods:</strong> Once a period is closed, its transactions are locked and cannot be modified. This ensures the integrity of your financial records, especially after an audit or report generation.</li>
            <li><strong>Reopening Periods:</strong> If you need to make corrections, you can reopen a closed period. However, this should be done with caution as it can affect your financial statements.</li>
          </ul>

          <h4>Audit Trails</h4>
          <p>The audit trail provides a detailed log of all activities related to a specific record. It tracks who made the change, what the change was, and when it occurred.</p>
          <ul>
            <li><strong>Filtering:</strong> You can filter the audit trail by action type (e.g., created, updated) and by a specific date range to easily find the information you need.</li>
            <li><strong>Transparency:</strong> The audit trail is essential for maintaining transparency, security, and accountability in your financial data.</li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodsAuditInfoModal;
