import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformancePoint {
  month: string;
  predictions: number;
  accuracy: number;
}

interface PerformanceChartProps {
  data: PerformancePoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">AI Predictions Overview</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Predictions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-risk-low" />
            Accuracy %
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 9%)',
                border: '1px solid hsl(222, 47%, 18%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="predictions" 
              stroke="hsl(190, 95%, 50%)" 
              fillOpacity={1} 
              fill="url(#colorPredictions)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="accuracy" 
              stroke="hsl(142, 76%, 45%)" 
              fillOpacity={1} 
              fill="url(#colorAccuracy)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
