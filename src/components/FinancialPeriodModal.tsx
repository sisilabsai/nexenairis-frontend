import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FinancialPeriod {
  id?: number;
  name: string;
  start_date: string;
  end_date: string;
  status?: 'open' | 'closed';
}

interface FinancialPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FinancialPeriod) => void;
  period?: FinancialPeriod | null;
}

const FinancialPeriodModal: React.FC<FinancialPeriodModalProps> = ({ isOpen, onClose, onSave, period }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FinancialPeriod>({
    defaultValues: period || { name: '', start_date: '', end_date: '' },
  });

  React.useEffect(() => {
    if (period) {
      reset(period);
    } else {
      reset({ name: '', start_date: '', end_date: '' });
    }
  }, [period, reset]);

  const onSubmit = (data: FinancialPeriod) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{period ? 'Edit Financial Period' : 'Add New Financial Period'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => <Input id="name" {...field} className="col-span-3" />}
              />
              {errors.name && <p className="col-span-4 text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Start Date
              </Label>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: 'Start date is required' }}
                render={({ field }) => <Input id="start_date" type="date" {...field} className="col-span-3" />}
              />
              {errors.start_date && <p className="col-span-4 text-red-500 text-xs">{errors.start_date.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                End Date
              </Label>
              <Controller
                name="end_date"
                control={control}
                rules={{ required: 'End date is required' }}
                render={({ field }) => <Input id="end_date" type="date" {...field} className="col-span-3" />}
              />
              {errors.end_date && <p className="col-span-4 text-red-500 text-xs">{errors.end_date.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialPeriodModal;
