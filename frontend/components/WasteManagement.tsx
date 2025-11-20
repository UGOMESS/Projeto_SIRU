
import React from 'react';
import { WasteLog, Unit } from '../types';

// Extend window type to include jsPDF and autoTable
declare global {
    interface Window {
        jspdf: any;
    }
}

interface WasteManagementProps {
    logs: WasteLog[];
    onAddLog: (log: WasteLog) => void;
}

const wasteContainers = [
    { name: 'Solventes Halogenados', current: 4, capacity: 5, unit: 'L' },
    { name: 'Solventes Não Halogenados', current: 1.5, capacity: 5, unit: 'L' },
    { name: 'Resíduos Ácidos', current: 8, capacity: 10, unit: 'L' },
    { name: 'Resíduos Básicos', current: 2, capacity: 10, unit: 'L' },
];

export const WasteManagement: React.FC<WasteManagementProps> = ({ logs, onAddLog }) => {
    const [formData, setFormData] = React.useState({
        reagentName: '',
        amount: '',
        unit: Unit.ML,
        classification: ''
    });
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLog: WasteLog = {
            id: `wl${Date.now()}`,
            reagentName: formData.reagentName,
            amount: parseFloat(formData.amount),
            unit: formData.unit as Unit,
            disposalDate: new Date().toISOString(),
            disposedBy: 'Admin Principal', // Placeholder for current user
            classification: formData.classification,
        };
        onAddLog(newLog);
        setFormData({ reagentName: '', amount: '', unit: Unit.ML, classification: '' });
    };
    
    const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.disposalDate);
        if (startDate) {
            const start = new Date(startDate + 'T00:00:00Z');
            if (logDate < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate + 'T23:59:59Z');
            if (logDate > end) return false;
        }
        return true;
    }).sort((a, b) => new Date(b.disposalDate).getTime() - new Date(a.disposalDate).getTime());

    const handleDownloadCSV = () => {
        if (filteredLogs.length === 0) {
            alert("Nenhum registro encontrado para o período selecionado.");
            return;
        }

        const headers = ['ID', 'Resíduo', 'Quantidade', 'Unidade', 'Data de Descarte', 'Responsável', 'Classificação'];
        const csvRows = [
            headers.join(','),
            ...filteredLogs.map(log => {
                const row = [
                    log.id,
                    `"${log.reagentName.replace(/"/g, '""')}"`,
                    log.amount,
                    log.unit,
                    new Date(log.disposalDate).toLocaleString('pt-BR'),
                    `"${log.disposedBy.replace(/"/g, '""')}"`,
                    `"${log.classification.replace(/"/g, '""')}"`
                ];
                return row.join(',');
            })
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_residuos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        if (filteredLogs.length === 0) {
            alert("Nenhum registro encontrado para o período selecionado.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text("Relatório de Descarte de Resíduos", 14, 16);
        if(startDate || endDate) {
            doc.setFontSize(10);
            const start = startDate ? new Date(startDate+'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
            const end = endDate ? new Date(endDate+'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
            doc.text(`Período: ${start} a ${end}`, 14, 22);
        }

        (doc as any).autoTable({
            startY: 28,
            head: [['Resíduo', 'Classificação', 'Quantidade', 'Data', 'Responsável']],
            body: filteredLogs.map(log => [
                log.reagentName,
                log.classification,
                `${log.amount} ${log.unit}`,
                new Date(log.disposalDate).toLocaleDateString('pt-BR'),
                log.disposedBy
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [67, 56, 202] } // unilab-blue
        });
        
        doc.save(`relatorio_residuos_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Registrar Novo Descarte</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="reagentName" className="block text-sm font-medium text-gray-700">Nome do resíduo</label>
                                <input id="reagentName" type="text" name="reagentName" value={formData.reagentName} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md border-gray-300"/>
                            </div>
                             <div>
                                <label htmlFor="classification" className="block text-sm font-medium text-gray-700">Classificação do Resíduo</label>
                                <input id="classification" type="text" name="classification" value={formData.classification} onChange={handleChange} required placeholder="Ex: Solvente Orgânico" className="mt-1 w-full p-2 border rounded-md border-gray-300"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                             <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Quantidade</label>
                                <input id="amount" type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md border-gray-300"/>
                            </div>
                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidade</label>
                                <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white border-gray-300 h-[42px]">
                                    {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="bg-unilab-blue text-white py-2 px-4 rounded-md hover:bg-unilab-green w-full h-[42px]">Registrar</button>
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
                     <h2 className="text-xl font-bold mb-4 text-gray-800">Situação das Bombonas</h2>
                     <div className="space-y-4">
                        {wasteContainers.map(container => {
                            const percentage = (container.current / container.capacity) * 100;
                            return (
                                <div key={container.name}>
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span className="font-medium text-gray-700">{container.name}</span>
                                        <span className="text-gray-500">{container.current}/{container.capacity} {container.unit}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${percentage > 80 ? 'bg-accent-500' : 'bg-secondary-500'}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                     </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Histórico de Descarte</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input type="date" aria-label="Data de início" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md border-gray-300"/>
                        <span className="text-gray-500">até</span>
                        <input type="date" aria-label="Data de fim" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md border-gray-300"/>
                        <button onClick={handleDownloadCSV} className="bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-500 flex items-center gap-2 w-full sm:w-auto justify-center">
                           <i className="fa-solid fa-download"></i> <span>Baixar CSV</span>
                        </button>
                        <button onClick={handleDownloadPDF} className="bg-accent-600 text-white py-2 px-4 rounded-md hover:bg-accent-500 flex items-center gap-2 w-full sm:w-auto justify-center">
                           <i className="fa-solid fa-file-pdf"></i> <span>Baixar PDF</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resíduo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classificação</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum registro encontrado para o período selecionado.</td></tr>
                            )}
                            {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 font-medium">{log.reagentName}</td>
                                    <td className="px-6 py-4">{log.classification}</td>
                                    <td className="px-6 py-4">{log.amount} {log.unit}</td>
                                    <td className="px-6 py-4">{new Date(log.disposalDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{log.disposedBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};