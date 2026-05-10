import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { Target, TrendingUp, Plus, Calendar } from 'lucide-react';
import { formatUSD } from '../../utils/formatCurrency';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 10000, current: 4500, date: 'Dec 2026' },
    { id: 2, name: 'New Car', target: 25000, current: 8000, date: 'May 2027' },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-chase-navy">Savings Goals</h1>
          <p className="text-gray-500">Plan and save for what matters most</p>
        </div>
        <Button>
          <Plus size={18} className="mr-2" />
          Create Goal
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chase-light text-chase-blue rounded-lg">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-chase-navy text-lg">{goal.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      Target: {goal.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-chase-blue">{progress.toFixed(0)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-bold text-chase-navy">{formatUSD(goal.current)} / {formatUSD(goal.target)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chase-blue rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1">Add Funds</Button>
                <Button variant="ghost" className="flex-1">Manage</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoals;
