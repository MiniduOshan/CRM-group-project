import { useState, type FormEvent } from 'react';
import {
  Plus,
  UserCog,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Users,
  UserCheck,
  Briefcase,
  Trash2
} from 'lucide-react';
import { StaffUser, UserPermission } from '../types';

const permissionOptions: UserPermission[] = [
  'Dashboard',
  'Customer Management',
  'Quotations',
  'Site Visits',
  'Inventory',
  'User Management'
];

const defaultStaffPermissions: UserPermission[] = ['Dashboard', 'Customer Management'];

interface UserManagementProps {
  users: StaffUser[];
  onCreateUser: (user: StaffUser) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserManagement({ users, onCreateUser, onDeleteUser }: UserManagementProps) {
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'Sales Person' as StaffUser['role'],
    phone: '',
    email: '',
    permissions: [...defaultStaffPermissions] as UserPermission[]
  });

  const phoneExists = users.some((user) => user.phone === newUser.phone.trim());
  const emailExists = users.some((user) => user.email.toLowerCase() === newUser.email.trim().toLowerCase());

  const activeUsers = users.filter((user) => user.status === 'Active').length;
  const managerUsers = users.filter((user) => user.role === 'Manager').length;

  const togglePermission = (permission: UserPermission) => {
    setNewUser((prev) => {
      const hasPermission = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter((item) => item !== permission)
          : [...prev.permissions, permission]
      };
    });
  };

  const handleRoleChange = (role: StaffUser['role']) => {
    setNewUser((prev) => ({
      ...prev,
      role,
      permissions: role === 'Manager' ? [...permissionOptions] : [...defaultStaffPermissions]
    }));
  };

  const selectAllPermissions = () => {
    setNewUser((prev) => ({ ...prev, permissions: [...permissionOptions] }));
  };

  const clearPermissions = () => {
    setNewUser((prev) => ({ ...prev, permissions: [] }));
  };

  const createUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (phoneExists || emailExists || newUser.permissions.length === 0) {
      return;
    }

    const user: StaffUser = {
      id: `u-${Date.now()}`,
      name: newUser.name.trim(),
      role: newUser.role,
      phone: newUser.phone.trim(),
      email: newUser.email.trim(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      permissions: newUser.permissions
    };

    onCreateUser(user);
    setNewUser({
      name: '',
      role: 'Sales Person',
      phone: '',
      email: '',
      permissions: [...defaultStaffPermissions]
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">User Management</h2>
        <p className="text-brand-text font-medium text-sm mt-1">Manage staff accounts and permissions.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card !p-5">
          <p className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Total Users</p>
          <p className="text-2xl font-black mt-1 text-brand-ink flex items-center gap-2">
            <Users size={20} className="text-brand-accent" /> {users.length}
          </p>
        </div>
        <div className="card !p-5">
          <p className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Active Users</p>
          <p className="text-2xl font-black mt-1 text-brand-ink flex items-center gap-2">
            <UserCheck size={20} className="text-emerald-500" /> {activeUsers}
          </p>
        </div>
        <div className="card !p-5">
          <p className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Managers</p>
          <p className="text-2xl font-black mt-1 text-brand-ink flex items-center gap-2">
            <Briefcase size={20} className="text-amber-500" /> {managerUsers}
          </p>
        </div>
      </section>

      <section className="card !p-6">
        <h3 className="text-sm font-extrabold mb-5 flex items-center gap-2 text-brand-ink">
          <Plus size={16} className="text-brand-accent" /> Add Staff User
        </h3>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Full Name</label>
            <input
              required
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              className="input-field !py-2.5"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => handleRoleChange(e.target.value as StaffUser['role'])}
              className="input-field !py-2.5"
            >
              <option value="Accountment">Accountment</option>
              <option value="Manager">Manager</option>
              <option value="Sales Person">Sales Person</option>
              <option value="Designer">Designer</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Phone Number</label>
            <input
              required
              value={newUser.phone}
              onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. 0771234567"
              className={`input-field !py-2.5 ${phoneExists ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-200' : ''}`}
            />
            {phoneExists && <p className="text-[11px] font-bold text-red-500">This phone number already exists.</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Email</label>
            <input
              required
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="name@company.com"
              className={`input-field !py-2.5 ${emailExists ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-200' : ''}`}
            />
            {emailExists && <p className="text-[11px] font-bold text-red-500">This email already exists.</p>}
          </div>
          <div className="md:col-span-2 space-y-3 pt-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <label className="text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Permissions (Tick to Allow)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="btn-secondary !py-1 !px-2.5 text-[11px]"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearPermissions}
                  className="btn-secondary !py-1 !px-2.5 text-[11px]"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400">Selected: <span className="text-brand-ink">{newUser.permissions.length} / {permissionOptions.length}</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissionOptions.map((permission) => {
                const checked = newUser.permissions.includes(permission);
                return (
                  <label
                    key={permission}
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-sm cursor-pointer transition-all ${checked ? 'bg-brand-accent text-white shadow-md border-transparent' : 'bg-brand-subtle border-brand-line hover:border-slate-300 font-medium text-slate-600'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(permission)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-ink focus:ring-brand-ink"
                    />
                    <span className={checked ? 'font-bold' : ''}>{permission}</span>
                  </label>
                );
              })}
            </div>
            {newUser.permissions.length === 0 && (
              <p className="text-[11px] font-bold text-red-500">Select at least one permission to create a user.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={newUser.permissions.length === 0 || phoneExists || emailExists}
            className="md:col-span-2 btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto md:justify-self-end"
          >
            Create User
          </button>
        </form>
      </section>

      <section className="card !p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-brand-line bg-brand-subtle">
          <h3 className="text-sm font-extrabold text-brand-ink">Staff Directory</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-brand-bg border-b border-brand-line">
              <th className="px-6 py-4 text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">User</th>
              <th className="px-6 py-4 text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Contact</th>
              <th className="px-6 py-4 text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Permissions</th>
              <th className="px-6 py-4 text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-brand-subtle transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand-ink text-xs font-black flex items-center justify-center shadow-sm border border-brand-line">
                      {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-brand-ink flex items-center gap-2">
                        <UserCog size={14} className="text-slate-400" /> {user.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-bold text-brand-accent inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-accent/5 border border-brand-accent/10">
                    <ShieldCheck size={14} /> {user.role}
                  </span>
                </td>
                <td className="px-6 py-5 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {user.phone}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" /> {user.email}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {user.permissions.map((permission) => (
                      <span
                        key={`${user.id}-${permission}`}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-brand-line bg-brand-subtle text-slate-600 inline-flex items-center gap-1"
                      >
                        <Check size={10} className="text-brand-accent" /> {permission}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-[0.05em] uppercase border bg-emerald-50 text-emerald-600 border-emerald-200">
                      {user.status}
                    </span>
                    <button
                      type="button"
                      disabled={user.role === 'Manager'}
                      onClick={() => {
                        if (window.confirm(`Delete user ${user.name}?`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                      title={user.role === 'Manager' ? 'Manager cannot be deleted' : 'Delete user'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-4">
          {users.map((user) => (
            <div key={`mobile-${user.id}`} className="card !p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-brand-line pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand-ink text-xs font-black flex items-center justify-center shadow-sm border border-brand-line">
                      {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-brand-ink">{user.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-[9px] font-black border bg-emerald-50 text-emerald-600 border-emerald-200 uppercase tracking-widest">
                    {user.status}
                  </span>
                  <button
                    type="button"
                    disabled={user.role === 'Manager'}
                    onClick={() => {
                      if (window.confirm(`Delete user ${user.name}?`)) {
                        onDeleteUser(user.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    title={user.role === 'Manager' ? 'Manager cannot be deleted' : 'Delete user'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> {user.phone}
                </p>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" /> {user.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-brand-line">
                {user.permissions.map((permission) => (
                  <span
                    key={`mobile-${user.id}-${permission}`}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-brand-line bg-brand-subtle text-slate-600 inline-flex items-center gap-1"
                  >
                    <Check size={10} className="text-brand-accent" /> {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
