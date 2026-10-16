import { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Radio,
  Users,
  Compass,
  Flame,
  Home
} from 'lucide-react';

interface MapMarker {
  id: string;
  type: 'incident' | 'brigade' | 'node' | 'shelter';
  title: string;
  subtitle: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  level?: 'ALTA' | 'MEDIA' | 'BAJA';
  status: string;
  details: string;
}

// Marcadores geolocalizados en el territorio de El Salvador
const EL_SALVADOR_MARKERS: MapMarker[] = [
  {
    id: 'INC-024',
    type: 'incident',
    title: 'Comunidades aisladas por ceniza y lahares',
    subtitle: 'Faldas del Volcán Chaparrastique • San Miguel',
    x: 71,
    y: 64,
    level: 'ALTA',
    status: 'Riesgo Crítico Piroclástico',
    details: 'Emisión de gases y ceniza activa. 18 familias requieren evacuación inmediata en cantón San Jorge.',
  },
  {
    id: 'INC-021',
    type: 'incident',
    title: 'Bloqueo en Carretera Panamericana (CA-1)',
    subtitle: 'Tramo San Vicente - Apastepeque • KM 62',
    x: 52,
    y: 56,
    level: 'ALTA',
    status: 'Vía inhabilitada',
    details: 'Derrumbe de talud sobre carriles hacia oriente. Maquinaria pesada requerida con urgencia.',
  },
  {
    id: 'INC-018',
    type: 'incident',
    title: 'Desabastecimiento de kits y mascarillas N95',
    subtitle: 'Albergue Estadio Juan Francisco Barraza',
    x: 68,
    y: 60,
    level: 'MEDIA',
    status: 'Pendiente entrega',
    details: 'Población evacuada de Chinameca y San Jorge reporta saturación de polvo fino de ceniza.',
  },
  {
    id: 'BRIG-01',
    type: 'brigade',
    title: 'Brigada Alfa (Bomberos y Rescate)',
    subtitle: 'Desplegada en San Miguel / San Jorge',
    x: 69,
    y: 68,
    status: 'En patrullaje activo',
    details: '6 rescatistas equipados con equipos autónomos de respiración y unidad Hilux 4x4.',
  },
  {
    id: 'BRIG-02',
    type: 'brigade',
    title: 'Brigada Bravo (Atención Médica Móvil)',
    subtitle: 'Puesto Avanzado San Salvador - Soyapango',
    x: 39,
    y: 52,
    status: 'En Base Central',
    details: 'Médicos de trauma y ambulancia 4x4 listos para despliegue hacia zona paracentral.',
  },
  {
    id: 'LORA-01',
    type: 'node',
    title: 'Nodo LoRa Pacayal #1 (Repetidor Cerro)',
    subtitle: 'Elevación 1,580m • 915 MHz Mesh',
    x: 73,
    y: 58,
    status: 'En línea (98% bat solar)',
    details: 'Enlace vital de telemetría para cobertura en todo el departamento de San Miguel y Usulután.',
  },
  {
    id: 'LORA-02',
    type: 'node',
    title: 'Nodo LoRa San Salvador (Puesto de Mando)',
    subtitle: 'Volcán San Salvador (El Boquerón)',
    x: 37,
    y: 48,
    status: 'En línea (100% bat)',
    details: 'Gateway principal con enlace satelital Starlink y servidor local FARO.',
  },
  {
    id: 'SHELTER-01',
    type: 'shelter',
    title: 'Albergue Nacional Polideportivo Don Bosco',
    subtitle: 'Soyapango / San Salvador • Capacidad: 250 personas',
    x: 42,
    y: 53,
    status: 'Zona Segura Operativa',
    details: 'Instalaciones con luz de emergencia, agua potable filtrada y personal médico 24/7.',
  },
];

export default function InteractiveMap() {
  const [zoom, setZoom] = useState(1);
  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    brigades: true,
    nodes: true,
    shelters: true,
    dangerZones: true,
  });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.8));
  const handleReset = () => {
    setZoom(1);
    setSelectedMarker(null);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl shadow-lg flex flex-col relative overflow-hidden select-none min-h-[520px]">
      {/* Top HUD Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-md">
          <Compass className="text-orange-500 animate-spin" style={{ animationDuration: '24s' }} size={16} />
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            REPÚBLICA DE EL SALVADOR • COORD: 13.794° N, 88.896° W
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Layer Toggles Floating Panel */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1.5 flex items-center gap-1 shadow-md">
          <button
            onClick={() => toggleLayer('dangerZones')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeLayers.dangerZones
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Perímetros de Riesgo Volcánico"
          >
            <Flame size={13} /> Peligro Volcánico
          </button>
          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeLayers.incidents
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Incidentes reportados"
          >
            <AlertTriangle size={13} /> Incidentes
          </button>
          <button
            onClick={() => toggleLayer('brigades')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeLayers.brigades
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Brigadas de rescate"
          >
            <Users size={13} /> Brigadas
          </button>
          <button
            onClick={() => toggleLayer('nodes')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeLayers.nodes
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Nodos LoRa"
          >
            <Radio size={13} /> LoRa
          </button>
          <button
            onClick={() => toggleLayer('shelters')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeLayers.shelters
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Albergues seguros"
          >
            <Home size={13} /> Albergues
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 flex items-center gap-1 shadow-md">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Acercar"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Alejar"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Restablecer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Tactical Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#0a111a] cursor-grab active:cursor-grabbing">
        {/* Animated Map Surface */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* El Salvador Tactical Vector Map */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 560"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Volcano hazard gradient for Chaparrastique */}
              <radialGradient id="volcanoGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                <stop offset="35%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#0a111a" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#0a111a" stopOpacity="0" />
              </radialGradient>

              {/* Pacific Ocean Deep Water Gradient */}
              <linearGradient id="pacificGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0c1d2e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#071320" stopOpacity="0.95" />
              </linearGradient>

              {/* Grid pattern */}
              <pattern id="salvadorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172638" strokeWidth="0.8" opacity="0.6" />
              </pattern>
            </defs>

            {/* Tactical Grid Background */}
            <rect width="1000" height="560" fill="url(#salvadorGrid)" />

            {/* Pacific Ocean (South Area) */}
            <path
              d="M 120 340 Q 200 375 320 380 Q 480 395 620 420 Q 720 440 790 435 L 880 470 L 1000 560 L 0 560 L 0 340 Z"
              fill="url(#pacificGradient)"
            />
            <text x="480" y="490" fill="#2d4b68" fontSize="13" fontWeight="bold" letterSpacing="4" textAnchor="middle">
              OCÉANO PACÍFICO
            </text>

            {/* Territorial Silhouette of El Salvador */}
            <path
              id="el-salvador-territory"
              d="M 125 330 
                 L 115 280 
                 L 130 220 
                 L 170 170 
                 L 225 120 
                 L 270 125 
                 L 340 145 
                 L 405 130 
                 L 485 145 
                 L 570 180 
                 L 640 215 
                 L 720 220 
                 L 785 240 
                 L 830 280 
                 L 855 330 
                 L 835 375 
                 L 805 405 
                 L 775 425 
                 L 710 425 
                 L 660 425 
                 L 620 415 
                 L 550 400 
                 L 470 385 
                 L 380 380 
                 L 300 375 
                 L 230 365 
                 L 165 350 
                 Z"
              fill="#142131"
              stroke="#2c4b6f"
              strokeWidth="2.5"
            />

            {/* Internal Department Divisions (Subtle Tactical Dashes) */}
            {/* Occidente: Ahuachapán, Santa Ana, Sonsonate */}
            <path d="M 180 175 L 205 355" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M 205 240 L 290 225" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M 290 225 L 295 370" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Centro: Chalatenango, San Salvador, La Libertad, La Paz, Cuscatlán, Cabañas */}
            <path d="M 340 145 L 340 270 L 450 270" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M 450 160 L 450 385" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M 545 180 L 545 395" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Oriente: San Vicente, Usulután, San Miguel, Morazán, La Unión */}
            <path d="M 640 215 L 640 415" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M 740 230 L 740 420" fill="none" stroke="#223a54" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Major Natural Lakes */}
            {/* Lago de Coatepeque */}
            <ellipse cx="230" cy="235" rx="10" ry="7" fill="#0284c7" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="1" />
            <text x="230" y="222" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontFamily="monospace">L. Coatepeque</text>

            {/* Lago de Ilopango */}
            <ellipse cx="430" cy="285" rx="15" ry="9" fill="#0284c7" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="1" />
            <text x="430" y="270" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontFamily="monospace">L. Ilopango</text>

            {/* Río Lempa (arteria hidrográfica principal) */}
            <path
              d="M 240 130 Q 380 170 480 195 T 570 230 T 560 330 T 540 395"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <text x="510" y="215" fill="#38bdf8" fontSize="9" opacity="0.8">Río Lempa</text>

            {/* Carretera Panamericana CA-1 (Ruta Troncal) */}
            <path
              d="M 125 240 Q 250 245 385 270 T 525 295 T 710 325 T 845 350"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeOpacity="0.4"
              strokeDasharray="6 3"
            />

            {/* Department Labels in Territory */}
            <text x="165" y="240" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">AHUACHAPÁN</text>
            <text x="230" y="170" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">SANTA ANA</text>
            <text x="200" y="325" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">SONSONATE</text>
            <text x="420" y="165" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">CHALATENANGO</text>
            <text x="315" y="325" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">LA LIBERTAD</text>
            <text x="385" y="250" fill="#f97316" fontSize="11" fontWeight="bold" letterSpacing="1">SAN SALVADOR</text>
            <text x="495" y="250" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">CABAÑAS</text>
            <text x="495" y="335" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">SAN VICENTE</text>
            <text x="575" y="375" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">USULUTÁN</text>
            <text x="690" y="260" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">MORAZÁN</text>
            <text x="680" y="355" fill="#ef4444" fontSize="11" fontWeight="bold" letterSpacing="1">SAN MIGUEL</text>
            <text x="790" y="350" fill="#476788" fontSize="10" fontWeight="bold" letterSpacing="1">LA UNIÓN</text>

            {/* Golfo de Fonseca */}
            <text x="815" y="440" fill="#38bdf8" fontSize="9" opacity="0.8">Golfo de Fonseca</text>

            {/* Volcanic Danger Zones Layer (Active Volcano Chaparrastique - San Miguel) */}
            {activeLayers.dangerZones && (
              <g id="volcanic-hazard-san-miguel">
                {/* 15km Yellow Alert Zone */}
                <circle cx="710" cy="355" r="95" fill="#eab308" fillOpacity="0.05" stroke="#eab308" strokeWidth="1" strokeDasharray="5 5" />
                {/* 10km Orange Hazard Zone */}
                <circle cx="710" cy="355" r="65" fill="#f97316" fillOpacity="0.08" stroke="#f97316" strokeWidth="1.3" strokeDasharray="4 4" />
                {/* 5km Red Evacuation Core */}
                <circle cx="710" cy="355" r="35" fill="url(#volcanoGlow)" stroke="#ef4444" strokeWidth="2" />
                
                {/* Pulsing Crater Center */}
                <circle cx="710" cy="355" r="7" fill="#ef4444" />
                <circle cx="710" cy="355" r="16" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: '710px 355px' }} />
                <text x="710" y="335" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                  VOLCÁN CHAPARRASTIQUE
                </text>
              </g>
            )}

            {/* Secondary Volcano: San Salvador (El Boquerón) */}
            <circle cx="370" cy="270" r="5" fill="#f97316" />
            <circle cx="370" cy="270" r="14" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          </svg>

          {/* Interactive Markers Overlay */}
          {EL_SALVADOR_MARKERS.map((marker) => {
            // Filter by active layer
            if (marker.type === 'incident' && !activeLayers.incidents) return null;
            if (marker.type === 'brigade' && !activeLayers.brigades) return null;
            if (marker.type === 'node' && !activeLayers.nodes) return null;
            if (marker.type === 'shelter' && !activeLayers.shelters) return null;

            const isSelected = selectedMarker?.id === marker.id;

            return (
              <div
                key={marker.id}
                onClick={() => setSelectedMarker(marker)}
                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 z-10 group"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                {/* Ping Animation for High Priority Incidents */}
                {marker.type === 'incident' && marker.level === 'ALTA' && (
                  <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping"></span>
                )}

                {/* Pin Icon Bubble */}
                <div
                  className={`p-1.5 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    marker.type === 'incident'
                      ? marker.level === 'ALTA'
                        ? 'bg-red-600 border-white text-white'
                        : 'bg-orange-500 border-white text-white'
                      : marker.type === 'brigade'
                      ? 'bg-blue-600 border-cyan-300 text-white'
                      : marker.type === 'node'
                      ? 'bg-emerald-600 border-emerald-300 text-white'
                      : 'bg-cyan-600 border-white text-white'
                  } ${isSelected ? 'ring-4 ring-orange-400 scale-125' : ''}`}
                >
                  {marker.type === 'incident' && <AlertTriangle size={15} />}
                  {marker.type === 'brigade' && <Users size={15} />}
                  {marker.type === 'node' && <Radio size={14} />}
                  {marker.type === 'shelter' && <Home size={14} />}
                </div>

                {/* Tactical Tag */}
                <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 text-[10px] text-slate-200 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap opacity-90 group-hover:opacity-100 font-mono">
                  {marker.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Marker Detail Card Modal (Floating at bottom-left) */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400">{selectedMarker.id}</span>
                {selectedMarker.level && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      selectedMarker.level === 'ALTA'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {selectedMarker.level}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-white mt-0.5">{selectedMarker.title}</h4>
              <p className="text-xs text-slate-400">{selectedMarker.subtitle}</p>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-slate-400 hover:text-white text-xs p-1 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 mb-3">
            {selectedMarker.details}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {selectedMarker.status}
            </span>
            <button
              onClick={() => alert(`Acción ejecutada sobre ${selectedMarker.id}: Telemetría enviada a brigadas de El Salvador.`)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-2.5 py-1 rounded transition"
            >
              Despachar
            </button>
          </div>
        </div>
      )}

      {/* Map Bottom Legend / Status Strip */}
      <div className="bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Incidentes (El Salvador)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Brigadas Desplegadas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Nodos LoRa Mesh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Albergues Nacionales</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span>ZOOM: {(zoom * 100).toFixed(0)}%</span>
          <span>•</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> TERRITORIO NACIONAL SV
          </span>
        </div>
      </div>
    </div>
  );
}
