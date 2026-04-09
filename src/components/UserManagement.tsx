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
  Briefcase
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

const initialUsers: StaffUser[] = [
  {
    id: 'u-1',
    name: 'Adele Dias',
    role: 'Manager',
    phone: '0774001223',
    email: 'adele@pantrysolutions.com',
    status: 'Active',
    createdAt: '2024-01-08T09:00:00Z',
    permissions: [...permissionOptions]
  },
  {
    id: 'u-2',
    name: 'Nimal Perera',
    role: 'Sales Person',
    phone: '0779881122',
    email: 'nimal@pantrysolutions.com',
    status: 'Active',
    createdAt: '2024-02-12T10:30:00Z',
    permissions: ['Dashboard', 'Customer Management', 'Quotations']
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<StaffUser[]>(initialUsers);
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

    setUsers((prev) => [user, ...prev]);
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
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-gray-500 text-sm">Manage staff accounts and permissions.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold mt-1 text-gray-700 flex items-center gap-2">
            <Users size={20} className="text-brand-accent" /> {users.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Users</p>
          <p className="text-2xl font-bold mt-1 text-gray-700 flex items-center gap-2">
            <UserCheck size={20} className="text-green-600" /> {activeUsers}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Managers</p>
          <p className="text-2xl font-bold mt-1 text-gray-700 flex items-center gap-2">
            <Briefcase size={20} className="text-amber-600" /> {managerUsers}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-brand-line shadow-sm p-5">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Plus size={16} className="text-brand-accent" /> Add Staff User
        </h3>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
            <input
              required
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => handleRoleChange(e.target.value as StaffUser['role'])}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              <option value="Accountment">Accountment</option>
              <option value="Manager">Manager</option>
              <option value="Sales Person">Sales Person</option>
              <option value="Designer">Designer</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
            <input
              required
              value={newUser.phone}
              onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. 0771234567"
              className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm ${phoneExists ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {phoneExists && <p className="text-xs text-red-600">This phone number already exists.</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
            <input
              required
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="name@company.com"
              className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm ${emailExists ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {emailExists && <p className="text-xs text-red-600">This email already exists.</p>}
          </div>
          <div className="md:col-span-2 space-y-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Permissions (Tick to Allow)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearPermissions}
                  className="text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Selected: {newUser.permissions.length} / {permissionOptions.length}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissionOptions.map((permission) => {
                const checked = newUser.permissions.includes(permission);
                return (
                  <label
                    key={permission}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer ${checked ? 'bg-brand-accent/5 border-brand-accent/30' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(permission)}
                      className="accent-brand-accent"
                    />
                    <span>{permission}</span>
                  </label>
                );
              })}
            </div>
            {newUser.permissions.length === 0 && (
              <p className="text-xs text-red-600">Select at least one permission to create a user.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={newUser.permissions.length === 0 || phoneExists || emailExists}
            className="md:col-span-2 bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create User
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-line">
          <h3 className="text-sm font-bold">Staff Directory</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-brand-line">
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                      {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <UserCog size={14} className="text-gray-400" /> {user.name}
                      </p>
                      <p className="text-[10px] text-gray-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-brand-accent inline-flex items-center gap-1">
                    <ShieldCheck size={12} /> {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone size={12} className="text-gray-400" /> {user.phone}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Mail size={12} className="text-gray-400" /> {user.email}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((permission) => (
                      <span
                        key={`${user.id}-${permission}`}
                        className="px-2 py-1 rounded text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-100 inline-flex items-center gap-1"
                      >
                        <Check size={10} /> {permission}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded text-[10px] font-bold border bg-green-50 text-green-700 border-green-100">
                    {user.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-3">
          {users.map((user) => (
            <div key={`mobile-${user.id}`} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold border bg-green-50 text-green-700 border-green-100">
                  {user.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Phone size={12} className="text-gray-400" /> {user.phone}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Mail size={12} className="text-gray-400" /> {user.email}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {user.permissions.map((permission) => (
                  <span
                    key={`mobile-${user.id}-${permission}`}
                    className="px-2 py-1 rounded text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-100 inline-flex items-center gap-1"
                  >
                    <Check size={10} /> {permission}
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
