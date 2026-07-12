import React from 'react';
import { StructuredAddress } from '../types';

interface AddressFormProps {
  label: string;
  address: StructuredAddress;
  onChange: (updated: StructuredAddress) => void;
  errors?: Record<string, string>;
}

export default function AddressForm({ label, address, onChange, errors }: AddressFormProps) {
  const updateField = (field: keyof StructuredAddress, value: string) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  const inputClass = (field: string) => `
    w-full bg-slate-50 dark:bg-slate-900 border 
    ${errors?.[field] ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-brand'} 
    rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all
  `;

  const labelClass = "block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="bg-white dark:bg-slate-800/40 p-4 border border-slate-150 dark:border-slate-700/60 rounded-2xl space-y-3">
      <div className="flex justify-between items-center pb-1.5 border-b border-slate-150 dark:border-slate-700/50">
        <h4 className="text-xs font-bold text-brand dark:text-red-400 uppercase tracking-widest">{label}</h4>
        <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase">Structured Format</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Address Line 1 *</label>
          <input
            type="text"
            required
            value={address.line1}
            onChange={(e) => updateField('line1', e.target.value)}
            placeholder="e.g. Unit 4, Block B, Textile Hub"
            className={inputClass('line1')}
          />
          {errors?.line1 && <span className="text-[9px] text-red-500 font-semibold">{errors.line1}</span>}
        </div>

        <div>
          <label className={labelClass}>Address Line 2 (Optional)</label>
          <input
            type="text"
            value={address.line2 || ''}
            onChange={(e) => updateField('line2', e.target.value)}
            placeholder="e.g. Near gate 2 entrance"
            className={inputClass('line2')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Landmark</label>
          <input
            type="text"
            value={address.landmark || ''}
            onChange={(e) => updateField('landmark', e.target.value)}
            placeholder="e.g. Opp Royal Palace"
            className={inputClass('landmark')}
          />
        </div>

        <div>
          <label className={labelClass}>Area / Locality</label>
          <input
            type="text"
            value={address.area || ''}
            onChange={(e) => updateField('area', e.target.value)}
            placeholder="e.g. Ring Road Industrial Zone"
            className={inputClass('area')}
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className={labelClass}>City *</label>
          <input
            type="text"
            required
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="e.g. Surat"
            className={inputClass('city')}
          />
          {errors?.city && <span className="text-[9px] text-red-500 font-semibold">{errors.city}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>District</label>
          <input
            type="text"
            value={address.district || ''}
            onChange={(e) => updateField('district', e.target.value)}
            placeholder="e.g. Surat District"
            className={inputClass('district')}
          />
        </div>

        <div>
          <label className={labelClass}>State *</label>
          <input
            type="text"
            required
            value={address.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="e.g. Gujarat"
            className={inputClass('state')}
          />
          {errors?.state && <span className="text-[9px] text-red-500 font-semibold">{errors.state}</span>}
        </div>

        <div>
          <label className={labelClass}>PIN Code *</label>
          <input
            type="text"
            required
            value={address.pinCode}
            onChange={(e) => updateField('pinCode', e.target.value)}
            placeholder="e.g. 395003"
            className={inputClass('pinCode')}
          />
          {errors?.pinCode && <span className="text-[9px] text-red-500 font-semibold">{errors.pinCode}</span>}
        </div>

        <div>
          <label className={labelClass}>Country *</label>
          <input
            type="text"
            required
            value={address.country}
            onChange={(e) => updateField('country', e.target.value)}
            placeholder="e.g. India"
            className={inputClass('country')}
          />
        </div>
      </div>
    </div>
  );
}
