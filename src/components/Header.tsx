import { Server, Radio, Satellite, Cloud } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    Sistema FARO
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 font-semibold uppercase">
                        Simulación • Datos Demo
                    </span>
                </h2>
                <p className="text-sm text-gray-500">Operación Volcán • Sector Norte</p>
            </div>

            <div className="flex gap-6 text-sm font-medium">
                <div className="flex items-center gap-2 text-gray-700">
                    <Server size={18} /> Servidor local: <span className="text-green-500 flex items-center gap-1">activo <span className="w-2 h-2 rounded-full bg-green-500"></span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Radio size={18} /> LoRa: <span className="text-yellow-500 flex items-center gap-1">3/4 nodos <span className="w-2 h-2 rounded-full bg-yellow-500"></span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Satellite size={18} /> Starlink: <span className="text-green-500 flex items-center gap-1">conectado <span className="w-2 h-2 rounded-full bg-green-500"></span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Cloud size={18} /> Nube: <span className="text-green-500 flex items-center gap-1">sincronizada <span className="w-2 h-2 rounded-full bg-green-500"></span></span>
                </div>
            </div>
        </header>
    );
}