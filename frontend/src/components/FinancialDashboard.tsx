import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, DollarSign, PieChart as PieIcon, Activity } from "lucide-react";

interface FinancialDashboardProps {
  data: any;
  loading: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function FinancialDashboard({ data, loading }: FinancialDashboardProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-sm border border-border border-dashed">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-foreground">Extracting Financial Analytics...</p>
        <p className="text-[10px] text-muted-foreground">Identifying Revenue, Margins, and Debt levels from report.</p>
      </div>
    );
  }

  if (!data || !data.fiscal_years) {
    return (
      <div className="p-10 text-center bg-muted/5 rounded-sm border border-border">
        <p className="text-sm text-muted-foreground">Financial data tables not found in extracted pages.</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.fiscal_years.map((year: any, index: number) => ({
    name: year.toString(),
    revenue: data.revenue[index] || 0,
    netIncome: data.net_income[index] || 0,
    fcf: data.free_cash_flow[index] || 0,
    ocf: data.operating_cash_flow[index] || 0,
    margin: (data.gross_margin[index] * 100) || 0,
    debt: data.total_debt[index] || 0,
  })).reverse(); // Show chronological order

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Latest Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              ${(data.revenue[0] / 1000).toFixed(1)}B
            </div>
            <p className="text-[10px] text-emerald-500 mt-1 flex items-center">
              +{( ((data.revenue[0] - data.revenue[1]) / data.revenue[1]) * 100 ).toFixed(1)}% YoY
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center">
              <Activity className="w-3 h-3 mr-1" /> Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {(data.gross_margin[0] * 100).toFixed(1)}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Efficiency Metric</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center">
              <DollarSign className="w-3 h-3 mr-1" /> Free Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              ${(data.free_cash_flow[0] / 1000).toFixed(1)}B
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Liquidity Position</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center">
              <PieIcon className="w-3 h-3 mr-1" /> Debt to Equity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {(data.total_debt[0] / data.shareholders_equity[0]).toFixed(2)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Leverage Ratio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Net Income Chart */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Revenue vs. Net Income History
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}B`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netIncome" name="Net Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Flow Comparison */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Operating vs. Free Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOcf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="ocf" name="Operating Cash Flow" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOcf)" />
                <Line type="monotone" dataKey="fcf" name="Free Cash Flow" stroke="#f59e0b" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Segment */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Revenue by Business Segment
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="name"
                  fontSize={10}
                >
                  {data.segments.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Debt Levels */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Total Debt Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                <Line type="stepAfter" dataKey="debt" name="Total Long-Term Debt" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
