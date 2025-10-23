"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Chart configuration
const chartConfig = {
  planned: {
    label: "Planned",
    color: "hsl(var(--chart-1))",
  },
  inProgress: {
    label: "In Progress", 
    color: "hsl(var(--chart-2))",
  },
  delivered: {
    label: "Delivered",
    color: "hsl(var(--chart-3))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-4))",
  },
};

interface MonthlyGrowthData {
  month: string;
  count: number;
  planned: number;
  inProgress: number;
  delivered: number;
}

interface CityGrowthData {
  [key: string]: {
    total: number;
    planned: number;
    inProgress: number;
    delivered: number;
  };
}

interface ClientGrowthData {
  [key: string]: {
    total: number;
    planned: number;
    inProgress: number;
    delivered: number;
  };
}

interface DashboardChartsProps {
  monthlyGrowth: MonthlyGrowthData[];
  cityGrowth: CityGrowthData;
  clientGrowth: ClientGrowthData;
}

export function DashboardCharts({ monthlyGrowth, cityGrowth, clientGrowth }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Monthly Growth Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Monthly Growth</h3>
        {monthlyGrowth.length === 0 || monthlyGrowth.every(m => m.count === 0) ? (
          <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-muted-foreground">No shoots found for the last 6 months</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="planned" fill="var(--color-planned)" name="Planned" />
              <Bar dataKey="inProgress" fill="var(--color-inProgress)" name="In Progress" />
              <Bar dataKey="delivered" fill="var(--color-delivered)" name="Delivered" />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      {/* City Growth */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Growth by City</h3>
        {Object.keys(cityGrowth).length === 0 ? (
          <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-muted-foreground">No city data available</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={Object.entries(cityGrowth).slice(0, 6).map(([city, data]) => ({
                    name: city,
                    value: data.total,
                    planned: data.planned,
                    inProgress: data.inProgress,
                    delivered: data.delivered,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(cityGrowth).slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2">
              {Object.entries(cityGrowth).slice(0, 6).map(([city, data]) => (
                <div key={city} className="border rounded-lg p-3">
                  <div className="font-medium text-sm mb-2">{city}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Planned:</span>
                      <span className="font-medium">{data.planned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <span className="font-medium">{data.inProgress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivered:</span>
                      <span className="font-medium">{data.delivered}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>{data.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Growth */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Growth by Client</h3>
        {Object.keys(clientGrowth).length === 0 ? (
          <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-muted-foreground">No client data available</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={Object.entries(clientGrowth).slice(0, 6).map(([client, data]) => ({
              client: client.length > 15 ? client.substring(0, 15) + '...' : client,
              planned: data.planned,
              inProgress: data.inProgress,
              delivered: data.delivered,
              total: data.total,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="client" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line 
                type="monotone" 
                dataKey="planned" 
                stroke="var(--color-planned)" 
                strokeWidth={2}
                name="Planned"
              />
              <Line 
                type="monotone" 
                dataKey="inProgress" 
                stroke="var(--color-inProgress)" 
                strokeWidth={2}
                name="In Progress"
              />
              <Line 
                type="monotone" 
                dataKey="delivered" 
                stroke="var(--color-delivered)" 
                strokeWidth={2}
                name="Delivered"
              />
            </LineChart>
          </ChartContainer>
          <div className="space-y-2">
            {Object.entries(clientGrowth).slice(0, 6).map(([client, data]) => (
              <div key={client} className="border rounded-lg p-3">
                <div className="font-medium text-sm mb-2">{client}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Planned:</span>
                    <span className="font-medium">{data.planned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="font-medium">{data.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="font-medium">{data.delivered}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total:</span>
                    <span>{data.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
