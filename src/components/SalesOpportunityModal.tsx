import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateSalesOpportunity, useUpdateSalesOpportunity, useContacts, useSalesPipelineStages, useEmployees } from '../hooks/useApi';
import { SalesOpportunity, Contact, SalesPipelineStage } from '../types/crm';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: SalesOpportunity | null;
  initialValues?: Partial<SalesOpportunity> | null;
  onSuccess: () => void;
}

const SalesOpportunityModal = ({ isOpen, onClose, opportunity, initialValues, onSuccess }: Props) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SalesOpportunity>();
  const createMutation = useCreateSalesOpportunity();
  const updateMutation = useUpdateSalesOpportunity();
  const { data: contactsData } = useContacts();
  const { data: stagesData } = useSalesPipelineStages();
  const { data: employeesData } = useEmployees();

  // Normalize responses: API may return paginated objects { data: [...] } or direct arrays
  const contactsRaw = (contactsData as any)?.data;
  const contacts = Array.isArray(contactsRaw) ? contactsRaw : (contactsRaw?.data ?? []);

  const stagesRaw = (stagesData as any)?.data;
  const stages = Array.isArray(stagesRaw) ? stagesRaw : (stagesRaw?.data ?? []);

  const usersRaw = (employeesData as any)?.data;
  const users = Array.isArray(usersRaw) ? usersRaw : (usersRaw?.data ?? []);

  useEffect(() => {
    if (opportunity && opportunity.id) {
      const formattedOpportunity = {
        ...opportunity,
        expected_close_date: opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toISOString().split('T')[0] : '',
        assigned_to: opportunity.assigned_to || undefined,
      } as any;
      reset(formattedOpportunity);
    } else if (initialValues) {
      const formatted = {
        ...initialValues,
        expected_close_date: (initialValues as any).expected_close_date ? new Date((initialValues as any).expected_close_date).toISOString().split('T')[0] : '',
      } as any;
      reset({ currency: 'UGX', ...formatted });
    } else {
      reset({
        currency: 'UGX', // Default currency
      } as any);
    }
  }, [opportunity, initialValues, reset]);

  const onSubmit = (data: SalesOpportunity) => {
    const numericData = {
      ...data,
      expected_value: data.expected_value === undefined || String(data.expected_value) === '' ? undefined : parseFloat(String(data.expected_value)),
      probability: data.probability === undefined || String(data.probability) === '' ? undefined : parseFloat(String(data.probability)),
      contact_id: data.contact_id ? parseInt(String(data.contact_id)) : undefined,
      sales_pipeline_stage_id: data.sales_pipeline_stage_id ? parseInt(String(data.sales_pipeline_stage_id)) : undefined,
      assigned_to: data.assigned_to ? parseInt(String(data.assigned_to)) : undefined,
    } as any;

    if (opportunity && opportunity.id) {
      updateMutation.mutate({ data: numericData, id: opportunity.id }, {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      });
    } else {
      createMutation.mutate(numericData, {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-900">{opportunity ? 'Edit' : 'Create'} Sales Opportunity</h3>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <div className="mt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
              <input id="title" {...register('title', { required: 'Title is required' })} placeholder="e.g., New Website for Client X" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
              <textarea id="description" {...register('description')} placeholder="Detailed description of the opportunity" rows={3} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact_id" className="block mb-2 text-sm font-medium text-gray-900">Contact</label>
                <select id="contact_id" {...register('contact_id', { required: 'Contact is required' })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="">Select a Contact</option>
                  {contacts.map((contact: Contact) => (
                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                  ))}
                </select>
                {errors.contact_id && <p className="mt-1 text-xs text-red-500">{errors.contact_id.message}</p>}
              </div>
              <div>
                <label htmlFor="sales_pipeline_stage_id" className="block mb-2 text-sm font-medium text-gray-900">Pipeline Stage</label>
                <select id="sales_pipeline_stage_id" {...register('sales_pipeline_stage_id', { required: 'Pipeline stage is required' })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="">Select a Stage</option>
                  {stages.map((stage: SalesPipelineStage) => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
                {errors.sales_pipeline_stage_id && <p className="mt-1 text-xs text-red-500">{errors.sales_pipeline_stage_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expected_value" className="block mb-2 text-sm font-medium text-gray-900">Expected Value</label>
                <input id="expected_value" type="number" step="0.01" {...register('expected_value', { required: 'Expected value is required', valueAsNumber: true })} placeholder="e.g., 5000" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                {errors.expected_value && <p className="mt-1 text-xs text-red-500">{errors.expected_value.message}</p>}
              </div>
              <div>
                <label htmlFor="currency" className="block mb-2 text-sm font-medium text-gray-900">Currency</label>
                <select id="currency" {...register('currency', { required: 'Currency is required' })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="UGX">UGX</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="KES">KES</option>
                </select>
                {errors.currency && <p className="mt-1 text-xs text-red-500">{errors.currency.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="probability" className="block mb-2 text-sm font-medium text-gray-900">Probability (%)</label>
                <input id="probability" type="number" {...register('probability', { required: 'Probability is required', valueAsNumber: true, min: 0, max: 100 })} placeholder="e.g., 75" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                {errors.probability && <p className="mt-1 text-xs text-red-500">{errors.probability.message}</p>}
              </div>
              <div>
                <label htmlFor="expected_close_date" className="block mb-2 text-sm font-medium text-gray-900">Expected Close Date</label>
                <input id="expected_close_date" type="date" {...register('expected_close_date', { required: 'Expected close date is required' })} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                {errors.expected_close_date && <p className="mt-1 text-xs text-red-500">{errors.expected_close_date.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="block mb-2 text-sm font-medium text-gray-900">Source</label>
                <input id="source" {...register('source')} placeholder="e.g., Referral, Website" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
              </div>
              <div>
                <label htmlFor="assigned_to" className="block mb-2 text-sm font-medium text-gray-900">Assigned To</label>
                <select id="assigned_to" {...register('assigned_to')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="">Assign to a user</option>
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900">Notes</label>
              <textarea id="notes" {...register('notes')} placeholder="Add any relevant notes here" rows={3} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"></textarea>
            </div>

            <div className="flex items-center justify-end pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalesOpportunityModal;
