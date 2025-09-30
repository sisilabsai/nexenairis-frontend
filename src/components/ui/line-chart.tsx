'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
    data: any[];
    lineKey: string;
    xAxisKey: string;
}

const CustomLineChart: React.FC<LineChartProps> = ({ data, lineKey, xAxisKey }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={lineKey} stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CustomLineChart;
