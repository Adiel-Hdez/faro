import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  AlertTriangle,
  Radio,
  Users,
  Compass,
  Flame,
  Home,
  Map as MapIcon,
  Globe,
  Satellite,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface MapMarker {
  id: string;
  type: 'incident' | 'brigade' | 'node' | 'shelter';
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  level?: 'ALTA' | 'MEDIA' | 'BAJA';
  status: string;
  details: string;
}

const EL_SALVADOR_MARKERS: MapMarker[] = [
  {
    id: 'INC-024',
    type: 'incident',
    title: 'Comunidades aisladas por ceniza y lahares',
    subtitle: 'Faldas del Volcán Chaparrastique • San Jorge',
    lat: 13.425,
    lng: -88.332,
    level: 'ALTA',
    status: 'Riesgo Crítico Piroclástico',
    details: 'Emisión continua de ceniza y lahares activos. 18 familias requieren evacuación con vehículo 4x4 o apoyo aéreo.',
  },
  {
    id: 'INC-021',
    type: 'incident',
    title: 'Bloqueo en Carretera Panamericana (CA-1)',
    subtitle: 'Tramo San Vicente - Apastepeque • KM 62',
    lat: 13.665,
    lng: -88.785,
    level: 'ALTA',
    status: 'Paso vehicular inhabilitado',
    details: 'Derrumbe de talud rocoso sobre ambos carriles. Retroexcavadora y brigada de despeje en camino.',
  },
  {
    id: 'INC-018',
    type: 'incident',
    title: 'Desabastecimiento de kits y mascarillas N95',
    subtitle: 'Albergue Estadio Juan Francisco Barraza',
    lat: 13.475,
    lng: -88.175,
    level: 'MEDIA',
    status: 'Pendiente entrega',
    details: '140 refugiados reportan escasez de agua potable y alta concentración de polvo fino volcánico.',
  },
  {
    id: 'BRIG-01',
    type: 'brigade',
    title: 'Brigada Alfa (Bomberos y Rescate)',
    subtitle: 'Desplegada en San Miguel / San Jorge',
    lat: 13.445,
    lng: -88.245,
    status: 'En patrullaje activo',
    details: '6 rescatistas con equipos de protección respiratoria, cuerdas y unidad Hilux 4x4.',
  },
  {
    id: 'BRIG-02',
    type: 'brigade',
    title: 'Brigada Bravo (Atención Médica Móvil)',
    subtitle: 'Puesto Avanzado San Salvador - Soyapango',
    lat: 13.71,
    lng: -89.15,
    status: 'En Base Central',
    details: 'Médicos de trauma y ambulancia 4x4 listos para traslado a zonas de evacuación.',
  },
  {
    id: 'LORA-01',
    type: 'node',
    title: 'Nodo LoRa Pacayal #1 (Repetidor Cerro)',
    subtitle: 'Elevación 1,580m • 915 MHz Mesh',
    lat: 13.485,
    lng: -88.295,
    status: 'En línea (98% bat solar)',
    details: 'Enlace vital de telemetría de emergencia para el oriente de El Salvador con 0 pérdida de paquetes.',
  },
  {
    id: 'LORA-02',
    type: 'node',
    title: 'Nodo LoRa San Salvador (Puesto de Mando)',
    subtitle: 'Volcán San Salvador (El Boquerón)',
    lat: 13.74,
    lng: -89.28,
    status: 'En línea (100% bat)',
    details: 'Gateway principal con enlace satelital Starlink y servidor local FARO.',
  },
  {
    id: 'SHELTER-01',
    type: 'shelter',
    title: 'Albergue Nacional Polideportivo Don Bosco',
    subtitle: 'Soyapango / San Salvador • Capacidad: 250 personas',
    lat: 13.705,
    lng: -89.145,
    status: 'Zona Segura Operativa',
    details: 'Instalaciones con planta eléctrica propia, agua potable y personal de socorro 24/7.',
  },
];

type TileMode = 'dark' | 'satellite' | 'street';

export default function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<{
    danger: L.LayerGroup;
    incidents: L.LayerGroup;
    brigades: L.LayerGroup;
    nodes: L.LayerGroup;
    shelters: L.LayerGroup;
  } | null>(null);

  const [tileMode, setTileMode] = useState<TileMode>('dark');
  const [activeLayers, setActiveLayers] = useState({
    dangerZones: true,
    incidents: true,
    brigades: true,
    nodes: true,
    shelters: true,
  });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates for El Salvador
    const map = L.map(mapContainerRef.current, {
      center: [13.68, -88.85],
      zoom: 9,
      minZoom: 8,
      maxZoom: 18,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Tile layers definitions
    const tileUrls: Record<TileMode, { url: string; attr: string; subdomains?: string }> = {
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attr: '&copy; CARTO &copy; OpenStreetMap contributors',
        subdomains: 'abcd',
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attr: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
      },
      street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attr: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
      },
    };

    const currentTileConfig = tileUrls.dark;
    const tileLayer = L.tileLayer(currentTileConfig.url, {
      attribution: currentTileConfig.attr,
      subdomains: currentTileConfig.subdomains || 'abc',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Initialize Layer Groups
    const danger = L.layerGroup().addTo(map);
    const incidents = L.layerGroup().addTo(map);
    const brigades = L.layerGroup().addTo(map);
    const nodes = L.layerGroup().addTo(map);
    const shelters = L.layerGroup().addTo(map);

    layersGroupRef.current = { danger, incidents, brigades, nodes, shelters };

    // --- Volcanic Danger Circles (Volcán Chaparrastique, San Miguel) ---
    const chaparrastiqueCoords: [number, number] = [13.4333, -88.2667];

    // 15km Yellow Alert
    L.circle(chaparrastiqueCoords, {
      radius: 15000,
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.08,
      weight: 1.2,
      dashArray: '6, 6',
    }).addTo(danger);

    // 10km Orange Hazard Zone
    L.circle(chaparrastiqueCoords, {
      radius: 10000,
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.15,
      weight: 1.8,
      dashArray: '5, 5',
    }).addTo(danger);

    // 5km Red Evacuation Core
    L.circle(chaparrastiqueCoords, {
      radius: 5000,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.35,
      weight: 2.5,
    }).addTo(danger);

    // Crater Pulsing Center Marker
    const craterIcon = L.divIcon({
      className: 'custom-crater-pin',
      html: `
        <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 10px #ef4444;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    L.marker(chaparrastiqueCoords, { icon: craterIcon })
      .bindTooltip('<b>VOLCÁN CHAPARRASTIQUE (CRÁTER)</b><br>Alerta Roja Activa', {
        permanent: false,
        direction: 'top',
        className: 'tactical-tooltip',
      })
      .addTo(danger);

    // --- Markers Placement ---
    EL_SALVADOR_MARKERS.forEach((marker) => {
      let iconColor = '#ef4444';
      let iconGlyph = '⚠️';
      let targetGroup = incidents;

      if (marker.type === 'incident') {
        iconColor = marker.level === 'ALTA' ? '#ef4444' : '#f97316';
        iconGlyph = '⚠️';
        targetGroup = incidents;
      } else if (marker.type === 'brigade') {
        iconColor = '#3b82f6';
        iconGlyph = '👥';
        targetGroup = brigades;
      } else if (marker.type === 'node') {
        iconColor = '#10b981';
        iconGlyph = '📡';
        targetGroup = nodes;
      } else if (marker.type === 'shelter') {
        iconColor = '#06b6d4';
        iconGlyph = '🏠';
        targetGroup = shelters;
      }

      const isHighPriority = marker.type === 'incident' && marker.level === 'ALTA';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isHighPriority
                ? '<div style="position: absolute; top: -4px; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.45); animation: ping 1.8s infinite;"></div>'
                : ''
            }
            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${iconColor}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 2;">
              ${iconGlyph}
            </div>
            <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.9); border: 1px solid #334155; color: #f8fafc; font-family: monospace; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.4); z-index: 2;">
              ${marker.id}
            </div>
          </div>
        `,
        iconSize: [30, 44],
        iconAnchor: [15, 20],
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(targetGroup);

      leafletMarker.on('click', () => {
        setSelectedMarker(marker);
        map.panTo([marker.lat, marker.lng], { animate: true, duration: 0.6 });
      });

      leafletMarker.bindTooltip(`<b>${marker.id} • ${marker.title}</b><br><span style="color:#94a3b8;">${marker.subtitle}</span>`, {
        direction: 'top',
        className: 'tactical-tooltip',
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Switching
  const handleTileChange = (mode: TileMode) => {
    setTileMode(mode);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfigs: Record<TileMode, { url: string; attr: string; subdomains?: string }> = {
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attr: '&copy; CARTO &copy; OpenStreetMap contributors',
        subdomains: 'abcd',
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attr: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
      },
      street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attr: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
      },
    };

    const cfg = tileConfigs[mode];
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attr,
      subdomains: cfg.subdomains || 'abc',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  };

  // Toggle Map Layers in Leaflet
  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    const nextState = !activeLayers[layerKey];
    setActiveLayers((prev) => ({ ...prev, [layerKey]: nextState }));

    const map = mapInstanceRef.current;
    const groups = layersGroupRef.current;
    if (!map || !groups) return;

    const groupMap: Record<keyof typeof activeLayers, L.LayerGroup> = {
      dangerZones: groups.danger,
      incidents: groups.incidents,
      brigades: groups.brigades,
      nodes: groups.nodes,
      shelters: groups.shelters,
    };

    const targetGroup = groupMap[layerKey];
    if (nextState) {
      if (!map.hasLayer(targetGroup)) map.addLayer(targetGroup);
    } else {
      if (map.hasLayer(targetGroup)) map.removeLayer(targetGroup);
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    mapInstanceRef.current?.setView([13.68, -88.85], 9, { animate: true });
    setSelectedMarker(null);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl shadow-lg flex flex-col relative overflow-hidden select-none min-h-[550px]">
      {/* Top HUD Controls Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-md">
          <Compass className="text-orange-500 animate-spin" style={{ animationDuration: '24s' }} size={16} />
          <span className="text-xs font-semibold text-slate-200 tracking-wide font-mono">
            GEO EL SALVADOR • API EN VIVO
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Tile Provider Switcher (Dark / Satellite / Street) */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 flex items-center gap-1 shadow-md">
          <button
            onClick={() => handleTileChange('dark')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
              tileMode === 'dark' ? 'bg-orange-500 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Mapa Táctico Oscuro (CartoDB)"
          >
            <MapIcon size={12} /> Oscuro
          </button>
          <button
            onClick={() => handleTileChange('satellite')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
              tileMode === 'satellite' ? 'bg-orange-500 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Imágenes Satelitales Reales (Esri World Imagery)"
          >
            <Satellite size={12} /> Satélite
          </button>
          <button
            onClick={() => handleTileChange('street')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
              tileMode === 'street' ? 'bg-orange-500 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Calles y Carreteras (OpenStreetMap)"
          >
            <Globe size={12} /> Calles
          </button>
        </div>
      </div>

      {/* Layer Toggles Floating Panel */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1.5 flex items-center gap-1 shadow-md">
          <button
            onClick={() => toggleLayer('dangerZones')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeLayers.dangerZones
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Anillos de Riesgo Volcánico Chaparrastique"
          >
            <Flame size={13} /> Peligro Volcán
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
            title="Acercar mapa"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Alejar mapa"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Centrar en El Salvador"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[500px] z-10" />

      {/* Selected Marker Detail Card Modal */}
      {selectedMarker && (
        <div className="absolute bottom-12 left-4 z-[1000] w-84 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
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

          <p className="text-xs text-slate-300 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 mb-3">
            {selectedMarker.details}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {selectedMarker.status}
            </span>
            <button
              onClick={() => alert(`Acción ejecutada sobre ${selectedMarker.id}: Telemetría enviada a brigadas en terreno.`)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-2.5 py-1 rounded transition"
            >
              Despachar
            </button>
          </div>
        </div>
      )}

      {/* Map Bottom Legend / Telemetry Status Strip */}
      <div className="bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 z-[1000]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Incidentes Críticos</span>
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

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>COBERTURA: EL SALVADOR</span>
          <span>•</span>
          <span className="text-emerald-500 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> MAPA REAL ENLACE ACTIVO
          </span>
        </div>
      </div>
    </div>
  );
}
