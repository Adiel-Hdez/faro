import { AlertCircle, Clock, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Definimos la interfaz para TypeScript
interface Priority {
    id: string;
    type: string;
    loc: string;
    detail: string;
    status?: string;
    time: string;
    level: 'ALTA' | 'MEDIA';
}

export default function PrioritiesPanel() {
    const { showToast } = useToast();
    const priorities: Priority[] = [
        { id: 'INC-024', type: 'Personas aisladas', loc: 'Sector Norte', detail: '18 personas reportadas', status: 'Sin acceso confirmado', time: 'hace 4 min', level: 'ALTA' },
        { id: 'INC-021', type: 'Vía bloqueada', loc: 'Puente Sur', detail: 'requiere maquinaria', time: 'hace 7 min', level: 'ALTA' },
        { id: 'INC-018', type: 'Suministros', loc: 'Albergue Central', detail: 'agua pendiente', time: 'hace 11 min', level: 'MEDIA' },
    ];

    return (
        <div className="w-96 flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <AlertCircle className="text-red-500" size={20} />
                    Prioridades por revisar
                </h3>

                <div className="flex flex-col gap-3">
                    {priorities.map((item, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-lg p-3 flex gap-3 hover:bg-gray-50 transition relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.level === 'ALTA' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>

                            <div className="pt-1">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.level === 'ALTA' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-gray-900'}`}>
                                    {item.level}
                                </span>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-gray-900">{item.id} • {item.type}</h4>
                                <div className="text-xs text-gray-500 mt-1 space-y-1">
                                    <p className="flex items-center gap-1"><MapPin size={12} /> {item.loc} • {item.detail}</p>
                                    {item.status && <p className="text-red-500">{item.status}</p>}
                                    <p className="flex items-center gap-1"><Clock size={12} /> Actualizado {item.time}</p>
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    showToast({
                                        title: `Prioridad Activa: ${item.id} - ${item.type}`,
                                        message: `${item.loc} • ${item.detail}. Enlace táctico verificado.`,
                                        type: item.level === 'ALTA' ? 'alert' : 'warning',
                                    })
                                }
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded h-fit mt-1 transition cursor-pointer"
                            >
                                Revisar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}