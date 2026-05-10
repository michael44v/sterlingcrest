import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

const USDRatesWidget = () => {
  const rates = [
    { pair: 'USD/NGN', rate: '1,450.00', change: '+2.4%' },
    { pair: 'USD/GBP', rate: '0.79', change: '-0.1%' },
    { pair: 'USD/EUR', rate: '0.92', change: '+0.05%' },
    { pair: 'USD/JPY', rate: '156.40', change: '+0.3%' },
  ];

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Market Rates</h4>
        <TrendingUp size={16} className="text-chase-blue" />
      </div>
      <div className="space-y-3">
        {rates.map((r, i) => (
          <div key={i} className="flex items-center justify-between group cursor-default">
            <span className="text-sm font-bold">{r.pair}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono">{r.rate}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {r.change}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-white/30 tracking-widest uppercase">
        <span>Live updates</span>
        <span className="flex items-center gap-1">View markets <ArrowUpRight size={10} /></span>
      </div>
    </div>
  );
};

export default USDRatesWidget;
