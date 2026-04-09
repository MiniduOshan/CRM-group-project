import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle,
  AlertTriangle,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { InventoryItem } from '../types';

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Aluminum Profile A', category: 'Hardware', unit: 'Meters', costPrice: 15.50, sellingPrice: 25.00, stockLevel: 12 },
  { id: '2', name: 'Granite Top - Black', category: 'Surfaces', unit: 'SqFt', costPrice: 45.00, sellingPrice: 85.00, stockLevel: 2 },
  { id: '3', name: 'Hinge Soft-Close', category: 'Hardware', unit: 'Pieces', costPrice: 2.50, sellingPrice: 6.00, stockLevel: 45 },
  { id: '4', name: 'Plywood 18mm', category: 'Wood', unit: 'Sheets', costPrice: 35.00, sellingPrice: 55.00, stockLevel: 28 },
];

export default function Inventory() {
  const [items] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Inventory & Stock</h2>
          <p className="text-gray-500 text-sm">Manage your materials and production stock.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors justify-center">
            <ArrowDownCircle size={18} className="text-green-600" />
            Add Stock
          </button>
          <button className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors justify-center">
            <Plus size={18} />
            Register Item
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl border border-brand-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-brand-accent">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-bold">142</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-brand-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-brand-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recent GRNs</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-brand-line shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-brand-line">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Cost Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Selling Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-mono text-gray-500">${item.costPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-mono font-bold text-brand-ink">${item.sellingPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-700">
                        {item.stockLevel}
                      </span>
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '50%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.unit}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}