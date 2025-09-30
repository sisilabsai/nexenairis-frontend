import React from 'react';
import { Tenant } from '@/types';
import './Receipt.css';

interface SaleItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
}

interface ReceiptProps {
  tenant: Tenant;
  sale: Sale;
  receiptCustomization?: any;
}

const Receipt: React.FC<ReceiptProps> = ({ tenant, sale }) => {
  if (!sale) {
    return null;
  }

  const currency = tenant.currency || 'UGX';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const BASE_URL = API_URL.replace('/api', '');
  const logoSrc = tenant.logo ? `${BASE_URL}/storage/${tenant.logo}` : '';

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        {logoSrc && <img src={logoSrc} alt={`${tenant.company_name || tenant.name} Logo`} className="receipt-logo" />}
        <h1 className="receipt-title">{tenant.company_name || tenant.name}</h1>
        <p>{tenant.company_address || tenant.address}</p>
        <p>{tenant.company_phone} | {tenant.company_email || tenant.contactInfo}</p>
      </div>

      <div className="receipt-info">
        <h2>Official Receipt</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Receipt #: {sale.id}</span>
          <span>Date: {new Date(sale.date).toLocaleDateString()}</span>
        </div>
        {sale.customerName && <p>Customer: {sale.customerName}</p>}
      </div>

      <table className="receipt-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{currency} {Number(item.unit_price || 0).toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>{currency} {Number(item.total || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '40%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Subtotal</span>
            <span>{currency} {Number(sale.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>Tax</span>
            <span>{currency} {Number(sale.tax).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', marginTop: '8px', borderTop: '1px solid #d4af37', paddingTop: '12px' }}>
            <span>Total</span>
            <span>{currency} {Number(sale.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="receipt-footer">
        <p>Thank you for your business!</p>
        <p style={{ marginTop: '8px' }}>
          Powered by <a href="https://singo.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d4af37', textDecoration: 'none' }}>NEXEN AIRIS</a>
        </p>
      </div>
    </div>
  );
};

export default Receipt;
