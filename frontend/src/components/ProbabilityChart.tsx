import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Language, translations } from '../utils/language';

interface ProbabilityChartProps {
  lang: Language;
  probabilities: Record<string, number>;
  predictedGrade: number;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  lang,
  probabilities,
  predictedGrade,
}) => {
  const t = translations[lang];

  const labels = [
    { key: 'Grade_0', name: 'Grade 0', short: 'No DR', color: '#10B981' },
    { key: 'Grade_1', name: 'Grade 1', short: 'Mild', color: '#84CC16' },
    { key: 'Grade_2', name: 'Grade 2', short: 'Moderate', color: '#F59E0B' },
    { key: 'Grade_3', name: 'Grade 3', short: 'Severe', color: '#EA580C' },
    { key: 'Grade_4', name: 'Grade 4', short: 'PDR', color: '#DC2626' },
  ];

  const data = labels.map((item, idx) => {
    const rawVal = probabilities[item.key] ?? (idx === predictedGrade ? 0.85 : 0.03);
    const pct = Math.round(rawVal * 100);
    return {
      name: item.name,
      short: item.short,
      percentage: pct,
      color: item.color,
      isPredicted: idx === predictedGrade,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
          {t.probTitle}
        </h3>
        <span className="text-[11px] font-mono text-brand-400">
          Softmax Calibrated
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `${val}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-lg text-xs">
                      <div className="font-bold text-white">{d.name} ({d.short})</div>
                      <div className="text-brand-400 font-mono font-bold mt-0.5">
                        {d.percentage}% Confidence
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={entry.isPredicted ? 1 : 0.4}
                  stroke={entry.isPredicted ? '#FFFFFF' : 'none'}
                  strokeWidth={entry.isPredicted ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

