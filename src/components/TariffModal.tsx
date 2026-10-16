import React, { useState } from 'react';
import { TariffConfig } from '../types';
import { X, DollarSign, Save } from 'lucide-react';

interface TariffModalProps {
  tariff: TariffConfig;
  onClose: () => void;
  onSave: (tariff: TariffConfig) => void;
}

export const TariffModal: React.FC<TariffModalProps> = ({ tariff, onClose, onSave }) => {
  const [rate, setRate] = useState(tariff.ratePerKwh.toString());
  const [currency, setCurrency] = useState(tariff.currency);
  const [peakMultiplier, setPeakMultiplier] = useState(
    tariff.peakRateMultiplier.toString()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(rate);
    const parsedMultiplier = parseFloat(peakMultiplier);

    if (isNaN(parsedRate) || parsedRate <= 0) return;

    onSave({
      ratePerKwh: parsedRate,
      currency: currency.trim() || 'R$',
      peakRateMultiplier: isNaN(parsedMultiplier) ? 1.4 : parsedMultiplier,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-[#092233] border border-emerald-500/30 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Configurar Tarifa de Energia
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Valor do kWh (ex: R$ 0,82 / kWh)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Consulte sua última fatura de energia elétrica (ex: Enel, Cemig, Copel, CPFL).
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Multiplicador Horário de Pico (Bandeira Vermelha/Pico)
            </label>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="3.0"
              value={peakMultiplier}
              onChange={(e) => setPeakMultiplier(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Símbolo da Moeda
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Tarifa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
