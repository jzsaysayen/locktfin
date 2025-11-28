'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface TodaysPieChartProps {
  data: DataPoint[];
  total: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: readonly {
    name: string;
    value: number;
    payload: DataPoint;
  }[];
  total: number;
}

const CustomTooltip = ({ active, payload, total }: TooltipProps) => {
  if (active && payload && payload.length) {
    const percentage = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          {payload[0].value} orders ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  
  if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent) return null;
  if (percent < 0.05) return null; // Don't show label if less than 5%
  
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-semibold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function TodaysPieChart({ data, total }: TodaysPieChartProps) {
  // Filter out entries with 0 value for cleaner visualization
  const filteredData = data.filter(item => item.value > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-gray-500">No orders today yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-500">Total Orders Today</p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={(props) => <CustomTooltip {...props} total={total} />} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => {
              const item = filteredData.find(d => d.name === value);
              return (
                <span className="text-xs text-gray-700">
                  {value}: {item?.value || 0}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}