'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: any[];
    barKey: string;
    xAxisKey: string;
}

const CustomBarChart: React.FC<BarChartProps> = ({ data, barKey, xAxisKey }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={barKey} fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CustomBarChart;
