import { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Warehouse
} from 'lucide-react';

interface ResourceItem {
  id: string;
  name: string;
  category: 'MEDICO' | 'AGUA_ALIMENTO' | 'ENERGIA' | 'MAQUINARIA' | 'REFUGIO';
  current: number;
  max: number;
  unit: string;
  location: string;
  criticalThreshold: number;
  status: 'OPTIMO' | 'MODERADO' | 'CRITICO';
}

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'RES-01',
    name: 'Agua Potable Embotellada (Garrafas 20L)',
    category: 'AGUA_ALIMENTO',
    current: 45,
    max: 200,
    unit: 'garrafas',
    location: 'Albergue Central',
    criticalThreshold: 50,
    status: 'CRITICO',
  },
  {
    id: 'RES-02',
    name: 'Mascarillas N95 contra ceniza volcánica',
    category: 'MEDICO',
    current: 320,
    max: 1000,
    unit: 'unidades',
    location: 'Base de Operaciones Norte',
    criticalThreshold: 200,
    status: 'MODERADO',
  },
  {
    id: 'RES-03',
    name: 'Diésel para generadores y maquinaria',
    category: 'ENERGIA',
    current: 680,
    max: 1000,
    unit: 'litros',
    location: 'Depósito Táctico 1',
    criticalThreshold: 250,
    status: 'OPTIMO',
  },
  {
    id: 'RES-04',
    name: 'Botiquines de trauma y quemaduras',
    category: 'MEDICO',
    current: 12,
    max: 30,
    unit: 'kits',
    location: 'Puesto Médico Avanzado',
    criticalThreshold: 10,
    status: 'MODERADO',
  },
  {
    id: 'RES-05',
    name: 'Generadores portátiles a gasolina (5kW)',
    category: 'ENERGIA',
    current: 4,
    max: 4,
    unit: 'equipos',
    location: 'Base Central',
    criticalThreshold: 1,
    status: 'OPTIMO',
  },
  {
    id: 'RES-06',
    name: 'Raciones de alimento no perecedero',
    category: 'AGUA_ALIMENTO',
    current: 120,
    max: 500,
    unit: 'raciones',
    location: 'Albergue Central',
    criticalThreshold: 150,
    status: 'CRITICO',
  },
  {
    id: 'RES-07',
    name: 'Retroexcavadora Oruga CAT 320',
    category: 'MAQUINARIA',
    current: 1,
    max: 2,
    unit: 'máquinas',
    location: 'Puente Sur (En Operación)',
    criticalThreshold: 1,
    status: 'MODERADO',
  },
  {
    id: 'RES-08',
    name: 'Colchonetas y mantas térmicas',
    category: 'REFUGIO',
    current: 190,
    max: 250,
    unit: 'kits',
    location: 'Albergue Municipal',
    criticalThreshold: 50,
    status: 'OPTIMO',
  },
];

export default function ResourcesView() {
  const [resources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const filtered = resources.filter(
    (item) => selectedCategory === 'TODAS' || item.category === selectedCategory
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Inventario Logístico y Recursos de Emergencia
          </h2>
          <p className="text-sm text-gray-500">
            Control de insumos vitales, combustible, suministros médicos y maquinaria en zona de desastre.
          </p>
        </div>

        <button
          onClick={() => alert('Solicitud formal de convoy de abastecimiento enviada al Centro Logístico Regional.')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-start"
        >
          <Truck size={18} /> Solicitar Convoy de Suministros
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'TODAS', label: 'Todos los Insumos' },
          { key: 'AGUA_ALIMENTO', label: 'Agua y Alimentos' },
          { key: 'MEDICO', label: 'Insumos Médicos' },
          { key: 'ENERGIA', label: 'Combustible y Energía' },
          { key: 'MAQUINARIA', label: 'Maquinaria Pesada' },
          { key: 'REFUGIO', label: 'Refugio y Albergue' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === tab.key
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const percent = Math.round((item.current / item.max) * 100);
          const isCritical = item.status === 'CRITICO';

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between gap-3 transition ${
                isCritical ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400">{item.id}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'CRITICO'
                        ? 'bg-red-500 text-white animate-pulse'
                        : item.status === 'MODERADO'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-gray-900 leading-snug">{item.name}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Warehouse size={12} className="text-gray-400" />
                  {item.location}
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-2xl font-black text-gray-900">
                    {item.current}{' '}
                    <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {percent}% ({item.max})
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'CRITICO'
                        ? 'bg-red-500'
                        : item.status === 'MODERADO'
                        ? 'bg-yellow-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                {isCritical && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-2">
                    <AlertTriangle size={12} /> Nivel crítico (Reabastecer ya)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
