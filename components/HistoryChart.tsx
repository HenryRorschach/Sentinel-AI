import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ScanHistoryItem, ThreatLevel } from '../types';

interface HistoryChartProps {
  history: ScanHistoryItem[];
}

const COLORS = {
  [ThreatLevel.SAFE]: '#10b981', // Emerald 500
  [ThreatLevel.SUSPICIOUS]: '#f59e0b', // Amber 500
  [ThreatLevel.MALICIOUS]: '#f43f5e', // Rose 500
  [ThreatLevel.UNKNOWN]: '#64748b', // Slate 500
};

export const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  const data = React.useMemo(() => {
    const counts = {
      [ThreatLevel.SAFE]: 0,
      [ThreatLevel.SUSPICIOUS]: 0,
      [ThreatLevel.MALICIOUS]: 0,
      [ThreatLevel.UNKNOWN]: 0,
    };

    history.forEach(item => {
      counts[item.result.verdict]++;
    });

    return [
      { name: 'Safe', value: counts[ThreatLevel.SAFE], color: COLORS[ThreatLevel.SAFE] },
      { name: 'Suspicious', value: counts[ThreatLevel.SUSPICIOUS], color: COLORS[ThreatLevel.SUSPICIOUS] },
      { name: 'Malicious', value: counts[ThreatLevel.MALICIOUS], color: COLORS[ThreatLevel.MALICIOUS] },
    ].filter(d => d.value > 0);
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 border border-slate-700 rounded-xl bg-slate-800/50">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Threat Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};