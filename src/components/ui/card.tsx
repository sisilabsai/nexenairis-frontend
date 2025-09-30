import React from 'react';

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white shadow-md rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent };
