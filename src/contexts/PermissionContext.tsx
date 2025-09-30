'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface PermissionContextType {
  hasPermission: (permission: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      return false;
    }

    for (const role of user.roles) {
      for (const p of role.permissions) {
        if (p.name === permission) {
          return true;
        }
      }
    }

    return false;
  };

  const value: PermissionContextType = {
    hasPermission,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}
