import React, { useState } from 'react';
import { 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RefreshCw, 
  Download, 
  AlertTriangle,
  Plus,
  HardDrive
} from 'lucide-react';

export default function SettingsView({ 
  habits, 
  onRenameHabit, 
  onDeleteHabit, 
  onResetData, 
  onAddHabit
}) {
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');

  // Quick Add Habit States
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickCategory, setQuickCategory] = useState('FITNESS');
  const [quickError, setQuickError] = useState('');

  // Delete Confirmation Dialog State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const habitToDelete = habits.find(h => h.id === confirmDeleteId);


  // Edit Habit Handlers
  const startEditing = (habit) => {
    setEditingHabitId(habit.id);
    setEditName(habit.name);
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
    setEditName('');
    setEditError('');
  };

  const saveRename = (habitId) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Name cannot be empty');
      return;
    }
    
    const duplicate = habits.find(h => h.name.toLowerCase() === trimmed.toLowerCase() && h.id !== habitId);
    if (duplicate) {
      setEditError('Habit name already exists');
      return;
    }

    onRenameHabit(habitId, trimmed);
    setEditingHabitId(null);
    setEditName('');
    setEditError('');
  };

  // Quick Add Handlers
  const handleQuickAdd = () => {
    const nameTrimmed = quickName.trim();
    if (!nameTrimmed) {
      setQuickError('Name cannot be empty');
      return;
    }

    const duplicate = habits.find(h => h.name.toLowerCase() === nameTrimmed.toLowerCase());
    if (duplicate) {
      setQuickError('Habit already exists');
      return;
    }

    onAddHabit(nameTrimmed, quickCategory);
    setQuickName('');
    setQuickCategory('FITNESS');
    setQuickError('');
    setIsQuickAdding(false);
  };

  // Export Data Handler
  const exportData = () => {
    const data = {
      habits: JSON.parse(localStorage.getItem('habitflow_habits') || '[]'),
      completions: JSON.parse(localStorage.getItem('habitflow_completions') || '{}'),
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `habitflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-gray-100">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your habits and data
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Manage Habits List (2/3 width) */}
        <div className="lg:col-span-8 bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-level-1">
          <div className="px-5 py-4 border-b border-dark-border bg-dark-sidebar/40">
            <h3 className="text-sm font-bold text-gray-200 font-display uppercase tracking-wider">
              Manage Habits
            </h3>
          </div>

          <div className="divide-y divide-dark-border">
            {habits.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No habits configured yet.
              </div>
            ) : (
              habits.map((habit) => {
                const isEditing = editingHabitId === habit.id;
                const categoryLabel = (habit.category || 'GROWTH').toUpperCase();

                return (
                  <div 
                    key={habit.id} 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-dark-sidebar/10 transition-colors"
                  >
                    {isEditing ? (
                      /* Edit Input Form */
                      <div className="flex-1">
                        <div className="flex items-center gap-2 max-w-md w-full">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              if (editError) setEditError('');
                            }}
                            className="w-full px-3.5 py-2 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:border-brand-500 font-sans"
                          />
                          <button
                            onClick={() => saveRename(habit.id)}
                            className="p-2.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500 hover:text-dark-bg rounded-xl transition-all cursor-pointer"
                            title="Save Changes"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2.5 bg-dark-hover text-gray-400 hover:bg-dark-border border border-dark-border/40 rounded-xl transition-all cursor-pointer"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {editError && (
                          <p className="text-red-400 text-[10px] mt-1 font-semibold">{editError}</p>
                        )}
                      </div>
                    ) : (
                      /* Display Title & Category Tag */
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-200 text-[13px] font-display">
                          {habit.name}
                        </span>
                        <span className="text-[9px] text-gray-500 font-extrabold tracking-widest uppercase font-display">
                          {categoryLabel}
                        </span>
                      </div>
                    )}

                    {/* Edit/Delete Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(habit)}
                          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-hover rounded-xl border border-transparent hover:border-dark-border transition-all cursor-pointer"
                          title="Rename Habit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(habit.id)}
                          className="p-2 text-red-400/80 hover:text-red-400 hover:bg-red-950/20 rounded-xl border border-transparent hover:border-red-950/40 transition-all cursor-pointer"
                          title="Delete Habit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Dash border Quick Add input / trigger */}
            <div className="p-4 bg-dark-sidebar/10">
              {isQuickAdding ? (
                <div className="space-y-3 p-3 bg-dark-bg/60 border border-dark-border rounded-2xl">
                  <div className="flex flex-col sm:flex-row gap-3">
                    
                    {/* Inline Name Input */}
                    <input
                      type="text"
                      placeholder="Habit name..."
                      value={quickName}
                      onChange={(e) => {
                        setQuickName(e.target.value);
                        if (quickError) setQuickError('');
                      }}
                      className="flex-1 px-3.5 py-2 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-xs focus:outline-none focus:border-brand-500 font-sans"
                    />

                    <select
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                      className="px-3.5 py-2 bg-dark-bg border border-dark-border rounded-xl text-gray-300 text-xs focus:outline-none focus:border-brand-500 font-sans cursor-pointer"
                    >
                      <option value="FITNESS">Fitness</option>
                      <option value="GROWTH">Growth</option>
                      <option value="MIND">Mind</option>
                      <option value="LEARN">Learn</option>
                      <option value="PROJECT">Project</option>
                    </select>

                    {/* Inline Save / Cancel buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleQuickAdd}
                        className="px-3 py-2 bg-brand-500 hover:bg-brand-400 text-dark-bg font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
                      >
                        <Check size={12} strokeWidth={3.5} />
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setIsQuickAdding(false);
                          setQuickName('');
                          setQuickError('');
                        }}
                        className="p-2 bg-dark-hover border border-dark-border/40 text-gray-400 hover:bg-dark-border rounded-xl cursor-pointer transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>

                  </div>
                  {quickError && (
                    <p className="text-red-400 text-[10px] font-semibold pl-1">{quickError}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsQuickAdding(true)}
                  className="w-full py-3.5 border-2 border-dashed border-dark-border hover:border-brand-500/40 text-gray-500 hover:text-brand-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer select-none"
                >
                  <Plus size={14} strokeWidth={3} />
                  Quick Add New Habit
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Storage utilities (1/3 width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Data & Storage Utilities */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-3xl shadow-level-1 flex flex-col gap-4">
            
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl">
                <HardDrive size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Data & Storage
              </h4>
            </div>

            <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
              Manage database settings and backups.
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              
              {/* Backup Export */}
              <button
                onClick={exportData}
                className="w-full flex items-center gap-2.5 p-3.5 bg-dark-bg border border-dark-border hover:border-gray-500 rounded-2xl text-xs font-bold text-gray-300 transition-all cursor-pointer"
              >
                <Download size={14} className="text-brand-500" />
                Backup Export (JSON)
              </button>

              {/* Wipe & Reset All */}
              <button
                onClick={onResetData}
                className="w-full flex items-center gap-2.5 p-3.5 bg-red-950/10 border border-red-900/20 hover:border-red-650 rounded-2xl text-xs font-bold text-red-400 hover:text-red-305 transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                Wipe & Reset App
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && habitToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div 
            className="w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-950/30 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-base font-bold text-gray-100 font-display">Delete Habit?</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Are you absolutely sure you want to delete <strong className="text-gray-200">"{habitToDelete.name}"</strong>? 
                This will permanently erase all completed checkmarks and history.
              </p>
            </div>
            
            <div className="bg-dark-sidebar/40 border-t border-dark-border p-3.5 px-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider font-display border border-dark-border/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteHabit(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider font-display"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
