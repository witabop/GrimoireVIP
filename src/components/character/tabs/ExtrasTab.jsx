import React from 'react';

const ExtrasTab = ({ value, onChange }) => (
  <div className="space-y-2">
    <p className="text-xs text-slate-400">Freeform notes — anything you want to remember about your character.</p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your notes here..."
      className="w-full min-h-[320px] bg-slate-800 text-slate-200 text-sm rounded-lg border border-slate-600 p-3 resize-y focus:outline-none focus:border-indigo-500 placeholder-slate-600"
    />
  </div>
);

export default ExtrasTab;
