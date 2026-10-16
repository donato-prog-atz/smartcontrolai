import React, { useState, useMemo } from 'react';
import { Device, Room, TimePeriod, TariffConfig } from '../types';
import {
  Zap,
  TrendingUp,
  DollarSign,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Lightbulb,
  Thermometer,
  Tv,
  Radio,
  Plug,
  Lock,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Flame,
} from 'lucide-react';

interface EnergyAnalyticsViewProps {
  devices: Device[];
  rooms: Room[];
  tariff: TariffConfig;
  onOpenTariffModal: () => void;
  onToggleDevice: (deviceId: string) => void;
  onSelectDevice: (device: Device) => void;
}

type SortField = 'kwh' | 'cost' | 'hours' | 'power' | 'name';
type SortOrder = 'desc' | 'asc';

export const EnergyAnalyticsView: React.FC<EnergyAnalyticsViewProps> = ({
  devices,
  rooms,
  tariff,
  onOpenTariffModal,
  onToggleDevice,
  onSelectDevice,
}) => {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('kwh');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Compute energy data for each device for the selected period
  const processedDevices = useMemo(() => {
    return devices.map((dev) => {
      let kwh = 0;
      let activeHours = 0;

      switch (period) {
        case '24h':
          kwh = dev.energy.hourly.reduce((acc, h) => acc + h.kwh, 0);
          activeHours = dev.energy.activeHoursToday;
          break;
        case '7d':
          kwh = dev.energy.daily.reduce((acc, d) => acc + d.kwh, 0);
          activeHours = dev.energy.activeHoursWeek;
          break;
        case '30d':
          // Estimate from daily average or last month
          const monthData = dev.energy.monthly[dev.energy.monthly.length - 1];
          kwh = monthData ? monthData.kwh : dev.energy.daily.reduce((acc, d) => acc + d.kwh, 0) * 4.3;
          activeHours = dev.energy.activeHoursMonth;
          break;
        case '12m':
          kwh = dev.energy.monthly.reduce((acc, m) => acc + m.kwh, 0);
          activeHours = dev.energy.activeHoursYear;
          break;
      }

      const cost = parseFloat((kwh * tariff.ratePerKwh).toFixed(2));
      const room = rooms.find((r) => r.id === dev.roomId);

      return {
        ...dev,
        roomName: room?.name || 'Geral',
        periodKwh: parseFloat(kwh.toFixed(2)),
        periodCost: cost,
        periodActiveHours: activeHours,
      };
    });
  }, [devices, rooms, period, tariff]);

  // Aggregate totals
  const totalPeriodKwh = useMemo(() => {
    return processedDevices.reduce((acc, d) => acc + d.periodKwh, 0);
  }, [processedDevices]);

  const totalPeriodCost = useMemo(() => {
    return processedDevices.reduce((acc, d) => acc + d.periodCost, 0);
  }, [processedDevices]);

  const highestConsumer = useMemo(() => {
    if (processedDevices.length === 0) return null;
    return [...processedDevices].sort((a, b) => b.periodKwh - a.periodKwh)[0];
  }, [processedDevices]);

  // Filter and sort items for the table
  const filteredAndSortedDevices = useMemo(() => {
    return processedDevices
      .filter((d) => {
        if (selectedRoomFilter !== 'all' && d.roomId !== selectedRoomFilter) return false;
        if (selectedCategoryFilter !== 'all' && d.type !== selectedCategoryFilter) return false;
        if (
          searchQuery.trim() &&
          !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !d.roomName.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a.periodKwh;
        let valB: any = b.periodKwh;

        if (sortField === 'kwh') {
          valA = a.periodKwh;
          valB = b.periodKwh;
        } else if (sortField === 'cost') {
          valA = a.periodCost;
          valB = b.periodCost;
        } else if (sortField === 'hours') {
          valA = a.periodActiveHours;
          valB = b.periodActiveHours;
        } else if (sortField === 'power') {
          valA = a.powerRatingWatts;
          valB = b.powerRatingWatts;
        } else if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [processedDevices, selectedRoomFilter, selectedCategoryFilter, searchQuery, sortField, sortOrder]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Dispositivo',
      'Cômodo',
      'Categoria',
      'Potência Nominal (W)',
      'Horas Ativas',
      'Consumo (kWh)',
      'Custo Estimado (R$)',
      'Eficiência',
      'Status Atual',
    ];

    const rows = filteredAndSortedDevices.map((d) => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.roomName.replace(/"/g, '""')}"`,
      d.type,
      d.powerRatingWatts,
      d.periodActiveHours,
      d.periodKwh,
      d.periodCost.toFixed(2),
      d.energy.efficiencyRating,
      d.isOn ? 'Ligado' : 'Desligado',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `relatorio-energia-googlehome-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Timeline chart points based on period
  interface ChartDataPoint {
    label: string;
    kwh: number;
    isPeak?: boolean;
    date?: string;
  }

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (period === '24h') {
      // 24 hours aggregated
      const sample = devices[0]?.energy.hourly || [];
      return sample.map((h, i) => {
        const totalHourKwh = devices.reduce(
          (acc, dev) => acc + (dev.energy.hourly[i]?.kwh || 0),
          0
        );
        return {
          label: h.hour,
          kwh: parseFloat(totalHourKwh.toFixed(2)),
          isPeak: h.isPeak,
        };
      });
    } else if (period === '7d') {
      const sample = devices[0]?.energy.daily || [];
      return sample.map((d, i) => {
        const totalDayKwh = devices.reduce(
          (acc, dev) => acc + (dev.energy.daily[i]?.kwh || 0),
          0
        );
        return {
          label: d.dayName,
          kwh: parseFloat(totalDayKwh.toFixed(1)),
          date: d.date,
          isPeak: false,
        };
      });
    } else if (period === '30d') {
      // Create 4 weekly buckets or 15 two-day steps
      const days = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      return days.map((weekName, idx) => {
        const factor = [0.23, 0.26, 0.24, 0.27][idx];
        return {
          label: weekName,
          kwh: parseFloat((totalPeriodKwh * factor).toFixed(1)),
          isPeak: false,
        };
      });
    } else {
      // 12 months
      const sample = devices[0]?.energy.monthly || [];
      return sample.map((m, i) => {
        const totalMonthKwh = devices.reduce(
          (acc, dev) => acc + (dev.energy.monthly[i]?.kwh || 0),
          0
        );
        return {
          label: m.month,
          kwh: parseFloat(totalMonthKwh.toFixed(1)),
          isPeak: false,
        };
      });
    }
  }, [devices, period, totalPeriodKwh]);

  const maxChartKwh = Math.max(...chartData.map((c) => c.kwh), 1);

  // Render device mini icon
  const renderIcon = (type: string) => {
    switch (type) {
      case 'light':
        return <Lightbulb className="w-4 h-4 text-amber-300" />;
      case 'climate':
        return <Thermometer className="w-4 h-4 text-sky-300" />;
      case 'media':
        return <Tv className="w-4 h-4 text-indigo-300" />;
      case 'plug':
        return <Plug className="w-4 h-4 text-emerald-300" />;
      case 'security':
        return <Lock className="w-4 h-4 text-rose-300" />;
      case 'vacuum':
        return <Sparkles className="w-4 h-4 text-purple-300" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Period Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Análise e Histórico de Consumo Elétrico
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Métricas detalhadas de telemetria por período, cálculo de fatura em {tariff.currency} e ranking de aparelhos.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#092231] border border-white/10 self-stretch md:self-auto overflow-x-auto">
          {[
            { id: '24h', label: 'Hoje (24h)' },
            { id: '7d', label: '7 Dias' },
            { id: '30d', label: '30 Dias (Mês)' },
            { id: '12m', label: 'Ano Vigente' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as TimePeriod)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                period === p.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Consumo Total */}
        <div className="p-4 rounded-2xl bg-[#092231]/80 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Consumo Total</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {totalPeriodKwh.toFixed(1)} <span className="text-sm font-normal text-emerald-300">kWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {period === '24h' ? 'Últimas 24 horas' : period === '7d' ? 'Na última semana' : period === '30d' ? 'Média mensal estimada' : 'Acumulado no ano'}
          </div>
        </div>

        {/* Card 2: Custo Estimado */}
        <div className="p-4 rounded-2xl bg-[#092231]/80 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Custo Estimado</span>
            <button
              onClick={onOpenTariffModal}
              title="Ajustar Tarifa"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono tabular-nums tracking-tight">
            {tariff.currency} {totalPeriodCost.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Tarifa: {tariff.currency} {tariff.ratePerKwh.toFixed(2)}/kWh</span>
            <button
              onClick={onOpenTariffModal}
              className="text-emerald-400 hover:underline text-[10px]"
            >
              Configurar
            </button>
          </div>
        </div>

        {/* Card 3: Média Diária */}
        <div className="p-4 rounded-2xl bg-[#092231]/80 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Média por Dia</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {tariff.currency}{' '}
            {(
              totalPeriodCost / (period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 365)
            ).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ~
            {(
              totalPeriodKwh / (period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 365)
            ).toFixed(1)}{' '}
            kWh / dia
          </div>
        </div>

        {/* Card 4: Maior Consumidor */}
        <div className="p-4 rounded-2xl bg-[#092231]/80 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Maior Consumidor</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate mt-0.5">
            {highestConsumer ? highestConsumer.name : 'Nenhum'}
          </div>
          <div className="text-[11px] text-amber-300/90 font-mono tabular-nums mt-1">
            {highestConsumer
              ? `${highestConsumer.periodKwh} kWh (${(
                  (highestConsumer.periodKwh / (totalPeriodKwh || 1)) *
                  100
                ).toFixed(0)}% do total)`
              : '-'}
          </div>
        </div>
      </div>

      {/* Visual Chart Strip */}
      <div className="p-5 rounded-2xl bg-[#092231]/70 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Distribuição de Consumo no Período Selecionado
            </h3>
            <span className="text-xs text-slate-400">
              {period === '24h'
                ? 'Consumo horário (barras avermelhadas indicam horário de pico 18h-21h)'
                : 'Progressão de consumo acumulado no intervalo'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400"></span>
              Padrão
            </span>
            {period === '24h' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                Horário de Pico
              </span>
            )}
          </div>
        </div>

        {/* SVG/Tailwind Responsive Bar Chart */}
        <div className="flex items-end gap-1.5 sm:gap-2 h-36 pt-6 px-1">
          {chartData.map((item, index) => {
            const heightPercent = Math.max(10, (item.kwh / maxChartKwh) * 100);

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
              >
                {/* Hover Tooltip */}
                <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/20 px-2 py-1 rounded-md text-[10px] text-white whitespace-nowrap z-20 pointer-events-none shadow-lg font-mono tabular-nums">
                  {item.kwh} kWh ({tariff.currency} {(item.kwh * tariff.ratePerKwh).toFixed(2)})
                </div>

                <div
                  className={`w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 ${
                    item.isPeak
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                      : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                <span className="text-[10px] text-slate-400 font-mono tracking-tight group-hover:text-white truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Table Toolbar: Search, Filters, CSV Export */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar dispositivo ou cômodo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#092231] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Room */}
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-[#092231] border border-white/10 text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="all">Todos os Cômodos</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Filter by Category */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-[#092231] border border-white/10 text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="all">Todas Categorias</option>
              <option value="climate">Climatização</option>
              <option value="light">Iluminação</option>
              <option value="media">Multimídia</option>
              <option value="appliance">Eletrodomésticos</option>
              <option value="plug">Tomadas</option>
              <option value="vacuum">Aspiradores</option>
              <option value="security">Segurança</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors whitespace-nowrap"
              title="Baixar planilha CSV com todos os dados"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* THE MAIN ENERGY CONSUMPTION TABLE */}
        <div className="rounded-2xl border border-white/10 bg-[#071d2b]/80 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#051622]/90 text-slate-400 uppercase tracking-wider font-semibold">
                  <th
                    onClick={() => handleSortToggle('name')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Dispositivo</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Cômodo</th>
                  <th
                    onClick={() => handleSortToggle('power')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors hidden md:table-cell text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Potência Nominal</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('hours')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors hidden lg:table-cell text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Tempo em Uso</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('kwh')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Consumo</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">
                    Participação (%)
                  </th>
                  <th
                    onClick={() => handleSortToggle('cost')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Custo Estimado</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">Selo</th>
                  <th className="py-3.5 px-4 text-center">Status / Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredAndSortedDevices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Nenhum dispositivo encontrado para os filtros selecionados.
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setSelectedRoomFilter('all');
                            setSelectedCategoryFilter('all');
                            setSearchQuery('');
                          }}
                          className="text-xs text-emerald-400 underline hover:text-emerald-300"
                        >
                          Limpar todos os filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedDevices.map((dev) => {
                    const sharePercent = (
                      (dev.periodKwh / (totalPeriodKwh || 1)) *
                      100
                    ).toFixed(1);

                    return (
                      <tr
                        key={dev.id}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* Device Name + Category */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onSelectDevice(dev)}
                            className="flex items-center gap-2.5 text-left group-hover:text-emerald-300 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                              {renderIcon(dev.type)}
                            </div>
                            <div>
                              <div className="font-semibold text-white leading-tight">
                                {dev.name}
                              </div>
                              <div className="text-[10px] text-slate-400 capitalize sm:hidden">
                                {dev.roomName}
                              </div>
                            </div>
                          </button>
                        </td>

                        {/* Room */}
                        <td className="py-3 px-4 hidden sm:table-cell text-slate-300">
                          {dev.roomName}
                        </td>

                        {/* Nominal Watts */}
                        <td className="py-3 px-4 text-right hidden md:table-cell font-mono tabular-nums text-slate-300">
                          {dev.powerRatingWatts} W
                        </td>

                        {/* Active Hours */}
                        <td className="py-3 px-4 text-right hidden lg:table-cell font-mono tabular-nums text-slate-300">
                          {dev.periodActiveHours}h
                        </td>

                        {/* Energy kWh */}
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-white">
                          {dev.periodKwh}{' '}
                          <span className="text-[10px] font-normal text-slate-400">kWh</span>
                        </td>

                        {/* Share Bar */}
                        <td className="py-3 px-4 hidden sm:table-cell min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/30 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                                style={{ width: `${Math.min(100, Math.max(2, Number(sharePercent)))}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono tabular-nums text-slate-400 w-8 text-right">
                              {sharePercent}%
                            </span>
                          </div>
                        </td>

                        {/* Estimated Cost */}
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-300">
                          {tariff.currency} {dev.periodCost.toFixed(2)}
                        </td>

                        {/* Efficiency Badge */}
                        <td className="py-3 px-4 text-center hidden md:table-cell">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-teal-300">
                            {dev.energy.efficiencyRating}
                          </span>
                        </td>

                        {/* Quick Action Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onToggleDevice(dev.id)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                              dev.isOn
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {dev.isOn ? 'Ligado' : 'Desligado'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Smart Recommendations Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#092231]/90 to-[#0c3138]/90 border border-emerald-500/20 shadow-lg">
        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Dicas de Otimização e Economia Google Home
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <span className="font-semibold text-white block mb-0.5">
              Climatização Inteligente
            </span>
            O Ar-Condicionado é responsável pela maior parcela do consumo residencial. Ajustar a temperatura de 21°C para 23°C no modo Eco economiza aproximadamente 12% na fatura mensal.
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <span className="font-semibold text-white block mb-0.5">
              Eliminação de Cargas Fantasma (Standby)
            </span>
            Seus aparelhos em modo de espera consomem cerca de 18 Watts continuamente. Ativar a rotina "Sair de Casa" desativa tomadas secundárias automaticamente quando ninguém está no local.
          </div>
        </div>
      </div>
    </div>
  );
};
