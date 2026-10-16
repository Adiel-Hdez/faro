import { AlertTriangle, Users, FileText, Clock } from 'lucide-react';

export default function KpiCards() {
    const cards = [
        { title: 'Incidentes activos', value: '12', subtext: '3 con prioridad alta', subcolor: 'text-red-500', icon: <AlertTriangle size={24} className="text-red-500" />, bg: 'bg-red-50' },
        { title: 'Brigadas disponibles', value: '2/4', icon: <Users size={24} className="text-gray-700" />, bg: 'bg-gray-100' },
        { title: 'Solicitudes sin asignar', value: '5', icon: <FileText size={24} className="text-gray-700" />, bg: 'bg-gray-100' },
        { title: 'Órdenes por confirmar', value: '2', icon: <Clock size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-gray-300 transition">
                    <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-lg ${card.bg}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                {card.subtext && <p className={`text-xs font-semibold ${card.subcolor}`}>{card.subtext}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}