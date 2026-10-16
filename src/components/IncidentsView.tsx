import { useState } from 'react';
import {
  Clock,
  MapPin,
  Filter,
  Plus,
  Search,
  CheckCircle2,
  Users,
  ChevronRight
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  sector: string;
  details: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  status: 'PENDIENTE' | 'EN_CURSO' | 'RESUELTO';
  reportedAt: string;
  assignedBrigade?: string;
  reportedBy: string;
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-024',
    title: '18 personas aisladas por lahar',
    sector: 'Sector Norte • Finca Las Nubes',
    details: 'Corte de camino por descenso de flujo de lodo y ceniza caliente. Familias reunidas en punto alto.',
    priority: 'ALTA',
    status: 'EN_CURSO',
    reportedAt: 'hace 6 min',
    assignedBrigade: 'Brigada Alfa (Rescate)',
    reportedBy: 'Comité Comunitario Local (LoRa)',
  },
  {
    id: 'INC-021',
    title: 'Vía principal bloqueada por derrumbe',
    sector: 'Puente Sur • KM 84',
    details: 'Árboles y rocas obstaculizan el paso de ambulancias hacia el hospital regional. Requiere retroexcavadora.',
    priority: 'ALTA',
    status: 'PENDIENTE',
    reportedAt: 'hace 14 min',
    reportedBy: 'Patrulla de Tránsito',
  },
  {
    id: 'INC-018',
    title: 'Desabastecimiento de agua potable y filtros',
    sector: 'Albergue Central • Gimnasio',
    details: '140 refugiados reportan falta de agua embotellada y mascarillas para la ceniza ambiental.',
    priority: 'MEDIA',
    status: 'EN_CURSO',
    reportedAt: 'hace 25 min',
    assignedBrigade: 'Brigada Charlie (Logística)',
    reportedBy: 'Cruz Roja - Delegación',
  },
  {
    id: 'INC-015',
    title: 'Corte de línea eléctrica por caída de poste',
    sector: 'Colonia El Mirador',
    details: 'Sector sin energía eléctrica ni alumbrado de emergencia. Generador local activado.',
    priority: 'MEDIA',
    status: 'PENDIENTE',
    reportedAt: 'hace 42 min',
    reportedBy: 'Vecino vía Radio VHF',
  },
  {
    id: 'INC-012',
    title: 'Evacuación preventiva de 35 familias',
    sector: 'Aldea San José',
    details: 'Comunidad trasladada exitosamente al albergue seguro fuera del radio de 5km.',
    priority: 'BAJA',
    status: 'RESUELTO',
    reportedAt: 'hace 1h 10 min',
    assignedBrigade: 'Brigada Delta (Evacuación)',
    reportedBy: 'Protección Civil',
  },
];

export default function IncidentsView() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [filterPriority, setFilterPriority] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]);

  const filtered = incidents.filter((item) => {
    const matchesPriority = filterPriority === 'TODOS' || item.priority === filterPriority;
    const matchesStatus = filterStatus === 'TODOS' || item.status === filterStatus;
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const handleResolve = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'RESUELTO' } : inc))
    );
    if (selectedIncident?.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: 'RESUELTO' } : null));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Gestión de Incidentes y Emergencias
          </h2>
          <p className="text-sm text-gray-500">
            Monitoreo en tiempo real de alertas emitidas por brigadas y comunidades del Sector Norte.
          </p>
        </div>

        <button
          onClick={() => {
            const newId = `INC-0${incidents.length + 20}`;
            const newIncident: Incident = {
              id: newId,
              title: 'Nueva Alerta Registrada',
              sector: 'Sector Norte - Punto por geolocalizar',
              details: 'Alerta ingresada manualmente desde el puesto de mando central.',
              priority: 'ALTA',
              status: 'PENDIENTE',
              reportedAt: 'ahora mismo',
              reportedBy: 'Operador FARO',
            };
            setIncidents([newIncident, ...incidents]);
            setSelectedIncident(newIncident);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-start"
        >
          <Plus size={18} /> Registrar Nuevo Incidente
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID (INC-...), sector o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Filter size={15} /> Prioridad:
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-800 font-semibold focus:outline-none"
            >
              <option value="TODOS">Todas</option>
              <option value="ALTA">Alta (Crítica)</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            Estado:
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-800 font-semibold focus:outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_CURSO">En curso</option>
              <option value="RESUELTO">Resueltos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Incident List & Incident Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
              No se encontraron incidentes con los filtros seleccionados.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedIncident?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIncident(item)}
                  className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition flex items-start gap-4 relative overflow-hidden ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Left severity indicator bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      item.priority === 'ALTA'
                        ? 'bg-red-500'
                        : item.priority === 'MEDIA'
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                  ></div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-gray-500">{item.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.priority === 'ALTA'
                            ? 'bg-red-100 text-red-700'
                            : item.priority === 'MEDIA'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.status === 'EN_CURSO'
                            ? 'bg-blue-100 text-blue-700'
                            : item.status === 'RESUELTO'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.status === 'EN_CURSO'
                          ? 'En curso'
                          : item.status === 'RESUELTO'
                          ? 'Resuelto'
                          : 'Pendiente'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <Clock size={12} /> {item.reportedAt}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-gray-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      {item.sector}
                    </p>

                    {item.assignedBrigade && (
                      <p className="text-xs text-blue-600 font-medium flex items-center gap-1.5 mt-2 bg-blue-50 px-2.5 py-1 rounded w-fit">
                        <Users size={12} />
                        Asignado a: {item.assignedBrigade}
                      </p>
                    )}
                  </div>

                  <ChevronRight size={18} className="text-gray-400 self-center" />
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Incident Inspector */}
        <div className="lg:col-span-5">
          {selectedIncident ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-6 flex flex-col gap-5">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {selectedIncident.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded ${
                      selectedIncident.priority === 'ALTA'
                        ? 'bg-red-500 text-white'
                        : selectedIncident.priority === 'MEDIA'
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    PRIORIDAD {selectedIncident.priority}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedIncident.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={13} /> {selectedIncident.sector}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Detalles de la Situación
                </h5>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-lg border border-gray-200/60">
                  {selectedIncident.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/60">
                  <span className="text-gray-400 block mb-0.5">Reportado por:</span>
                  <span className="font-semibold text-gray-800">{selectedIncident.reportedBy}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/60">
                  <span className="text-gray-400 block mb-0.5">Tiempo transcurrido:</span>
                  <span className="font-semibold text-gray-800">{selectedIncident.reportedAt}</span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Brigada de Intervención
                </h5>
                <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/60 p-3 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">
                        {selectedIncident.assignedBrigade || 'Sin brigada asignada'}
                      </p>
                      <p className="text-[11px] text-blue-600">
                        {selectedIncident.assignedBrigade ? 'En desplazamiento radial' : 'Requiere despacho'}
                      </p>
                    </div>
                  </div>
                  <button className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline">
                    {selectedIncident.assignedBrigade ? 'Cambiar' : 'Asignar'}
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                {selectedIncident.status !== 'RESUELTO' ? (
                  <button
                    onClick={() => handleResolve(selectedIncident.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <CheckCircle2 size={16} /> Marcar como Resuelto
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-2.5 px-4 rounded-lg text-center">
                    ✓ Incidente Cerrado y Documentado
                  </div>
                )}
                <button
                  onClick={() => alert(`Notificación de radio VHF enviada para ${selectedIncident.id}`)}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition"
                >
                  Emitir Alerta LoRa
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
              Selecciona un incidente de la lista para ver los detalles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
