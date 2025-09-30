import { useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SampleInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  invoiceCustomization: any;
  activeInvoiceTemplate: string;
  logoSrc: string | null;
}

export default function SampleInvoiceModal({
  isOpen,
  onClose,
  profileData,
  invoiceCustomization,
  activeInvoiceTemplate,
  logoSrc,
}: SampleInvoiceModalProps) {
  const [invoiceData, setInvoiceData] = useState({
    customerName: 'John Doe',
    customerAddress: '123 Main St, Anytown, USA',
    invoiceNumber: '00124',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      { description: 'Web Design Services', quantity: 1, price: 1500 },
      { description: 'Hosting (1 year)', quantity: 1, price: 100 },
    ],
    taxRate: 18,
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Invoice</title>');
        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadImage = () => {
    const invoiceElement = invoiceRef.current;
    if (invoiceElement) {
      html2canvas(invoiceElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `invoice-${invoiceData.invoiceNumber}.png`;
        link.click();
      });
    }
  };

  const handleDownloadPdf = () => {
    const invoiceElement = invoiceRef.current;
    if (invoiceElement) {
      html2canvas(invoiceElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
      });
    }
  };

  if (!isOpen) return null;

  const subtotal = invoiceData.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const tax = subtotal * (invoiceData.taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Create Sample Invoice</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div>
              <h3 className="text-lg font-medium mb-4">Invoice Data</h3>
              {/* ... Form fields to edit invoiceData ... */}
            </div>
            {/* Preview */}
            <div ref={invoiceRef} className="border rounded-lg p-8 bg-white" style={{'--accent-color': invoiceCustomization.accentColor} as React.CSSProperties}>
              {/* Invoice Content */}
              <div className={`flex justify-between items-start pb-4 border-b-2 border-gray-200 ${activeInvoiceTemplate === 'Classic' ? 'flex-row-reverse' : ''}`}>
                <div>
                  {invoiceCustomization.showLogo && logoSrc && <img src={logoSrc} alt="Business Logo" className="h-20 mb-4" />}
                  <h1 className={`text-3xl font-bold ${activeInvoiceTemplate === 'Simple' ? 'text-[var(--accent-color)]' : ''}`}>{profileData.company_name}</h1>
                  <p className="text-gray-500">{profileData.address}</p>
                  <p className="text-gray-500">{invoiceCustomization.contactEmail}</p>
                  <p className="text-gray-500">{invoiceCustomization.contactPhone}</p>
                </div>
                <div className="text-right">
                  <h2 className={`text-4xl font-bold text-gray-400 ${activeInvoiceTemplate === 'Modern' ? 'text-[var(--accent-color)]' : ''}`}>INVOICE</h2>
                  <p className="text-gray-500 mt-2">#{invoiceData.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <div>
                  <p className="font-bold">Bill To:</p>
                  <p>{invoiceData.customerName}</p>
                  <p>{invoiceData.customerAddress}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-bold">Date:</span> {invoiceData.invoiceDate}</p>
                  <p><span className="font-bold">Due Date:</span> {invoiceData.dueDate}</p>
                </div>
              </div>
              <table className="w-full mt-8 border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left font-bold text-gray-600">Item</th>
                    <th className="p-3 text-right font-bold text-gray-600">Quantity</th>
                    <th className="p-3 text-right font-bold text-gray-600">Price</th>
                    <th className="p-3 text-right font-bold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <div className="w-1/2">
                  <div className="flex justify-between">
                    <p>Subtotal:</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax ({invoiceData.taxRate}%):</p>
                    <p>${tax.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total:</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              {invoiceCustomization.showFooter && (
                <div className="mt-8 pt-4 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                  <p>Thank you for your business!</p>
                  <p>Powered by <a href="mailto:sales@singoerp.com" className="text-[var(--accent-color)]">NEXEN AIRIS</a></p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button onClick={handlePrint} className="px-4 py-2 border rounded-md">Print</button>
          <button onClick={handleDownloadImage} className="px-4 py-2 border rounded-md">Download PNG</button>
          <button onClick={handleDownloadPdf} className="px-4 py-2 border rounded-md bg-indigo-600 text-white">Download PDF</button>
        </div>
      </div>
    </div>
  );
}
