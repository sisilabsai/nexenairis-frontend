'use client';

import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PayslipModal from './PayslipModal';

export default function PayslipHistory() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response: any = await profileApi.getPayslips();
        if (response.success) {
          setPayslips(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch payslips:', error);
      }
    };

    fetchPayslips();
  }, []);

  const handleViewPayslip = (payslip: any) => {
    setSelectedPayslip(payslip);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {payslips.map((payslip) => (
              <li key={payslip.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">{payslip.period.period_name}</p>
                  <p className="text-sm text-gray-500">Paid on: {new Date(payslip.paid_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">UGX {payslip.net_salary}</p>
                  <button onClick={() => handleViewPayslip(payslip)} className="text-sm text-indigo-600 hover:underline">
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <PayslipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payslip={selectedPayslip}
      />
    </>
  );
}
