import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  GEO_ES,
  GEO_NB,
  INITIAL_ZONES,
  INITIAL_INCS,
  INITIAL_BRIGS,
  INITIAL_BLOCKS,
  INITIAL_SHELTERS,
  VOLCANO,
  MAP_DIMENSIONS,
  SEVERITY_CONFIG,
  projectLatLon,
  blobPts,
  pathD
} from '../data/elSalvadorGeo';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Compass
} from 'lucide-react';

export default function InteractiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Estados de vista y navegación
  const [dimensions, setDimensions] = useState({ vw: 800, vh: 580 });
  const [cx, setCx] = useState(MAP_DIMENSIONS.W / 2);
  const [cy, setCy] = useState(MAP_DIMENSIONS.H / 2);
  const [zoom, setZoom] = useState(1);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Estados de filtros y capas
  const [sevOn, setSevOn] = useState<{ grave: boolean; moderada: boolean; leve: boolean }>({
    grave: true,
    moderada: true,
    leve: true
  });

  const [layerOn, setLayerOn] = useState<{
    zonas: boolean;
    brigadas: boolean;
    incidentes: boolean;
    accesos: boolean;
    albergues: boolean;
    deptos: boolean;
  }>({
    zonas: true,
    brigadas: true,
    incidentes: true,
    accesos: true,
    albergues: true,
    deptos: true
  });

  // Elemento seleccionado (id de zona o key de marcador)
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Referencias para interacciones táctiles y arrastre
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origCx: number;
    origCy: number;
    isDown: boolean;
    moved: boolean;
  }>({
    startX: 0,
    startY: 0,
    origCx: MAP_DIMENSIONS.W / 2,
    origCy: MAP_DIMENSIONS.H / 2,
    isDown: false,
    moved: false
  });

  const animRef = useRef<number | null>(null);

  // Manejar redimensionamiento del contenedor
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ vw: width, vh: height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Escala base
  const baseScale = useMemo(() => {
    if (!dimensions.vw || !dimensions.vh) return 1;
    return Math.min(dimensions.vw / MAP_DIMENSIONS.W, dimensions.vh / MAP_DIMENSIONS.H);
  }, [dimensions]);

  const currentScale = baseScale * zoom;

  // Transformación del mundo SVG
  const transformMatrix = useMemo(() => {
    const s = currentScale;
    const tx = dimensions.vw / 2 - cx * s;
    const ty = dimensions.vh / 2 - cy * s;
    return { s, tx, ty };
  }, [currentScale, dimensions, cx, cy]);

  // Barra de escala dinámica
  const scaleInfo = useMemo(() => {
    const ppk = MAP_DIMENSIONS.KMU * currentScale;
    const opts = [0.5, 1, 2, 5, 10, 20, 50, 100];
    let km = opts[0];
    opts.forEach((o) => {
      if (o * ppk <= 110) km = o;
    });
    const widthPx = Math.max(12, km * ppk);
    const label = km < 1 ? `${km * 1000} m` : `${km} km`;
    return { widthPx, label };
  }, [currentScale]);

  // Animación de viaje suave (flyTo)
  const flyTo = useCallback(
    (targetX: number, targetY: number, targetZoom: number) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const clampedZ = Math.max(1, Math.min(10, targetZoom));
      const startX = cx;
      const startY = cy;
      const startZ = zoom;
      const t0 = performance.now();
      const D = 480;

      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / D);
        // Easing suave (quad in/out)
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        setCx(startX + (targetX - startX) * e);
        setCy(startY + (targetY - startY) * e);
        setZoom(startZ * Math.pow(clampedZ / startZ, e));
        if (k < 1) {
          animRef.current = requestAnimationFrame(step);
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    [cx, cy, zoom]
  );

  // Zoom incremental centrado
  const handleZoom = (factor: number) => {
    const nextZ = Math.max(1, Math.min(10, zoom * factor));
    flyTo(cx, cy, nextZ);
  };

  const handleReset = () => {
    flyTo(MAP_DIMENSIONS.W / 2, MAP_DIMENSIONS.H / 2, 1);
  };

  // Eventos de arrastre con pointer events
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origCx: cx,
      origCy: cy,
      isDown: true,
      moved: false
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignorar si no es soportado
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && Math.hypot(dx, dy) > 4) {
      dragRef.current.moved = true;
      setIsGrabbing(true);
    }
    if (dragRef.current.moved) {
      const s = currentScale;
      setCx(dragRef.current.origCx - dx / s);
      setCy(dragRef.current.origCy - dy / s);
    }
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current.isDown = false;
    setIsGrabbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar
    }
  };

  // Zoom con rueda de ratón
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const s0 = currentScale;
    const tx = dimensions.vw / 2 - cx * s0;
    const ty = dimensions.vh / 2 - cy * s0;
    const wx = (px - tx) / s0;
    const wy = (py - ty) / s0;

    const delta = -e.deltaY * 0.0015;
    const factor = Math.exp(delta);
    const nextZoom = Math.max(1, Math.min(10, zoom * factor));
    const s1 = baseScale * nextZoom;

    setZoom(nextZoom);
    setCx(wx - (px - dimensions.vw / 2) / s1);
    setCy(wy - (py - dimensions.vh / 2) / s1);
  };

  // Cálculo de zonas con curvas blob
  const renderedZones = useMemo(() => {
    return INITIAL_ZONES.map((z) => {
      const [cenX, cenY] = projectLatLon(z.c[0], z.c[1]);
      const rx = z.r[0] * MAP_DIMENSIONS.KMU;
      const ry = z.r[1] * MAP_DIMENSIONS.KMU;
      const pts = blobPts(cenX, cenY, rx, ry, z.seed);
      const d = pathD(pts);
      const [lblX, lblY] = projectLatLon(z.lbl[0], z.lbl[1]);
      return {
        ...z,
        cenX,
        cenY,
        d,
        lblX,
        lblY
      };
    });
  }, []);

  // Proyección de puntos
  const projectedIncidents = useMemo(() => {
    return INITIAL_INCS.map((inc) => {
      const [x, y] = projectLatLon(inc.p[0], inc.p[1]);
      return { ...inc, x, y };
    });
  }, []);

  const projectedBrigades = useMemo(() => {
    return INITIAL_BRIGS.map((br) => {
      const [x, y] = projectLatLon(br.p[0], br.p[1]);
      return { ...br, x, y };
    });
  }, []);

  const projectedBlocks = useMemo(() => {
    return INITIAL_BLOCKS.map((blk) => {
      const [x, y] = projectLatLon(blk.p[0], blk.p[1]);
      return { ...blk, x, y };
    });
  }, []);

  const projectedShelters = useMemo(() => {
    return INITIAL_SHELTERS.map((sh) => {
      const [x, y] = projectLatLon(sh.p[0], sh.p[1]);
      return { ...sh, x, y };
    });
  }, []);

  const volcanoPos = useMemo(() => {
    const [x, y] = projectLatLon(VOLCANO.p[0], VOLCANO.p[1]);
    return { x, y };
  }, []);

  // Elemento activo seleccionado para la tarjeta
  const activeDetail = useMemo(() => {
    if (!selectedKey) return null;

    // Buscar en zonas
    const z = renderedZones.find((item) => item.id === selectedKey);
    if (z) return { type: 'zone' as const, data: z };

    // Buscar en incidentes
    const inc = projectedIncidents.find((item) => item.key === selectedKey);
    if (inc) return { type: 'incident' as const, data: inc };

    // Buscar en brigadas
    const br = projectedBrigades.find((item) => item.key === selectedKey);
    if (br) return { type: 'brigade' as const, data: br };

    // Buscar en accesos
    const blk = projectedBlocks.find((item) => item.key === selectedKey);
    if (blk) return { type: 'block' as const, data: blk };

    // Buscar en albergues
    const sh = projectedShelters.find((item) => item.key === selectedKey);
    if (sh) return { type: 'shelter' as const, data: sh };

    return null;
  }, [
    selectedKey,
    renderedZones,
    projectedIncidents,
    projectedBrigades,
    projectedBlocks,
    projectedShelters
  ]);

  // Selección de elemento
  const handleSelect = (key: string, fly = false, coord?: { x: number; y: number }) => {
    setSelectedKey(key);
    if (fly && coord) {
      flyTo(coord.x, coord.y, Math.max(zoom, 3.2));
    }
  };

  // Convertir coordenadas del mapa a pantalla para los marcadores
  const toScreen = useCallback(
    (mx: number, my: number) => {
      const { s, tx, ty } = transformMatrix;
      return {
        x: mx * s + tx,
        y: my * s + ty
      };
    },
    [transformMatrix]
  );

  return (
    <div
      ref={containerRef}
      className={`relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'flex-1 min-h-[640px]'
      }`}
      style={{
        fontFamily: "'Barlow', system-ui, sans-serif"
      }}
    >
      {/* ============================================================== */}
      {/* PANEL LATERAL RETRÁCTIL (GRAVEDAD, CAPAS, LEYENDA Y ZONAS)     */}
      {/* ============================================================== */}
      <aside
        className={`bg-white border-r border-[#DCDCDC] flex flex-col z-20 transition-all duration-300 ease-in-out shrink-0 ${
          panelOpen ? 'w-80' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="p-4 border-b border-[#DCDCDC] flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A13] animate-pulse" />
            <h2 className="font-bold text-xs tracking-wider uppercase text-gray-800">
              Control Táctico FARO
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Ocultar panel lateral"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          {/* SECCIÓN 1: GRAVEDAD */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-500 font-['Barlow_Condensed']">
              Gravedad de Amenaza
            </h3>
            <div className="space-y-1.5">
              {(['grave', 'moderada', 'leve'] as const).map((k) => {
                const count = INITIAL_ZONES.filter((z) => z.sev === k).length;
                const isActive = sevOn[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSevOn((prev) => ({ ...prev, [k]: !prev[k] }))}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'border-gray-300 bg-white shadow-xs opacity-100'
                        : 'border-transparent bg-gray-100/70 text-gray-400 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded border-2 border-[#FF6A13] shrink-0 ${
                          k === 'grave'
                            ? 'bg-[#FF6A13]'
                            : k === 'moderada'
                            ? 'bg-[#FF6A13]/40'
                            : 'bg-[#FF6A13]/15'
                        }`}
                        style={{
                          backgroundImage:
                            k === 'grave'
                              ? 'repeating-linear-gradient(45deg, #0D0D0D 0 1.5px, transparent 1.5px 5px)'
                              : k === 'moderada'
                              ? 'radial-gradient(#0D0D0D 1.2px, transparent 1.5px)'
                              : undefined,
                          backgroundSize: k === 'moderada' ? '5px 5px' : undefined
                        }}
                      />
                      <div className="truncate">
                        <div className="font-semibold text-gray-900 leading-tight">
                          {SEVERITY_CONFIG[k].label}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {SEVERITY_CONFIG[k].desc}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-gray-600 px-1.5 py-0.5 rounded bg-gray-100">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECCIÓN 2: CAPAS DEL MAPA */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-500 font-['Barlow_Condensed']">
              Capas del Mapa
            </h3>
            <div className="space-y-1 bg-gray-50/70 p-2.5 rounded-lg border border-gray-200">
              {[
                {
                  id: 'zonas' as const,
                  label: 'Zonas Afectadas',
                  count: INITIAL_ZONES.length,
                  icon: (
                    <div className="w-4 h-4 rounded border-2 border-[#FF6A13] bg-[#FF6A13]/30" />
                  )
                },
                {
                  id: 'brigadas' as const,
                  label: 'Brigadas en Terreno',
                  count: INITIAL_BRIGS.length,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                      <path
                        d="M12 4l8 14H4z"
                        fill="#0D0D0D"
                        stroke="#FFF"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )
                },
                {
                  id: 'incidentes' as const,
                  label: 'Incidentes Críticos',
                  count: INITIAL_INCS.length,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                      <path
                        d="M12 21c-1.5-4-6-7-6-11a6 6 0 1 1 12 0c0 4-4.5 7-6 11z"
                        fill="#FF6A13"
                      />
                      <circle cx="12" cy="10" r="2.2" fill="#0D0D0D" />
                    </svg>
                  )
                },
                {
                  id: 'accesos' as const,
                  label: 'Accesos Bloqueados',
                  count: INITIAL_BLOCKS.length,
                  icon: (
                    <div className="w-4 h-4 rounded-full bg-[#FF6A13] border border-black flex items-center justify-center text-[10px] font-bold text-black leading-none">
                      ✕
                    </div>
                  )
                },
                {
                  id: 'albergues' as const,
                  label: 'Albergues Activos',
                  count: INITIAL_SHELTERS.length,
                  icon: (
                    <div className="w-4 h-4 rounded bg-black flex items-center justify-center text-white text-[9px] font-bold">
                      ⌂
                    </div>
                  )
                },
                {
                  id: 'deptos' as const,
                  label: 'Límites Departamentales',
                  count: GEO_ES.length,
                  icon: <Layers size={14} className="text-gray-500" />
                }
              ].map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center justify-between p-1.5 hover:bg-white rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layerOn[layer.id]}
                      onChange={(e) =>
                        setLayerOn((prev) => ({ ...prev, [layer.id]: e.target.checked }))
                      }
                      className="rounded text-[#FF6A13] focus:ring-[#FF6A13] accent-black"
                    />
                    {layer.icon}
                    <span className="text-xs font-medium text-gray-700">
                      {layer.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-gray-400">
                    {layer.count}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* SECCIÓN 3: CÓMO LEER LOS SÍMBOLOS */}
          <section className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 space-y-2 text-xs text-gray-600">
            <div className="font-semibold text-gray-800 text-[11px] uppercase tracking-wider">
              Guía de Simbología
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M12 4l8 14H4z" fill="#0D0D0D" stroke="#FFF" strokeWidth="1.5" />
                </svg>
                <span>Brigada en atención</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M12 4l8 14H4z" fill="#FFF" stroke="#0D0D0D" strokeWidth="2.5" />
                </svg>
                <span>Brigada disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M12 21c-1.5-4-6-7-6-11a6 6 0 1 1 12 0c0 4-4.5 7-6 11z" fill="#FF6A13" />
                </svg>
                <span>Incidente crítico activo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF6A13] border border-black flex items-center justify-center text-[8px] font-bold">
                  ✕
                </div>
                <span>Paso vehicular bloqueado</span>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: ZONAS POR HORA DE IMPACTO */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-500 font-['Barlow_Condensed']">
              Línea de Impacto
            </h3>
            <div className="space-y-2">
              {renderedZones
                .filter((z) => sevOn[z.sev])
                .sort((a, b) => a.t.localeCompare(b.t))
                .map((z) => {
                  const isSelected = selectedKey === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => handleSelect(z.id, true, { x: z.cenX, y: z.cenY })}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#0D0D0D] bg-orange-50/50 shadow-xs ring-1 ring-[#0D0D0D]'
                          : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {z.t} hrs
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            z.sev === 'grave'
                              ? 'bg-[#FF6A13] text-white'
                              : z.sev === 'moderada'
                              ? 'bg-[#FF6A13]/25 text-[#C2410C]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {SEVERITY_CONFIG[z.sev].label}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-gray-900 truncate">
                        {z.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {z.dep} • {z.txt}
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* BOTÓN FLOTANTE PARA ABRIR EL PANEL SI ESTÁ CERRADO             */}
      {/* ============================================================== */}
      {!panelOpen && (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="absolute top-4 left-4 z-30 p-2.5 bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-md text-gray-800 hover:bg-gray-50 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
        >
          <ChevronRight size={16} />
          <span>Filtros y Capas</span>
        </button>
      )}

      {/* ============================================================== */}
      {/* ÁREA PRINCIPAL: LIENZO VECTORIAL SVG                           */}
      {/* ============================================================== */}
      <div className="flex-1 relative bg-white overflow-hidden select-none">
        <svg
          ref={svgRef}
          className={`w-full h-full block ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <defs>
            {/* Desenfoque para la pluma volcánica */}
            <filter id="faro-blur" x="-40%" y="-80%" width="180%" height="260%">
              <feGaussianBlur stdDeviation="5" />
            </filter>

            {/* Patrón de líneas diagonales para gravedad Grave */}
            <pattern
              id="p-grave"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform={`scale(${1 / transformMatrix.s}) rotate(45)`}
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#0D0D0D" strokeWidth="1.3" />
            </pattern>

            {/* Patrón de puntos para gravedad Moderada */}
            <pattern
              id="p-moderada"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform={`scale(${1 / transformMatrix.s})`}
            >
              <circle cx="3" cy="3" r="1.2" fill="#0D0D0D" />
            </pattern>
          </defs>

          {/* FONDO Y TIERRAS VECINAS (MUNDO VECTORIAL CON ZOOM Y PAN) */}
          <g
            transform={`translate(${transformMatrix.tx.toFixed(1)}, ${transformMatrix.ty.toFixed(
              1
            )}) scale(${transformMatrix.s})`}
          >
            {/* Océano y masa base neutra */}
            <rect x="-6000" y="-6000" width="13000" height="13000" fill="#FFFFFF" />

            {/* Tierras vecinas (Guatemala, Honduras, Nicaragua) */}
            {GEO_NB.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill="#F1F1F1"
                stroke="#F1F1F1"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Sombra base bajo El Salvador para relieve táctico */}
            {GEO_ES.map((dept, idx) => (
              <path
                key={`under-${idx}`}
                d={dept.d}
                fill="#0D0D0D"
                stroke="#0D0D0D"
                strokeWidth="3.2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Territorio de El Salvador con límites de departamentos */}
            {GEO_ES.map((dept, idx) => (
              <path
                key={`dept-${idx}`}
                d={dept.d}
                fill="#FFFFFF"
                stroke="rgba(13, 13, 13, 0.28)"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Pluma de humo del Volcán de Santa Ana */}
            <g>
              {[
                [22, -14, 16, 9],
                [48, -28, 22, 11],
                [80, -40, 24, 11],
                [110, -46, 22, 9]
              ].map(([dx, dy, rx, ry], i) => (
                <ellipse
                  key={i}
                  cx={(volcanoPos.x + dx).toFixed(1)}
                  cy={(volcanoPos.y + dy).toFixed(1)}
                  rx={rx}
                  ry={ry}
                  fill="rgba(13, 13, 13, 0.16)"
                  filter="url(#faro-blur)"
                  pointerEvents="none"
                />
              ))}
            </g>

            {/* Zonas Afectadas */}
            {layerOn.zonas &&
              renderedZones
                .filter((z) => sevOn[z.sev])
                .map((z) => {
                  const isSel = selectedKey === z.id;
                  return (
                    <g key={z.id}>
                      {/* Fondo de color de la zona */}
                      <path
                        d={z.d}
                        fill="#FF6A13"
                        fillOpacity={
                          z.sev === 'grave' ? 0.78 : z.sev === 'moderada' ? 0.4 : 0.16
                        }
                        stroke={isSel ? '#0D0D0D' : '#FF6A13'}
                        strokeWidth={isSel ? 3.5 : 2}
                        vectorEffect="non-scaling-stroke"
                        className="cursor-pointer transition-opacity hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dragRef.current.moved) return;
                          handleSelect(z.id, false);
                        }}
                      />

                      {/* Patrón de líneas o puntos según gravedad */}
                      {z.sev !== 'leve' && (
                        <path
                          d={z.d}
                          fill={`url(#p-${z.sev})`}
                          fillOpacity={0.88}
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
          </g>

          {/* ============================================================== */}
          {/* MARCADORES Y ETIQUETAS EN PANTALLA (TAMAÑO TÁCTICO CONSTANTE)  */}
          {/* ============================================================== */}

          {/* Nombres de Departamentos y Países Vecinos */}
          {layerOn.deptos && (
            <g pointerEvents="none">
              {GEO_ES.map((dept, i) => {
                const sPos = toScreen(dept.x, dept.y);
                return (
                  <text
                    key={`label-${i}`}
                    x={sPos.x.toFixed(1)}
                    y={sPos.y.toFixed(1)}
                    textAnchor="middle"
                    fill="#595959"
                    stroke="#FFFFFF"
                    strokeWidth="3.2"
                    paintOrder="stroke"
                    strokeLinejoin="round"
                    className="font-['Barlow_Condensed'] font-bold text-[10.5px] tracking-widest opacity-85 uppercase select-none"
                  >
                    {dept.n}
                  </text>
                );
              })}

              {/* Etiquetas geográficas de países vecinos */}
              {[
                { name: 'GUATEMALA', lat: 14.4, lon: -90.03 },
                { name: 'HONDURAS', lat: 14.3, lon: -88.3 },
                { name: 'OCÉANO PACÍFICO', lat: 13.1, lon: -89.45 }
              ].map((lbl, idx) => {
                const [mx, my] = projectLatLon(lbl.lat, lbl.lon);
                const sPos = toScreen(mx, my);
                return (
                  <text
                    key={`geolbl-${idx}`}
                    x={sPos.x.toFixed(1)}
                    y={sPos.y.toFixed(1)}
                    textAnchor="middle"
                    fill="#8A8A8A"
                    className="font-['Barlow_Condensed'] font-semibold text-[13px] tracking-[0.3em] opacity-80 select-none"
                  >
                    {lbl.name}
                  </text>
                );
              })}
            </g>
          )}

          {/* Etiquetas de las Zonas */}
          {layerOn.zonas &&
            renderedZones
              .filter((z) => sevOn[z.sev])
              .map((z) => {
                const sPos = toScreen(z.lblX, z.lblY);
                return (
                  <g
                    key={`lbl-${z.id}`}
                    transform={`translate(${sPos.x.toFixed(1)}, ${sPos.y.toFixed(1)})`}
                    pointerEvents="none"
                  >
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill="#0D0D0D"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                      paintOrder="stroke"
                      className="font-['Barlow_Condensed'] font-bold text-[14px] tracking-wider"
                    >
                      {z.name.toUpperCase()}
                    </text>
                    <text
                      x="0"
                      y="13"
                      textAnchor="middle"
                      fill="#0D0D0D"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth="3"
                      paintOrder="stroke"
                      className="font-['IBM_Plex_Mono'] font-medium text-[10.5px]"
                    >
                      {z.t} • {SEVERITY_CONFIG[z.sev].label.toUpperCase()}
                    </text>
                  </g>
                );
              })}

          {/* Marcador del Volcán de Santa Ana */}
          {(() => {
            const sPos = toScreen(volcanoPos.x, volcanoPos.y);
            return (
              <g
                transform={`translate(${sPos.x.toFixed(1)}, ${sPos.y.toFixed(1)})`}
                className="cursor-pointer"
                onClick={() =>
                  handleSelect('volcano', false, {
                    x: volcanoPos.x,
                    y: volcanoPos.y
                  })
                }
              >
                <path
                  d="M0,-13L13,10L-13,10Z"
                  fill="#0D0D0D"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <text
                  x="-19"
                  y="-2"
                  textAnchor="end"
                  fill="#0D0D0D"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  className="font-['Barlow_Condensed'] font-bold text-[13px] tracking-wider"
                >
                  {VOLCANO.name.toUpperCase()}
                </text>
                <text
                  x="-19"
                  y="11"
                  textAnchor="end"
                  fill="#0D0D0D"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3"
                  paintOrder="stroke"
                  className="font-['IBM_Plex_Mono'] font-medium text-[10.5px]"
                >
                  {VOLCANO.alt}
                </text>
              </g>
            );
          })()}

          {/* Accesos Bloqueados */}
          {layerOn.accesos &&
            projectedBlocks.map((b) => {
              const sPos = toScreen(b.x, b.y);
              const isSel = selectedKey === b.key;
              return (
                <g
                  key={b.key}
                  transform={`translate(${sPos.x.toFixed(1)}, ${sPos.y.toFixed(1)})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragRef.current.moved) return;
                    handleSelect(b.key, false);
                  }}
                >
                  {/* Anillo de selección táctico */}
                  {isSel && (
                    <circle
                      r="17"
                      fill="none"
                      stroke="#0D0D0D"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}
                  {/* Círculo de toque amplio */}
                  <circle r="16" fill="transparent" />
                  {/* Círculo naranja de advertencia */}
                  <circle r="10" fill="#FF6A13" stroke="#0D0D0D" strokeWidth="2" />
                  {/* Cruz blanca */}
                  <path
                    d="M-4,-4L4,4M4,-4L-4,4"
                    stroke="#0D0D0D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

          {/* Albergues */}
          {layerOn.albergues &&
            projectedShelters.map((s) => {
              const sPos = toScreen(s.x, s.y);
              const isSel = selectedKey === s.key;
              return (
                <g
                  key={s.key}
                  transform={`translate(${sPos.x.toFixed(1)}, ${sPos.y.toFixed(1)})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragRef.current.moved) return;
                    handleSelect(s.key, false);
                  }}
                >
                  {isSel && (
                    <circle
                      r="19"
                      fill="none"
                      stroke="#0D0D0D"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle r="16" fill="transparent" />
                  <rect
                    x="-11"
                    y="-11"
                    width="22"
                    height="22"
                    rx="4"
                    fill="#0D0D0D"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <path
                    d="M-6,1L0,-5L6,1M-3.5,0V6H3.5V0"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

          {/* Brigadas */}
          {layerOn.brigadas &&
            projectedBrigades.map((b) => {
              const sPos = toScreen(b.x, b.y);
              const isSel = selectedKey === b.key;
              const isAttending = b.st === 'En atención';
              const isAvailable = b.st === 'Disponible';
              return (
                <g
                  key={b.key}
                  transform={`translate(${sPos.x.toFixed(1)}, ${sPos.y.toFixed(1)})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragRef.current.moved) return;
                    handleSelect(b.key, false);
                  }}
                >
                  {isSel && (
                    <circle
                      r="21"
                      fill="none"
                      stroke="#0D0D0D"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle r="17" fill="transparent" />
                  <path
                    d="M0,-12L11,8L-11,8Z"
                    fill={isAttending ? '#0D0D0D' : isAvailable ? '#FFFFFF' : '#9A9A9A'}
                    stroke={isAttending ? '#FFFFFF' : '#0D0D0D'}
                    strokeWidth={isAvailable ? 2.5 : 2}
                    strokeDasharray={!isAttending && !isAvailable ? '3 2' : undefined}
                    strokeLinejoin="round"
                  />
                  <text
                    x="0"
                    y="24"
                    textAnchor="middle"
                    fill="#0D0D0D"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    paintOrder="stroke"
                    className="font-['Barlow_Condensed'] font-bold text-[11.5px] tracking-wider"
                  >
                    {b.key}
                  </text>
                </g>
              );
            })}

          {/* Incidentes Críticos (Pins con número) */}
          {layerOn.incidentes &&
            projectedIncidents.map((inc) => {
              const sPos = toScreen(inc.x, inc.y);
              const isSel = selectedKey === inc.key;
              const isAct = inc.st === 'Activo';
              const isOk = inc.st === 'En atención';

              return (
                <g
                  key={inc.key}
                  transform={`translate(${sPos.x.toFixed(1)}, ${sPos.y.toFixed(1)})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragRef.current.moved) return;
                    handleSelect(inc.key, false);
                  }}
                >
                  {isSel && (
                    <circle
                      cy="-21"
                      r="19"
                      fill="none"
                      stroke="#0D0D0D"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle cy="-18" r="15" fill="transparent" />
                  <path
                    d="M0,0C-2.5,-7 -11,-12 -11,-21a11,11 0 1 1 22,0C11,-12 2.5,-7 0,0Z"
                    fill={isAct ? '#FF6A13' : isOk ? '#0D0D0D' : '#FFFFFF'}
                    stroke={isAct || isOk ? '#FFFFFF' : '#0D0D0D'}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <text
                    x="0"
                    y="-21"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isAct ? '#0D0D0D' : isOk ? '#FFFFFF' : '#0D0D0D'}
                    className="font-['IBM_Plex_Mono'] font-bold text-[11.5px] select-none"
                  >
                    {inc.n}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* ============================================================== */}
        {/* HUD SUPERIOR IZQUIERDO: BRÚJULA NORTE Y BARRA DE ESCALA        */}
        {/* ============================================================== */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-xs border border-gray-300 rounded-lg shadow-sm px-3 py-2 flex items-center gap-3">
          <div className="flex flex-col items-center">
            <Compass size={18} className="text-gray-900 animate-spin-slow" />
            <span className="font-['Barlow_Condensed'] font-bold text-[10px] text-gray-900 mt-0.5">
              N
            </span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex flex-col gap-0.5 font-['IBM_Plex_Mono'] text-[11px] text-gray-600">
            <div
              className="h-1.5 border-2 border-t-0 border-gray-900 transition-all duration-200"
              style={{ width: `${scaleInfo.widthPx}px` }}
            />
            <span className="font-semibold">{scaleInfo.label}</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* HUD SUPERIOR DERECHO: CONTROLES DE ZOOM Y PANTALLA COMPLETA    */}
        {/* ============================================================== */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-xs border border-gray-300 rounded-lg shadow-sm flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={() => handleZoom(1.6)}
            className="w-9 h-9 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-200"
            title="Acercar mapa (+)"
          >
            <span className="text-lg font-bold leading-none">+</span>
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1 / 1.6)}
            className="w-9 h-9 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-200"
            title="Alejar mapa (-)"
          >
            <span className="text-lg font-bold leading-none">−</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-9 h-9 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-200"
            title="Centrar mapa en El Salvador"
          >
            <svg width="16" height="16" viewBox="0 0 18 18">
              <circle
                cx="9"
                cy="9"
                r="4.5"
                fill="none"
                stroke="#0D0D0D"
                strokeWidth="1.8"
              />
              <path
                d="M9 1.5v3M9 13.5v3M1.5 9h3M13.5 9h3"
                stroke="#0D0D0D"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-9 h-9 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* ============================================================== */}
        {/* NOTA FLOTANTE INFERIOR O TARJETA DE DETALLE                    */}
        {/* ============================================================== */}
        {!activeDetail ? (
          <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-xs border border-gray-300 rounded-lg shadow-sm px-3.5 py-2 text-xs text-gray-600 max-w-sm pointer-events-none">
            💡 Toca una zona o símbolo para inspeccionar detalles y unidades de apoyo.
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 z-30 w-[min(380px,calc(100%-32px))] bg-white border border-[#DCDCDC] rounded-xl shadow-xl p-4.5 max-h-[75%] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Cerrar detalle"
            >
              <X size={18} />
            </button>

            {/* ZONA AFECTADA */}
            {activeDetail.type === 'zone' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['Barlow_Condensed']">
                  Zona Afectada
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight pr-6">
                  {activeDetail.data.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                      activeDetail.data.sev === 'grave'
                        ? 'bg-[#FF6A13] text-black border-[#FF6A13]'
                        : activeDetail.data.sev === 'moderada'
                        ? 'bg-[#FF6A13]/25 text-[#C2410C] border-[#FF6A13]'
                        : 'bg-white text-gray-800 border-gray-400'
                    }`}
                  >
                    {SEVERITY_CONFIG[activeDetail.data.sev].label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {SEVERITY_CONFIG[activeDetail.data.sev].desc}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Hora de impacto
                    </div>
                    <div className="font-mono font-medium text-gray-800">
                      {activeDetail.data.t} hrs
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Departamento
                    </div>
                    <div className="font-semibold text-gray-800 truncate">
                      {activeDetail.data.dep}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {activeDetail.data.txt}
                </p>

                {/* Unidades relacionadas en la zona */}
                {(() => {
                  const zId = activeDetail.data.id;
                  const relIncs = INITIAL_INCS.filter((i) => i.zone === zId);
                  const relBrigs = INITIAL_BRIGS.filter((b) => b.zone === zId);
                  const relBlks = INITIAL_BLOCKS.filter((b) => b.zone === zId);
                  const relShelters = INITIAL_SHELTERS.filter((s) => s.zone === zId);

                  if (
                    !relIncs.length &&
                    !relBrigs.length &&
                    !relBlks.length &&
                    !relShelters.length
                  ) {
                    return null;
                  }

                  return (
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['Barlow_Condensed']">
                        Puntos de Atención en la Zona
                      </h4>
                      <div className="space-y-1">
                        {relIncs.map((i) => {
                          const [px, py] = projectLatLon(i.p[0], i.p[1]);
                          return (
                            <button
                              key={i.key}
                              type="button"
                              onClick={() => handleSelect(i.key, true, { x: px, y: py })}
                              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:underline block truncate"
                            >
                              📍 INC-{String(i.n).padStart(3, '0')} • {i.name}
                            </button>
                          );
                        })}
                        {relBrigs.map((b) => {
                          const [px, py] = projectLatLon(b.p[0], b.p[1]);
                          return (
                            <button
                              key={b.key}
                              type="button"
                              onClick={() => handleSelect(b.key, true, { x: px, y: py })}
                              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:underline block truncate"
                            >
                              🚒 Brigada {b.key} {b.name} ({b.st})
                            </button>
                          );
                        })}
                        {relBlks.map((b) => {
                          const [px, py] = projectLatLon(b.p[0], b.p[1]);
                          return (
                            <button
                              key={b.key}
                              type="button"
                              onClick={() => handleSelect(b.key, true, { x: px, y: py })}
                              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:underline block truncate"
                            >
                              ⛔ Vía Bloqueada: {b.name}
                            </button>
                          );
                        })}
                        {relShelters.map((s) => {
                          const [px, py] = projectLatLon(s.p[0], s.p[1]);
                          return (
                            <button
                              key={s.key}
                              type="button"
                              onClick={() => handleSelect(s.key, true, { x: px, y: py })}
                              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:underline block truncate"
                            >
                              ⌂ {s.name} ({s.st})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* INCIDENTE CRÍTICO */}
            {activeDetail.type === 'incident' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['Barlow_Condensed']">
                  Incidente INC-{String(activeDetail.data.n).padStart(3, '0')}
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight pr-6">
                  {activeDetail.data.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                      activeDetail.data.sev === 'grave'
                        ? 'bg-[#FF6A13] text-black border-[#FF6A13]'
                        : 'bg-[#FF6A13]/25 text-[#C2410C] border-[#FF6A13]'
                    }`}
                  >
                    {SEVERITY_CONFIG[activeDetail.data.sev].label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                      activeDetail.data.st === 'Activo'
                        ? 'bg-[#FF6A13] text-black border-[#0D0D0D]'
                        : activeDetail.data.st === 'En atención'
                        ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                        : 'bg-white text-gray-500 border-dashed border-gray-400'
                    }`}
                  >
                    {activeDetail.data.st}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Reportado
                    </div>
                    <div className="font-mono font-medium text-gray-800">
                      16 oct • {activeDetail.data.rep}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Zona Asignada
                    </div>
                    <div className="font-semibold text-gray-800 truncate">
                      {INITIAL_ZONES.find((z) => z.id === activeDetail.data.zone)?.name ||
                        'Sector General'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {activeDetail.data.txt}
                </p>
              </div>
            )}

            {/* BRIGADA */}
            {activeDetail.type === 'brigade' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['Barlow_Condensed']">
                  Brigada de Socorro
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight pr-6">
                  {activeDetail.data.key} {activeDetail.data.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                      activeDetail.data.st === 'En atención'
                        ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                        : activeDetail.data.st === 'Disponible'
                        ? 'bg-white text-gray-900 border-[#0D0D0D]'
                        : 'bg-gray-200 text-gray-600 border-dashed border-gray-400'
                    }`}
                  >
                    {activeDetail.data.st}
                  </span>
                </div>
                <div className="text-xs pt-1 border-t border-gray-100">
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    Zona Operativa
                  </div>
                  <div className="font-semibold text-gray-800">
                    {INITIAL_ZONES.find((z) => z.id === activeDetail.data.zone)?.name ||
                      'Base Central'}
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {activeDetail.data.txt}
                </p>
              </div>
            )}

            {/* ACCESO BLOQUEADO */}
            {activeDetail.type === 'block' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['Barlow_Condensed']">
                  Acceso Bloqueado
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight pr-6">
                  {activeDetail.data.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#FF6A13] text-black border border-black">
                    Paso Inhabilitado
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Bloqueado desde
                    </div>
                    <div className="font-mono font-medium text-gray-800">
                      {activeDetail.data.since} hrs
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Sector
                    </div>
                    <div className="font-semibold text-gray-800 truncate">
                      {INITIAL_ZONES.find((z) => z.id === activeDetail.data.zone)?.name ||
                        'Tramo vial'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {activeDetail.data.txt}
                </p>
              </div>
            )}

            {/* ALBERGUE */}
            {activeDetail.type === 'shelter' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['Barlow_Condensed']">
                  Albergue Temporal
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight pr-6">
                  {activeDetail.data.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-black text-white">
                    {activeDetail.data.st}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {activeDetail.data.txt}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
