import { useState } from 'react';
import {
  Clock,
  MapPin,
  Filter,
  Plus,
  Search,
  CheckCircle2,
  Users,
  ChevronRight,
  X,
  AlertTriangle,
  Radio,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

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

const AVAILABLE_BRIGADES = [
  'Brigada Alfa (Rescate Agreste)',
  'Brigada Bravo (Médica y Trauma)',
  'Brigada Charlie (Vías y Maquinaria)',
  'Brigada Delta (Evacuación Comunitaria)',
  'Brigada Eco (Logística y Suministros)',
  'Brigada Fox (Comunicaciones LoRa)',
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-024',
    title: '18 personas aisladas por lahar',
    sector: 'Sector Norte • Finca Las Nubes',
    details: 'Corte de camino por descenso de flujo de lodo y ceniza caliente. Familias reunidas en punto alto.',
    priority: 'ALTA',
    status: 'EN_CURSO',
    reportedAt: 'hace 6 min',
    assignedBrigade: 'Brigada Alfa (Rescate Agreste)',
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
    assignedBrigade: 'Brigada Charlie (Vías y Maquinaria)',
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
    assignedBrigade: 'Brigada Delta (Evacuación Comunitaria)',
    reportedBy: 'Protección Civil',
  },
];

export default function IncidentsView() {
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [filterPriority, setFilterPriority] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]);

  // Modal para registrar nueva alerta con brigada asignada
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newPriority, setNewPriority] = useState<'ALTA' | 'MEDIA' | 'BAJA'>('ALTA');
  const [newBrigade, setNewBrigade] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newReportedBy, setNewReportedBy] = useState('Puesto de Mando Central FARO');

  // Estado para cambiar brigada en el inspector
  const [isChangingBrigade, setIsChangingBrigade] = useState(false);

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
    showToast({
      title: `Incidente Resuelto: ${id}`,
      message: 'El incidente fue documentado y marcado como resuelto satisfactoriamente.',
      type: 'success',
    });
  };

  const handleAssignBrigade = (brigadeName: string) => {
    if (!selectedIncident) return;
    const updatedStatus = brigadeName ? 'EN_CURSO' : 'PENDIENTE';
    
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === selectedIncident.id
          ? { ...inc, assignedBrigade: brigadeName || undefined, status: inc.status === 'RESUELTO' ? 'RESUELTO' : updatedStatus }
          : inc
      )
    );

    setSelectedIncident((prev) =>
      prev
        ? {
            ...prev,
            assignedBrigade: brigadeName || undefined,
            status: prev.status === 'RESUELTO' ? 'RESUELTO' : updatedStatus,
          }
        : null
    );

    setIsChangingBrigade(false);

    if (brigadeName) {
      showToast({
        title: `Brigada Despachada`,
        message: `${brigadeName} asignada a ${selectedIncident.id} (${selectedIncident.title}).`,
        type: 'brigade',
      });
    } else {
      showToast({
        title: `Brigada Removida`,
        message: `El incidente ${selectedIncident.id} quedó en espera de asignación de brigada.`,
        type: 'warning',
      });
    }
  };

  const handleCreateNewAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nextNumber = incidents.length + 25;
    const newId = `INC-0${nextNumber}`;

    const incident: Incident = {
      id: newId,
      title: newTitle.trim(),
      sector: newSector.trim() || 'Sector Norte • Por georreferenciar',
      priority: newPriority,
      status: newBrigade ? 'EN_CURSO' : 'PENDIENTE',
      details: newDetails.trim() || 'Alerta prioritaria registrada desde la consola de operaciones.',
      reportedAt: 'ahora mismo',
      assignedBrigade: newBrigade || undefined,
      reportedBy: newReportedBy.trim() || 'Operador FARO',
    };

    setIncidents([incident, ...incidents]);
    setSelectedIncident(incident);
    setIsModalOpen(false);

    // Limpiar formulario
    setNewTitle('');
    setNewSector('');
    setNewPriority('ALTA');
    setNewBrigade('');
    setNewDetails('');
    setNewReportedBy('Puesto de Mando Central FARO');

    showToast({
      title: `Nueva Alerta Registrada: ${newId}`,
      message: `${incident.title} en ${incident.sector}. ${
        incident.assignedBrigade
          ? `Asignada de inmediato a ${incident.assignedBrigade}.`
          : 'Pendiente de asignación de brigada.'
      }`,
      type: incident.assignedBrigade ? 'brigade' : 'alert',
    });
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
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-start cursor-pointer active:scale-95"
        >
          <Plus size={18} /> Registrar Nueva Alerta
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
                  onClick={() => {
                    setSelectedIncident(item);
                    setIsChangingBrigade(false);
                  }}
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

                    {item.assignedBrigade ? (
                      <p className="text-xs text-blue-700 font-semibold flex items-center gap-1.5 mt-2 bg-blue-50 px-2.5 py-1 rounded w-fit border border-blue-100">
                        <Users size={12} className="text-blue-600" />
                        Asignado a: {item.assignedBrigade}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5 mt-2 bg-amber-50 px-2.5 py-1 rounded w-fit border border-amber-100">
                        <AlertTriangle size={12} className="text-amber-500" />
                        Sin brigada asignada
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

              {/* Brigada de Intervención Section with Assignment UI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Brigada de Intervención
                  </h5>
                  <button
                    onClick={() => setIsChangingBrigade(!isChangingBrigade)}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                  >
                    {isChangingBrigade
                      ? 'Cerrar selector'
                      : selectedIncident.assignedBrigade
                      ? 'Cambiar brigada'
                      : 'Asignar brigada'}
                  </button>
                </div>

                <div className="bg-blue-50/70 border border-blue-200/60 p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-blue-600 text-white p-2.5 rounded-lg shadow-sm">
                      <Users size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-900">
                        {selectedIncident.assignedBrigade || 'Sin brigada asignada'}
                      </p>
                      <p className="text-[11px] text-blue-600">
                        {selectedIncident.assignedBrigade
                          ? 'En desplazamiento y canal radial activo'
                          : 'Requiere despacho urgente de brigada'}
                      </p>
                    </div>
                  </div>

                  {/* Selector rápido de Brigadas */}
                  {isChangingBrigade && (
                    <div className="mt-3 pt-3 border-t border-blue-200/60 flex flex-col gap-1.5 animate-in fade-in duration-200">
                      <p className="text-[11px] font-bold text-gray-600 mb-1">
                        Selecciona la brigada para este incidente:
                      </p>
                      {AVAILABLE_BRIGADES.map((brigade) => {
                        const isCurrent = selectedIncident.assignedBrigade === brigade;
                        return (
                          <button
                            key={brigade}
                            onClick={() => handleAssignBrigade(brigade)}
                            className={`text-left text-xs p-2 rounded-lg font-medium flex items-center justify-between transition ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-sm font-bold'
                                : 'bg-white hover:bg-blue-100 text-gray-800 border border-blue-100'
                            }`}
                          >
                            <span>{brigade}</span>
                            {isCurrent && <Check size={14} className="text-white" />}
                          </button>
                        );
                      })}

                      {selectedIncident.assignedBrigade && (
                        <button
                          onClick={() => handleAssignBrigade('')}
                          className="text-left text-xs p-2 mt-1 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 font-medium transition"
                        >
                          ✕ Quitar brigada asignada (Dejar pendiente)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                {selectedIncident.status !== 'RESUELTO' ? (
                  <button
                    onClick={() => handleResolve(selectedIncident.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Marcar como Resuelto
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-2.5 px-4 rounded-lg text-center">
                    ✓ Incidente Cerrado y Documentado
                  </div>
                )}
                <button
                  onClick={() =>
                    showToast({
                      title: `Alerta LoRa Emitida: ${selectedIncident.id}`,
                      message: `Transmisión de emergencia propagada vía paquete LoRa 915 MHz y repetidores VHF para "${selectedIncident.title}".`,
                      type: 'radio',
                    })
                  }
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio size={14} /> Emitir Alerta LoRa
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

      {/* Modal Card para Registrar Nueva Alerta con Brigada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight">Registrar Nueva Alerta Operativa</h3>
                  <p className="text-xs text-gray-300">Emisión de alerta y despacho inmediato de brigada</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewAlert} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Título de la Alerta / Incidente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Personas incomunicadas por crecida o ceniza"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sector / Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Sector Norte • KM 86"
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'ALTA' | 'MEDIA' | 'BAJA')}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold bg-white"
                  >
                    <option value="ALTA">Alta (Crítica / Rescate)</option>
                    <option value="MEDIA">Media (Logística / Atención)</option>
                    <option value="BAJA">Baja (Preventiva)</option>
                  </select>
                </div>
              </div>

              {/* Asignación de Brigada Destacada */}
              <div className="bg-orange-50/80 border border-orange-200/80 p-3.5 rounded-xl">
                <label className="block text-xs font-bold text-orange-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Users size={15} className="text-orange-600" />
                  Asignar Brigada de Intervención
                </label>
                <p className="text-[11px] text-orange-700 mb-2">
                  Puedes asignar una brigada ahora mismo para que se despache en el acto con la alerta.
                </p>
                <select
                  value={newBrigade}
                  onChange={(e) => setNewBrigade(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold bg-white text-gray-800"
                >
                  <option value="">-- Sin brigada aún (Pendiente de Despacho) --</option>
                  {AVAILABLE_BRIGADES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Detalles y Observaciones Operativas
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe la situación actual, accesibilidad de caminos, condiciones del viento y necesidades inmediatas..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reportado Por / Canal
                </label>
                <input
                  type="text"
                  placeholder="Ej: Radioaficionado VHF, Comité Comunitario LoRa"
                  value={newReportedBy}
                  onChange={(e) => setNewReportedBy(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
                >
                  <Plus size={16} /> Registrar y Despachar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
