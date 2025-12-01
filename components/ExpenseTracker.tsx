
import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { Icons } from './Icon';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Props {
  expenses: Expense[];
  setExpenses: any; // Legacy
}

export const ExpenseTracker: React.FC<Props> = ({ expenses }) => {
  const [amountInput, setAmountInput] = useState<string>('');
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState<'JPY' | 'TWD'>('JPY');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [showTrash, setShowTrash] = useState(false);
  
  const [rate, setRate] = useState(0.215); 
  const [calcYen, setCalcYen] = useState<string>('');
  const [calcTwd, setCalcTwd] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'yen' | 'twd'>('yen');

  const activeExpenses = expenses.filter(ex => !ex.deleted);
  const deletedExpenses = expenses.filter(ex => ex.deleted);

  useEffect(() => {
    if (lastEdited === 'yen' && calcYen) {
        const num = parseFloat(calcYen);
        if (!isNaN(num)) setCalcTwd(Math.round(num * rate).toString());
    } else if (lastEdited === 'twd' && calcTwd) {
        const num = parseFloat(calcTwd);
        if (!isNaN(num)) setCalcYen(Math.round(num / rate).toString());
    }
  }, [rate, calcYen, calcTwd, lastEdited]);

  const handleYenChange = (val: string) => {
    setLastEdited('yen');
    setCalcYen(val);
    if (val === '') {
        setCalcTwd('');
        return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
        setCalcTwd(Math.round(num * rate).toString());
    }
  };

  const handleTwdChange = (val: string) => {
    setLastEdited('twd');
    setCalcTwd(val);
    if (val === '') {
        setCalcYen('');
        return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
        setCalcYen(Math.round(num / rate).toString());
    }
  };
  
  const handleAdd = async () => {
    if (!amountInput || !title) return;
    
    let finalAmountYen = 0;
    const inputVal = parseInt(amountInput);

    if (currency === 'TWD') {
        finalAmountYen = Math.round(inputVal / rate);
    } else {
        finalAmountYen = inputVal;
    }

    finalAmountYen = finalAmountYen * quantityInput;
    const newId = Date.now().toString();

    try {
        await setDoc(doc(db, 'expenses', newId), {
            id: newId,
            title,
            amountYen: finalAmountYen,
            category: 'other',
            payer: 'Me',
            date: new Date().toISOString().split('T')[0],
            quantity: quantityInput,
            deleted: false
        });
        setTitle('');
        setAmountInput('');
        setQuantityInput(1);
    } catch (err) {
        console.error("Error adding expense:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     await updateDoc(doc(db, 'expenses', id), { deleted: true });
  };

  const handleRestore = async (id: string) => {
     await updateDoc(doc(db, 'expenses', id), { deleted: false });
  };

  const handlePermanentDelete = async (id: string) => {
     await deleteDoc(doc(db, 'expenses', id));
  };

  const updateExpenseQuantity = async (id: string, delta: number, expense: Expense) => {
    const currentQty = expense.quantity || 1;
    const newQty = Math.max(1, currentQty + delta);
    
    const unitPrice = expense.amountYen / currentQty;
    const newTotalYen = Math.round(unitPrice * newQty);

    try {
        await updateDoc(doc(db, 'expenses', id), { 
            quantity: newQty, 
            amountYen: newTotalYen 
        });
    } catch (err) {
        console.error("Error updating expense quantity:", err);
    }
  };

  const totalYen = activeExpenses.reduce((acc, curr) => acc + curr.amountYen, 0);
  const totalTwd = Math.round(totalYen * rate);

  return (
    <div className="pb-40 px-5">
      <div className="mb-8 border-b border-wafu-indigo/10 pb-4 mx-1">
        <h2 className="text-3xl font-black font-serif text-wafu-indigo tracking-tight">旅費帳本</h2>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-wafu-darkIndigo to-wafu-indigo rounded-3xl p-6 text-white shadow-2xl mb-8 ring-2 ring-wafu-indigo/50">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4af37' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>

        <div className="relative z-10">
          <h3 className="text-xs text-wafu-goldLight mb-6 font-bold tracking-[0.2em] uppercase flex justify-between items-center border-b border-white/10 pb-2">
            <span>Currency Exchange</span>
            <span className="font-serif text-wafu-gold">為替</span>
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 w-0 min-w-0">
              <label className="text-[10px] text-white/60 block mb-2 font-bold tracking-wide">JPY (円)</label>
              <input 
                type="number" 
                value={calcYen}
                onChange={(e) => handleYenChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xl sm:text-2xl font-mono focus:outline-none focus:bg-white/10 placeholder-white/10 transition-all font-bold text-wafu-goldLight shadow-inner"
                placeholder="0"
              />
            </div>
            <div className="text-2xl text-wafu-gold opacity-80 font-serif pt-6 flex-shrink-0">⇋</div>
            <div className="flex-1 w-0 min-w-0">
              <label className="text-[10px] text-white/60 block mb-2 font-bold tracking-wide">TWD (台幣)</label>
              <input 
                type="number" 
                value={calcTwd}
                onChange={(e) => handleTwdChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xl sm:text-2xl font-mono focus:outline-none focus:bg-white/10 placeholder-white/10 transition-all font-bold text-white shadow-inner"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-[10px] text-white/40 font-mono tracking-wider">Rate:</span>
            <input 
               type="number" 
               value={rate} 
               onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
               step="0.001"
               className="w-16 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-xs text-white text-right focus:outline-none focus:border-wafu-gold"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-washi border border-stone-200 mb-10 relative">
        <div className="absolute inset-0 bg-wafu-paper opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
            <h3 className="font-bold text-wafu-indigo mb-4 font-serif text-lg tracking-wide border-l-4 border-wafu-indigo pl-3">記帳</h3>
            <div className="flex flex-col gap-3 mb-4">
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="項目"
                className="w-full p-3.5 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-wafu-indigo text-base font-serif"
              />
              <div className="flex gap-3">
                 <div className="flex-1 flex relative">
                    <input 
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder={currency === 'JPY' ? '¥ 單價/總價' : 'NT$ 單價/總價'}
                      className="w-full min-w-0 p-3.5 pr-14 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-wafu-indigo font-mono text-base"
                    />
                    <button 
                      onClick={() => setCurrency(currency === 'JPY' ? 'TWD' : 'JPY')}
                      className="absolute right-1 top-1 bottom-1 px-2 rounded-lg bg-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-300 transition-colors active-bounce"
                    >
                      {currency}
                    </button>
                 </div>
                 <div className="w-20 relative flex items-center">
                    <span className="absolute left-2 text-stone-400 text-xs font-bold">x</span>
                    <input 
                      type="number"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-3.5 pl-5 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-wafu-indigo font-mono text-base"
                    />
                 </div>
              </div>
            </div>
            <button 
              onClick={handleAdd}
              className="w-full py-3.5 bg-wafu-indigo text-white rounded-xl font-bold shadow-lg active-bounce active:bg-wafu-darkIndigo transition-all hover:bg-wafu-darkIndigo text-sm tracking-widest"
            >
              新增支出
            </button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {activeExpenses.map(ex => (
          <div key={ex.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-stone-100 transition-transform hover:scale-[1.01] group hover:border-wafu-indigo/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-wafu-paper opacity-30 pointer-events-none"></div>
            <div className="relative z-10 flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full border border-stone-200 text-xl flex items-center justify-center text-wafu-indigo font-serif bg-stone-50 shrink-0">
                ¥
              </div>
              <div className="min-w-0">
                <div className="font-bold text-stone-700 font-serif text-lg truncate pr-2">{ex.title}</div>
                <div className="text-xs text-stone-400 mt-0.5 font-mono">{ex.date}</div>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-4">
               <div className="flex flex-col items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-100">
                  <button onClick={() => updateExpenseQuantity(ex.id, 1, ex)} className="text-stone-400 hover:text-wafu-indigo active-bounce w-4 h-4 flex items-center justify-center font-bold text-[10px]">+</button>
                  <span className="text-[10px] font-bold text-wafu-indigo font-mono">x{ex.quantity || 1}</span>
                  <button onClick={() => updateExpenseQuantity(ex.id, -1, ex)} className="text-stone-400 hover:text-wafu-indigo active-bounce w-4 h-4 flex items-center justify-center font-bold text-[10px]">-</button>
               </div>
               
               <div className="text-right shrink-0 flex flex-col items-end">
                <div className="font-mono font-bold text-wafu-indigo text-lg">¥{ex.amountYen.toLocaleString()}</div>
                <div className="text-xs text-stone-400 mt-0.5 font-medium">≈ NT${Math.round(ex.amountYen * rate).toLocaleString()}</div>
                <button 
                  onClick={(e) => handleDelete(ex.id, e)}
                  className="mt-2 text-stone-300 hover:text-stone-500 active-bounce p-1"
                >
                  <Icons.Trash />
                </button>
               </div>
            </div>
          </div>
        ))}

        {deletedExpenses.length > 0 && (
          <div className="mt-8 px-2">
             <button 
               onClick={() => setShowTrash(!showTrash)}
               className="flex items-center gap-2 text-stone-400 hover:text-wafu-indigo text-xs font-bold uppercase tracking-wider mb-3 transition-colors active-bounce"
             >
                <Icons.Trash />
                <span>已刪除支出 ({deletedExpenses.length})</span>
             </button>
             
             {showTrash && (
               <div className="space-y-3 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                  {deletedExpenses.map(item => (
                    <div key={item.id} className="flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity gap-2">
                       <span className="text-sm text-stone-500 font-serif truncate flex-1">{item.title}</span>
                       <div className="flex gap-1 shrink-0">
                           <button 
                             onClick={() => handleRestore(item.id)}
                             className="text-xs bg-stone-200 hover:bg-wafu-indigo hover:text-white px-2 py-1 rounded-md transition-colors font-bold active-bounce"
                           >
                             復原
                           </button>
                           <button 
                             onClick={() => handlePermanentDelete(item.id)}
                             className="text-xs bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 px-2 py-1 rounded-md transition-colors font-bold active-bounce"
                           >
                             永久刪除
                           </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>

      {activeExpenses.length > 0 && (
          <div className="mt-4 bg-wafu-indigo text-white rounded-2xl p-6 shadow-xl border border-wafu-indigo/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold-leaf opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
             
             <div className="relative z-10">
                 <h4 className="text-xs font-bold text-wafu-goldLight mb-3 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                    <Icons.Wallet />
                    <span>總支出統計</span>
                 </h4>
                 <div className="flex flex-col items-end">
                    <div className="text-4xl font-black font-serif tracking-tight flex items-baseline gap-1">
                       <span className="text-xl font-normal opacity-70">¥</span>
                       <span>{totalYen.toLocaleString()}</span>
                    </div>
                    <div className="text-base font-bold text-wafu-goldLight mt-1 font-mono tracking-wide">
                       ≈ NT$ {totalTwd.toLocaleString()}
                    </div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};
