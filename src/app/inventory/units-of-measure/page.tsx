"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

interface UnitOfMeasure {
  id: number;
  name: string;
}

const UnitsOfMeasurePage = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<UnitOfMeasure[]>('/inventory/unit-of-measures');
      if (response.data && Array.isArray(response.data)) {
        setUnits(response.data);
      } else {
        console.warn('Unexpected API response structure:', response);
        setUnits([]);
      }
    } catch (error) {
      console.error('Error fetching units of measure:', error);
      setError('Failed to fetch units.');
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) return; // Prevent creating empty units
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<UnitOfMeasure>('/inventory/unit-of-measures', { name: newUnitName });
      if (response.data) {
        setUnits(prevUnits => [...prevUnits, response.data as UnitOfMeasure]);
        setNewUnitName('');
      }
    } catch (error: any) {
      console.error('Error creating unit of measure:', error);
      if (error.status === 422) {
        setError('A unit with this name already exists.');
      } else {
        setError('Failed to create unit of measure.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put<UnitOfMeasure>(`/inventory/unit-of-measures/${editingUnit.id}`, { name: editingUnit.name });
      if (response.data) {
        const updatedUnit = response.data;
        setUnits(units.map(u => u.id === editingUnit.id ? updatedUnit : u));
        setEditingUnit(null);
      }
    } catch (error: any) {
      console.error('Error updating unit of measure:', error);
      if (error.status === 422) {
        setError('A unit with this name already exists.');
      } else {
        setError('Failed to update unit of measure.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = (id: number) => {
    setUnitToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/inventory/unit-of-measures/${unitToDelete}`);
      setUnits(units.filter(u => u.id !== unitToDelete));
    } catch (error) {
      console.error('Error deleting unit of measure:', error);
      setError('Failed to delete unit of measure.');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleInitializeDefaults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/inventory/unit-of-measures/initialize-defaults');
      fetchUnits(); // Refresh the list of units
    } catch (error) {
      console.error('Error initializing default units:', error);
      setError('Failed to initialize default units.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Units of Measure</h1>
        <Button onClick={handleInitializeDefaults} disabled={isLoading}>
          {isLoading ? 'Initializing...' : 'Initialize Default Units'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Unit</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex gap-2">
            <Input
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g., Kilogram, Liter"
              disabled={isLoading}
            />
            <Button onClick={handleCreateUnit} disabled={isLoading}>
              {isLoading ? 'Adding...' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Unit</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Unit of Measure"
        description="Are you sure you want to delete this unit of measure? This action cannot be undone."
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Existing Units</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading units...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && units.length === 0 && <p>No units found.</p>}
          {!isLoading && !error && units.length > 0 && (
            <ul>
              {units.map(unit => (
                <li key={unit.id} className="flex items-center justify-between p-2 border-b">
                  {editingUnit?.id === unit.id ? (
                    <Input
                      value={editingUnit.name}
                      onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                    />
                  ) : (
                    <span>{unit.name}</span>
                  )}
                  <div className="flex gap-2">
                    {editingUnit?.id === unit.id ? (
                      <Button onClick={handleUpdateUnit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => setEditingUnit(unit)} disabled={isLoading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUnit(unit.id)} disabled={isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitsOfMeasurePage;
