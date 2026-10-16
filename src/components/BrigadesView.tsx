import { useState } from 'react';
import {
  BatteryCharging,
  Truck,
  PhoneCall,
  Radio
} from 'lucide-react';

interface Brigade {
  id: string;
  name: string;
  leader: string;
  members: number;
  specialty: string;
  status: 'OPERACION' | 'EN_RUTA' | 'EN_BASE' | 'DESCANSO';
  sector: string;
  vehicle: string;
  vhfChannel: string;
  battery: number;
  loraSignal: 'FUERTE' | 'MEDIA' | 'DEBIL';
  activeMission?: string;
}

const INITIAL_BRIGADES: Brigade[] = [
  {
    id: 'BRIG-01',
    name: 'Brigada Alfa',
    leader: 'Cmdte. Marco Valenzuela',
    members: 6,
    specialty: 'Búsqueda y Rescate en Zonas Agrestes',
    status: 'OPERACION',
    sector: 'Sector Norte • Quebrada Honda',
    vehicle: 'Camioneta Toyota Hilux 4x4 (Unidad R-1)',
    vhfChannel: 'Canal VHF 04 (154.200 MHz)',
    battery: 88,
    loraSignal: 'FUERTE',
    activeMission: 'INC-024 (18 personas aisladas por lahar)',
  },
  {
    id: 'BRIG-02',
    name: 'Brigada Bravo (Médica)',
    leader: 'Dra. Elena Salazar',
    members: 5,
    specialty: 'Triage de Trauma y Toxicología por Ceniza',
    status: 'OPERACION',
    sector: 'Puesto Médico Avanzado • Sector Norte',
    vehicle: 'Ambulancia Todo Terreno (M-3)',
    vhfChannel: 'Canal VHF 02 (151.625 MHz)',
    battery: 94,
    loraSignal: 'FUERTE',
    activeMission: 'Atención a intoxicados por SO2 y partículas de ceniza',
  },
  {
    id: 'BRIG-03',
    name: 'Brigada Charlie (Vías y Maquinaria)',
    leader: 'Ing. Roberto Méndez',
    members: 4,
    specialty: 'Remoción de Escombros y Despeje de Caminos',
    status: 'EN_RUTA',
    sector: 'Desplazándose hacia Puente Sur',
    vehicle: 'Retroexcavadora CAT + Camión de Volteo',
    vhfChannel: 'Canal VHF 06 (155.800 MHz)',
    battery: 72,
    loraSignal: 'MEDIA',
    activeMission: 'INC-021 (Despeje de vía con maquinaria)',
  },
  {
    id: 'BRIG-04',
    name: 'Brigada Delta (Evacuación Civil)',
    leader: 'Oficial Carlos Pineda',
    members: 8,
    specialty: 'Logística de Refugio y Conteo de Evacuados',
    status: 'EN_BASE',
    sector: 'Base de Operaciones Central',
    vehicle: 'Autobús de Transporte Comunitario',
    vhfChannel: 'Canal VHF 01 (150.800 MHz)',
    battery: 100,
    loraSignal: 'FUERTE',
  },
  {
    id: 'BRIG-05',
    name: 'Brigada Eco (Suministros y Telecom)',
    leader: 'Téc. Sofía Morales',
    members: 3,
    specialty: 'Mantenimiento de Nodos LoRa y Baterías Solares',
    status: 'EN_BASE',
    sector: 'Base de Operaciones Central',
    vehicle: 'Cuatrimoto Polaris 4x4 (T-2)',
    vhfChannel: 'Canal VHF 05 (152.400 MHz)',
    battery: 98,
    loraSignal: 'FUERTE',
  },
];

export default function BrigadesView() {
  const [brigades] = useState<Brigade[]>(INITIAL_BRIGADES);
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');

  const filtered = brigades.filter(
    (b) => statusFilter === 'TODAS' || b.status === statusFilter
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Control de Brigadas y Personal en Terreno
          </h2>
          <p className="text-sm text-gray-500">
            Seguimiento de escuadrones de rescate, personal médico y logística con telemetría LoRa.
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 self-start">
          <button
            onClick={() => setStatusFilter('TODAS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'TODAS'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todas ({brigades.length})
          </button>
          <button
            onClick={() => setStatusFilter('OPERACION')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'OPERACION'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            En Operación ({brigades.filter((b) => b.status === 'OPERACION').length})
          </button>
          <button
            onClick={() => setStatusFilter('EN_RUTA')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'EN_RUTA'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            En Ruta ({brigades.filter((b) => b.status === 'EN_RUTA').length})
          </button>
          <button
            onClick={() => setStatusFilter('EN_BASE')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'EN_BASE'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            En Base ({brigades.filter((b) => b.status === 'EN_BASE').length})
          </button>
        </div>
      </div>

      {/* Brigades Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-gray-400">{item.id}</span>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                      item.status === 'OPERACION'
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'EN_RUTA'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'OPERACION'
                          ? 'bg-red-500 animate-pulse'
                          : item.status === 'EN_RUTA'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    ></span>
                    {item.status === 'OPERACION'
                      ? 'En Operación'
                      : item.status === 'EN_RUTA'
                      ? 'En Ruta'
                      : 'Disponible en Base'}
                  </span>
                </div>

                {/* Subtitle / Specialty */}
                <p className="text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 mb-3">
                  {item.specialty}
                </p>

                {/* Info List */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Líder al mando:</span>
                    <span className="font-semibold text-gray-800">{item.leader}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Efectivos:</span>
                    <span className="font-semibold text-gray-800">{item.members} personas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sector actual:</span>
                    <span className="font-semibold text-gray-800">{item.sector}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Vehículo:</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Truck size={12} className="text-gray-500" />
                      {item.vehicle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Frecuencia radio:</span>
                    <span className="font-mono text-gray-800 font-semibold">{item.vhfChannel}</span>
                  </div>
                </div>

                {/* Mission Badge if assigned */}
                {item.activeMission && (
                  <div className="mt-3 p-2.5 bg-orange-50/80 border border-orange-200/60 rounded-lg text-xs">
                    <span className="font-bold text-orange-900 block mb-0.5">Misión Activa:</span>
                    <span className="text-orange-700">{item.activeMission}</span>
                  </div>
                )}
              </div>

              {/* Telemetry and Action Footer */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-600 font-semibold" title="Batería de equipos portátiles">
                    <BatteryCharging size={14} />
                    <span>{item.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold" title="Calidad de enlace LoRa Mesh">
                    <Radio size={13} />
                    <span>{item.loraSignal}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Abriendo canal de comunicación radial con ${item.name} en ${item.vhfChannel}`)}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  <PhoneCall size={12} /> Contactar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
