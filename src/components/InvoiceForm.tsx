'use client';

import { useState, useEffect } from 'react';
import { useContacts, useProducts } from '../hooks/useApi';

export default function InvoiceForm({ onSubmit, initialData, isSubmitting }: { onSubmit: (data: any) => void, initialData?: any, isSubmitting: boolean }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    invoice_items: [{ product_id: '', quantity: 1, unit_price: 0 }],
  });

  const { data: contactsData } = useContacts();
  const { data: productsData } = useProducts();

  useEffect(() => {
    if (initialData) {
      setFormData({
        contact_id: initialData.contact_id,
        invoice_date: initialData.invoice_date,
        due_date: initialData.due_date,
        notes: initialData.notes,
        invoice_items: initialData.invoice_lines || [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const items = [...formData.invoice_items];
    items[index] = { ...items[index], [name]: value };
    setFormData(prev => ({ ...prev, invoice_items: items }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      invoice_items: [...prev.invoice_items, { product_id: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    const items = [...formData.invoice_items];
    items.splice(index, 1);
    setFormData(prev => ({ ...prev, invoice_items: items }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700">Customer</label>
          <select
            id="contact_id"
            name="contact_id"
            value={formData.contact_id}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          >
            <option value="">Select a customer</option>
            {contactsData?.data?.data?.map((contact: any) => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700">Invoice Date</label>
          <input
            type="date"
            id="invoice_date"
            name="invoice_date"
            value={formData.invoice_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          />
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium">Items</h3>
        {formData.invoice_items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center mt-2">
            <div className="col-span-5">
              <select
                name="product_id"
                value={item.product_id}
                onChange={(e) => handleItemChange(index, e)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              >
                <option value="">Select a product</option>
                {productsData?.data?.data?.map((product: any) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                name="unit_price"
                value={item.unit_price}
                onChange={(e) => handleItemChange(index, e)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            <div className="col-span-2">
              <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-900">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addItem} className="mt-2 text-indigo-600 hover:text-indigo-900">Add Item</button>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
  );
}
