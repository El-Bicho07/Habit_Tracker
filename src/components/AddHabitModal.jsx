import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('FITNESS');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Auto-focus the text input when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setHabitName('');
      setCategory('FITNESS');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = habitName.trim();
    if (!trimmed) {
      setError('Habit name cannot be empty');
      return;
    }
    if (trimmed.length > 50) {
      setError('Habit name must be under 50 characters');
      return;
    }
    
    onAdd(trimmed, category);
    setHabitName('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-dark-card border border-dark-border rounded-3xl shadow-level-2 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-sidebar/40">
          <h2 className="text-base font-bold font-display text-gray-200 uppercase tracking-wider">
            Add New Habit
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 rounded-xl hover:bg-dark-hover border border-transparent hover:border-dark-border/40"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Habit Name Input */}
          <div className="space-y-2">
            <label htmlFor="habit-input" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Habit Name
            </label>
            <input
              id="habit-input"
              ref={inputRef}
              type="text"
              placeholder="e.g. Morning run, Read 20 pages"
              value={habitName}
              onChange={(e) => {
                setHabitName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans text-sm"
            />
            {error && (
              <p className="text-red-400 text-[10px] mt-1 font-semibold pl-1" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Category Select Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Category Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {['FITNESS', 'GROWTH', 'MIND', 'LEARN', 'PROJECT'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-center text-xs font-bold transition-all rounded-xl cursor-pointer border flex-1 min-w-[70px] ${
                    category === cat
                      ? 'bg-brand-500 text-dark-bg border-brand-500 shadow-sm shadow-brand-500/10 font-extrabold'
                      : 'border-dark-border text-gray-400 hover:text-gray-250 hover:bg-dark-hover/40 bg-transparent font-semibold'
                  }`}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-dark-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-xl text-xs font-bold transition-all uppercase tracking-wider font-display border border-dark-border/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-500 hover:bg-brand-400 text-dark-bg rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider font-display emerald-glow-sm cursor-pointer"
            >
              Add habit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
