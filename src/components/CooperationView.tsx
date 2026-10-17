import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Phone,
  Send
} from 'lucide-react';

interface Agency {
  id: string;
  name: string;
  type: 'GOBIERNO' | 'EMERGENCIA' | 'ONG' | 'SEGURIDAD';
  liaison: string;
  phone: string;
  radioFrequency: string;
  personnelDeployed: number;
  assignedRole: string;
  status: 'ACTIVO_EN_OPERACION' | 'EN_ALERTA' | 'COORDINANDO';
}

const AGENCIES: Agency[] = [
  {
    id: 'AG-01',
    name: 'Cruz Roja - Delegación Emergencias',
    type: 'EMERGENCIA',
    liaison: 'Lic. Fernando Ortiz',
    phone: '+502 2381-6565',
    radioFrequency: 'Canal VHF 02 (151.625 MHz)',
    personnelDeployed: 24,
    assignedRole: 'Gestión de albergues temporales y primeros auxilios',
    status: 'ACTIVO_EN_OPERACION',
  },
  {
    id: 'AG-02',
    name: 'Cuerpo de Bomberos Voluntarios',
    type: 'EMERGENCIA',
    liaison: 'Mayor Rolando García',
    phone: '+502 2422-1222',
    radioFrequency: 'Canal VHF 04 (154.200 MHz)',
    personnelDeployed: 38,
    assignedRole: 'Búsqueda, rescate en estructuras y combate de incendios por ceniza',
    status: 'ACTIVO_EN_OPERACION',
  },
  {
    id: 'AG-03',
    name: 'Protección Civil / Gestión de Riesgos',
    type: 'GOBIERNO',
    liaison: 'Ing. Patricia Domínguez',
    phone: '+502 2296-9100',
    radioFrequency: 'Canal VHF 01 (150.800 MHz)',
    personnelDeployed: 18,
    assignedRole: 'Comando unificado y emisión de boletines vulcanológicos',
    status: 'ACTIVO_EN_OPERACION',
  },
  {
    id: 'AG-04',
    name: 'Batallón Humanitario del Ejército',
    type: 'SEGURIDAD',
    liaison: 'Tte. Coronel Víctor Cruz',
    phone: '+502 2414-0000',
    radioFrequency: 'Banda Táctica 08',
    personnelDeployed: 60,
    assignedRole: 'Seguridad perimetral de Zona Roja y evacuación pesada',
    status: 'COORDINANDO',
  },
  {
    id: 'AG-05',
    name: 'Red de Radioaficionados Comunitarios',
    type: 'ONG',
    liaison: 'Ernesto Solís (TG9RST)',
    phone: 'Canal LoRa Mesh FARO',
    radioFrequency: 'HF 7.090 MHz / LoRa 915 MHz',
    personnelDeployed: 12,
    assignedRole: 'Monitoreo de aldeas aisladas sin cobertura telefónica',
    status: 'ACTIVO_EN_OPERACION',
  },
];

export default function CooperationView() {
  const { showToast } = useToast();
  const [agencies] = useState<Agency[]>(AGENCIES);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Cooperación Interinstitucional y Enlaces
          </h2>
          <p className="text-sm text-gray-500">
            Mesa de coordinación entre cuerpos de socorro, autoridades de gobierno, fuerzas de seguridad y ONGs.
          </p>
        </div>

        <button
          onClick={() =>
            showToast({
              title: 'Mesa de Coordinación Convocada',
              message: 'Convocatoria extraordinaria de Mesa de Crisis emitida con acuse a todos los oficiales de enlace.',
              type: 'radio',
            })
          }
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-start"
        >
          <Send size={16} /> Convocar Mesa de Coordinación
        </button>
      </div>

      {/* Agencies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agencies.map((agency) => (
          <div
            key={agency.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-gray-400">{agency.id}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    agency.status === 'ACTIVO_EN_OPERACION'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {agency.status === 'ACTIVO_EN_OPERACION' ? 'En Terreno' : 'Coordinando'}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 leading-snug">{agency.name}</h3>

              <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-2 mb-3">
                <strong className="text-gray-700 block text-[11px] mb-0.5">Rol Principal:</strong>
                {agency.assignedRole}
              </p>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Oficial de Enlace:</span>
                  <span className="font-semibold text-gray-800">{agency.liaison}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Personal Desplegado:</span>
                  <span className="font-semibold text-gray-800">{agency.personnelDeployed} efectivos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Canal Radial:</span>
                  <span className="font-mono text-gray-800 font-semibold">{agency.radioFrequency}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone size={13} className="text-gray-400" />
                {agency.phone}
              </span>
              <button
                onClick={() =>
                  showToast({
                    title: `Enlace Telefónico: ${agency.name}`,
                    message: `Conectando canal seguro de voz con el oficial ${agency.liaison} (${agency.phone})...`,
                    type: 'phone',
                  })
                }
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Llamar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
