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
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">Settings</h2>
        <p className="text-brand-text font-medium text-sm mt-1">Configure account, security, notifications, and workspace preferences.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 card !p-6 space-y-8">
          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-2 mb-4 text-brand-ink"><UserCircle2 size={18} className="text-brand-accent" /> Account</h3>
            <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Company Name</label>
            <input
              value={settings.companyName}
              onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))}
              className="mt-1 input-field !py-2.5"
            />
          </div>

          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-2 mb-4 text-brand-ink"><Bell size={18} className="text-brand-accent" /> Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between card !p-4 bg-brand-subtle hover:border-brand-accent/20 cursor-pointer transition-colors border">
                <span className="text-sm font-semibold text-brand-ink">Email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="w-4 h-4 rounded border-brand-line text-brand-ink focus:ring-brand-ink"
                />
              </label>
              <label className="flex items-center justify-between card !p-4 bg-brand-subtle hover:border-brand-accent/20 cursor-pointer transition-colors border">
                <span className="text-sm font-semibold text-brand-ink">SMS notifications</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smsNotifications: e.target.checked }))}
                  className="w-4 h-4 rounded border-brand-line text-brand-ink focus:ring-brand-ink"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-2 mb-4 text-brand-ink"><ShieldCheck size={18} className="text-brand-accent" /> Security</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between card !p-4 bg-brand-subtle hover:border-brand-accent/20 cursor-pointer transition-colors border">
                <span className="text-sm font-semibold text-brand-ink">Enable two-factor authentication</span>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))}
                  className="w-4 h-4 rounded border-brand-line text-brand-ink focus:ring-brand-ink"
                />
              </label>
              <div className="card !p-4 bg-brand-subtle border">
                <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Session timeout (minutes)</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                  className="mt-1.5 input-field !py-2 bg-white"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <aside className="card !p-6 space-y-5 h-fit">
          <h3 className="text-sm font-extrabold flex items-center gap-2 text-brand-ink"><Palette size={18} className="text-brand-accent" /> Interface</h3>
          <label className="flex items-center justify-between card !p-4 bg-brand-subtle hover:border-brand-accent/20 cursor-pointer transition-colors border">
            <span className="text-sm font-semibold text-brand-ink">Dark sidebar theme</span>
            <input
              type="checkbox"
              checked={settings.darkSidebar}
              onChange={(e) => setSettings((prev) => ({ ...prev, darkSidebar: e.target.checked }))}
              className="w-4 h-4 rounded border-brand-line text-brand-ink focus:ring-brand-ink"
            />
          </label>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-800 shadow-sm">
            Security tip: keep two-factor authentication enabled for admin and finance roles.
          </div>

          <button className="w-full btn-primary flex justify-center items-center gap-2">
            <Save size={18} /> Save Settings
          </button>

          <button className="w-full btn-secondary flex justify-center items-center gap-2">
            <Lock size={18} /> Change Password
          </button>
        </aside>
      </section>
    </div>
  );
}
