import { useState } from 'react';
import {
  Clock,
  Download
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  eventType: 'ALERTA' | 'DESPACHO' | 'TELEMETRIA' | 'RESOLUCION';
  operator: string;
  summary: string;
  targetId?: string;
}

const LOG_ENTRIES: LogEntry[] = [
  {
    id: 'LOG-1094',
    timestamp: '15:28:10',
    eventType: 'ALERTA',
    operator: 'Mando Ana (FARO Local)',
    summary: 'Registrado nuevo aviso de personas atrapadas en Quebrada Honda (Sector Norte).',
    targetId: 'INC-024',
  },
  {
    id: 'LOG-1093',
    timestamp: '15:24:02',
    eventType: 'DESPACHO',
    operator: 'Operador Radio #2',
    summary: 'Despachada Brigada Alfa con unidad Hilux 4x4 hacia Sector Norte.',
    targetId: 'BRIG-01',
  },
  {
    id: 'LOG-1092',
    timestamp: '15:18:45',
    eventType: 'TELEMETRIA',
    operator: 'Sistema LoRa Mesh',
    summary: 'Nodo LoRa #1 reportó nivel de batería al 88% con 0 pérdidas de paquetes.',
    targetId: 'LORA-01',
  },
  {
    id: 'LOG-1091',
    timestamp: '15:05:12',
    eventType: 'RESOLUCION',
    operator: 'Mando Ana (FARO Local)',
    summary: 'Completada evacuación de 35 familias en Aldea San José hacia Albergue Central.',
    targetId: 'INC-012',
  },
  {
    id: 'LOG-1090',
    timestamp: '14:48:30',
    eventType: 'ALERTA',
    operator: 'Patrulla Tránsito',
    summary: 'Cierre total de Puente Sur debido a acumulación de rocas y lahar volcánico.',
    targetId: 'INC-021',
  },
  {
    id: 'LOG-1089',
    timestamp: '14:30:00',
    eventType: 'TELEMETRIA',
    operator: 'Estación Meteorológica',
    summary: 'Viento en dirección Suroeste a 18 km/h. Dispersión de pluma de ceniza hacia costa.',
  },
];

export default function AuditLogView() {
  const [entries] = useState<LogEntry[]>(LOG_ENTRIES);
  const [filterType, setFilterType] = useState<string>('TODOS');

  const filtered = entries.filter(
    (e) => filterType === 'TODOS' || e.eventType === filterType
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Registro Histórico y Bitácora de Operaciones
          </h2>
          <p className="text-sm text-gray-500">
            Trazabilidad inmutable de órdenes, despachos de brigadas, telemetría y eventos en la Operación Volcán.
          </p>
        </div>

        <button
          onClick={() => alert('Generando exportación de bitácora en formato CSV auditado...')}
          className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-start"
        >
          <Download size={16} /> Exportar Bitácora (CSV)
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['TODOS', 'ALERTA', 'DESPACHO', 'TELEMETRIA', 'RESOLUCION'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Total de registros en sesión: <strong className="text-gray-900">{entries.length}</strong>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="px-5 py-3.5">ID / Hora</th>
              <th className="px-5 py-3.5">Tipo de Evento</th>
              <th className="px-5 py-3.5">Operador</th>
              <th className="px-5 py-3.5">Descripción de la Acción</th>
              <th className="px-5 py-3.5 text-right">Referencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50/80 transition">
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="font-mono font-bold text-gray-900 block">{entry.id}</span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock size={11} /> {entry.timestamp}
                  </span>
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      entry.eventType === 'ALERTA'
                        ? 'bg-red-100 text-red-700'
                        : entry.eventType === 'DESPACHO'
                        ? 'bg-blue-100 text-blue-700'
                        : entry.eventType === 'RESOLUCION'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {entry.eventType}
                  </span>
                </td>

                <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                  {entry.operator}
                </td>

                <td className="px-5 py-3.5 text-gray-700 max-w-md">
                  {entry.summary}
                </td>

                <td className="px-5 py-3.5 text-right font-mono font-semibold text-orange-600 whitespace-nowrap">
                  {entry.targetId || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
