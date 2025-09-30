'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
    data: any[];
    dataKey: string;
    nameKey: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomPieChart: React.FC<PieChartProps> = ({ data, dataKey, nameKey }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={dataKey}
                    nameKey={nameKey}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CustomPieChart;
