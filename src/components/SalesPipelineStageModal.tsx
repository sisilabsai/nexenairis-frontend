import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateSalesPipelineStage, useUpdateSalesPipelineStage, useDeleteSalesPipelineStage, useSalesPipelineStages } from '../hooks/useApi';
import { SalesPipelineStage } from '../types/crm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SalesPipelineStageModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { data: stagesData, refetch: refetchStages } = useSalesPipelineStages();
  const createMutation = useCreateSalesPipelineStage();
  const updateMutation = useUpdateSalesPipelineStage();
  const deleteMutation = useDeleteSalesPipelineStage();
  const { register, handleSubmit, reset } = useForm<SalesPipelineStage>();

  const stages = (stagesData as any)?.data || [];

  const onSubmit = (data: SalesPipelineStage) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        refetchStages();
        reset({ name: '', order: 0 });
      },
    });
  };

  const handleUpdate = (stage: SalesPipelineStage) => {
    updateMutation.mutate(stage, {
      onSuccess: () => {
        refetchStages();
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        refetchStages();
      },
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Manage Pipeline Stages</h3>
          <div className="mt-2 px-7 py-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('name', { required: true })} placeholder="Stage Name" className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input {...register('order', { required: true })} placeholder="Order" type="number" className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md" />
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700">
                Add Stage
              </button>
            </form>
          </div>
          <div className="mt-4">
            <ul>
              {stages.map((stage: SalesPipelineStage) => (
                <li key={stage.id} className="flex justify-between items-center mb-2">
                  <input
                    defaultValue={stage.name}
                    onBlur={(e) => handleUpdate({ ...stage, name: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    defaultValue={stage.order}
                    type="number"
                    onBlur={(e) => handleUpdate({ ...stage, order: parseInt(e.target.value) })}
                    className="w-1/4 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button onClick={() => handleDelete(stage.id)} className="px-4 py-2 bg-red-500 text-white rounded-md">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPipelineStageModal;
