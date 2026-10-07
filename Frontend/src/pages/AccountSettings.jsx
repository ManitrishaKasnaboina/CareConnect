import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updateMyAccount } from '../api/services';

const AccountSettings = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(() => ({ name: user?.name || '', email: user?.email || '' }));
  const [saving, setSaving] = useState(false);

  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const saveAccount = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateMyAccount(form);
      updateUser(data);
      toast.success('Account settings saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save your account settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={saveAccount} className="max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Account settings</h1>
        <p className="mt-2 text-sm text-slate-500">Update the name and email address associated with your account.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Name
            <input name="name" value={form.name} onChange={updateField} required maxLength="100" autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-primary-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Email address
            <input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-primary-500" />
          </label>
        </div>
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button disabled={saving} className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save settings'}</button>
        </div>
      </div>
    </form>
  );
};

export default AccountSettings;