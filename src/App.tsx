import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import PrioritiesPanel from './components/PrioritiesPanel';
import InteractiveMap from './components/InteractiveMap';
import IncidentsView from './components/IncidentsView';
import BrigadesView from './components/BrigadesView';
import ResourcesView from './components/ResourcesView';
import InstructionsView from './components/InstructionsView';
import CooperationView from './components/CooperationView';
import AuditLogView from './components/AuditLogView';

import { ToastProvider } from './context/ToastContext';

function App() {
  const [activeTab, setActiveTab] = useState<string>('Operaciones');

  return (
    <ToastProvider>
      <div className="flex h-screen bg-[#f3f4f6] font-sans antialiased text-gray-900">
        {/* Sidebar con navegación funcional entre módulos */}
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        {/* Contenedor principal con margen izquierdo para no taparse con el sidebar */}
        <div className="ml-64 flex-1 flex flex-col overflow-hidden">
          {/* Barra superior de estado de conectividad */}
          <Header />

          {/* Vista principal dinámica */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'Operaciones' && (
              <div className="flex flex-col gap-6">
                {/* Tarjetas KPI de resumen */}
                <KpiCards />

                {/* Fila principal: Mapa Táctico Interactivo + Panel Lateral de Prioridades */}
                <div className="flex flex-col xl:flex-row gap-6">
                  {/* Mapa Táctico FARO con capas y telemetría LoRa */}
                  <InteractiveMap />

                  {/* Panel lateral de prioridades */}
                  <PrioritiesPanel />
                </div>
              </div>
            )}

            {activeTab === 'Incidentes' && <IncidentsView />}

            {activeTab === 'Brigadas' && <BrigadesView />}

            {activeTab === 'Recursos' && <ResourcesView />}

            {activeTab === 'Instrucciones' && <InstructionsView />}

            {activeTab === 'Cooperación' && <CooperationView />}

            {activeTab === 'Registro' && <AuditLogView />}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;