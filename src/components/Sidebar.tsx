import { Map, AlertTriangle, Users, Truck, FileText, Handshake, BarChart2, User } from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tabName: string) => void;
}

export default function Sidebar({ activeTab = 'Operaciones', onSelectTab }: SidebarProps) {
  const menuItems = [
    { name: 'Operaciones', icon: <Map size={20} /> },
    { name: 'Incidentes', icon: <AlertTriangle size={20} /> },
    { name: 'Brigadas', icon: <Users size={20} /> },
    { name: 'Recursos', icon: <Truck size={20} /> },
    { name: 'Instrucciones', icon: <FileText size={20} /> },
    { name: 'Cooperación', icon: <Handshake size={20} /> },
    { name: 'Registro', icon: <BarChart2 size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#1e2329] text-gray-300 flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-2">
          FARO<span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 animate-pulse"></span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Centro de Mando</p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 mt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <li key={item.name} className="px-3">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-[#252b33]'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#2b333c]">
        <div className="flex items-center gap-3 hover:bg-[#252b33] p-2.5 rounded-xl cursor-pointer transition">
          <div className="bg-gray-700/80 p-2 rounded-full text-white">
            <User size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-white font-semibold truncate">Ana • Mando local</p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Operador activo
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}