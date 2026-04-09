import { useState } from 'react';
import { Bell, Lock, Palette, Save, ShieldCheck, UserCircle2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'CRM Solutions',
    emailNotifications: true,
    smsNotifications: false,
    darkSidebar: false,
    twoFactorAuth: true,
    sessionTimeout: '30'
  });

  return (
    <div className="p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-500 text-sm">Configure account, security, notifications, and workspace preferences.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-line shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><UserCircle2 size={16} className="text-brand-accent" /> Account</h3>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
            <input
              value={settings.companyName}
              onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))}
              className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Bell size={16} className="text-brand-accent" /> Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50">
                <span className="text-sm text-gray-700">Email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="accent-brand-accent"
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50">
                <span className="text-sm text-gray-700">SMS notifications</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smsNotifications: e.target.checked }))}
                  className="accent-brand-accent"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><ShieldCheck size={16} className="text-brand-accent" /> Security</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50">
                <span className="text-sm text-gray-700">Enable two-factor authentication</span>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))}
                  className="accent-brand-accent"
                />
              </label>
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Session timeout (minutes)</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-xl border border-brand-line shadow-sm p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold flex items-center gap-2"><Palette size={16} className="text-brand-accent" /> Interface</h3>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50">
            <span className="text-sm text-gray-700">Dark sidebar theme</span>
            <input
              type="checkbox"
              checked={settings.darkSidebar}
              onChange={(e) => setSettings((prev) => ({ ...prev, darkSidebar: e.target.checked }))}
              className="accent-brand-accent"
            />
          </label>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
            Security tip: keep two-factor authentication enabled for admin and finance roles.
          </div>

          <button className="w-full bg-brand-accent text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-blue-700 inline-flex items-center justify-center gap-2">
            <Save size={16} /> Save Settings
          </button>

          <button className="w-full border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2">
            <Lock size={16} /> Change Password
          </button>
        </aside>
      </section>
    </div>
  );
}
