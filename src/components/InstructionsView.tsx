import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Download,
  Radio
} from 'lucide-react';

interface Protocol {
  id: string;
  code: string;
  title: string;
  category: 'EVACUACION' | 'MEDICO' | 'COMUNICACIONES' | 'SEGURIDAD';
  severity: 'ALTA' | 'MEDIA' | 'ESTANDAR';
  description: string;
  steps: string[];
}

const PROTOCOLS: Protocol[] = [
  {
    id: 'P-1',
    code: 'EVAC-VOLCAN-01',
    title: 'Protocolo de Evacuación Rápida por Flujo Piroclástico',
    category: 'EVACUACION',
    severity: 'ALTA',
    description: 'Procedimiento obligatorio para movilizar a la población civil dentro del radio de 5km y 10km en caso de explosión mayor.',
    steps: [
      'Activar de inmediato las sirenas comunitarias y la alerta broadcast vía nodo LoRa FARO.',
      'Instruir el uso ininterrumpido de paños húmedos o mascarillas N95 para evitar asfixia por ceniza abrasiva.',
      'Guiar a los civiles hacia las Rutas de Escape Norte (Ruta 4), evitando barrancas naturales donde descienden lahares.',
      'Efectuar el censo rápido en el punto de concentración antes del abordaje a los buses de evacuación.',
    ],
  },
  {
    id: 'P-2',
    code: 'RADIO-VHF-03',
    title: 'Disciplina Radial y Protocolo de Mensajería LoRa Mesh',
    category: 'COMUNICACIONES',
    severity: 'ESTANDAR',
    description: 'Normas de comunicación cuando las redes de telefonía celular 4G/5G y fibra óptica queden inhabilitadas.',
    steps: [
      'Mantener silencio en el Canal VHF 04 salvo emergencias con riesgo vital (Código Rojo).',
      'Transmitir reportes en formato estándar FARO: [Identificador] + [Ubicación GPS] + [Prioridad] + [Resumen en menos de 20 palabras].',
      'Verificar acuse de recibo del gateway LoRa (ACK en pantalla verde) antes de desplazarse.',
      'Alternar a batería solar secundaria en nodos repetidores en caso de corte nocturno.',
    ],
  },
  {
    id: 'P-3',
    code: 'MED-CENIZA-02',
    title: 'Triaje y Primeros Auxilios por Inhalación de Gases y Quemaduras',
    category: 'MEDICO',
    severity: 'ALTA',
    description: 'Guía clínica de campo para el personal de las ambulancias y puestos médicos avanzados.',
    steps: [
      'Lavar ojos inmediatamente con solución salina estéril; no permitir que el paciente se frote los ojos.',
      'Administrar oxígeno medicinal suplementario a pacientes con saturación menor a 90% debido a dióxido de azufre (SO2).',
      'Tratar quemaduras térmicas de contacto con apósitos estériles secos; no aplicar pomadas oleosas.',
      'Clasificar con tarjetas de triaje: Rojo (Inmediato), Amarillo (Diferido), Verde (Leve).',
    ],
  },
  {
    id: 'P-4',
    code: 'SEG-BRIGADA-05',
    title: 'Seguridad Operacional del Personal de Rescate en Zona Roja',
    category: 'SEGURIDAD',
    severity: 'MEDIA',
    description: 'Requisitos indispensables para que una brigada ingrese al sector de mayor riesgo.',
    steps: [
      'Ninguna brigada operará con menos de 4 efectivos y un oficial de enlace radial designado.',
      'Todo vehículo debe contar con tracción 4x4, winche, pala, mascarillas con filtros químicos y 48h de raciones de contingencia.',
      'En caso de rugido volcánico o cambio brusco en la dirección del viento, abortar misión y replegarse al Puesto Seguro.',
    ],
  },
];

export default function InstructionsView() {
  const { showToast } = useToast();
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol>(PROTOCOLS[0]);
  const [filterCategory, setFilterCategory] = useState<string>('TODAS');

  const filtered = PROTOCOLS.filter(
    (p) => filterCategory === 'TODAS' || p.category === filterCategory
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Instrucciones y Protocolos de Operación
          </h2>
          <p className="text-sm text-gray-500">
            Procedimientos estandarizados (SOP) y manuales de respuesta inmediata para el Centro de Mando.
          </p>
        </div>

        <button
          onClick={() =>
            showToast({
              title: 'Descarga de Protocolos Iniciada',
              message: 'Compendio de protocolos de emergencia para consulta offline generado en PDF.',
              type: 'download',
            })
          }
          className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-start"
        >
          <Download size={16} /> Descargar Manual Offline
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Protocol List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-1">
            {['TODAS', 'EVACUACION', 'MEDICO', 'COMUNICACIONES', 'SEGURIDAD'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filterCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.map((item) => {
            const isSelected = selectedProtocol.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedProtocol(item)}
                className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.severity === 'ALTA'
                        ? 'bg-red-100 text-red-700'
                        : item.severity === 'MEDIA'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mt-1">{item.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected Protocol Full Guide */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded">
                  {selectedProtocol.code}
                </span>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                  {selectedProtocol.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedProtocol.title}</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                {selectedProtocol.description}
              </p>
            </div>

            {/* Step by step instructions */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Pasos de Ejecución Obligatoria
              </h4>
              <div className="space-y-3">
                {selectedProtocol.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-medium text-gray-800 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Radio Codes Reference Card */}
            <div className="bg-gray-900 text-gray-200 p-4 rounded-xl border border-gray-800 text-xs">
              <div className="flex items-center gap-2 font-bold text-white mb-2">
                <Radio size={16} className="text-orange-400" />
                Códigos de Voz y Alerta Rápida
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                <div>
                  <span className="font-mono font-bold text-red-400">CÓDIGO ROJO:</span> Riesgo inminente de vida.
                </div>
                <div>
                  <span className="font-mono font-bold text-yellow-400">CÓDIGO AMARILLO:</span> Evacuación ordenada.
                </div>
                <div>
                  <span className="font-mono font-bold text-cyan-400">10-4:</span> Mensaje recibido y entendido.
                </div>
                <div>
                  <span className="font-mono font-bold text-emerald-400">10-20:</span> Envíe su posición GPS exacta.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
