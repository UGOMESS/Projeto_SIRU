
import React, { useState } from 'react';
import { WithdrawalRequest, RequestStatus } from '../types';

// Extend window type to include jsPDF and autoTable
declare global {
    interface Window {
        jspdf: any;
    }
}

interface WithdrawalsProps {
    requests: WithdrawalRequest[];
    onAction: (id: string, newStatus: RequestStatus) => void;
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({ requests, onAction }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredRequests = requests.filter(r => {
        if (activeTab === 'pending') {
            return r.status === RequestStatus.PENDING;
        }
        if (activeTab === 'history') {
            if (r.status === RequestStatus.PENDING) return false;
            
            const reqDate = new Date(r.requestedAt);
            if (startDate) {
                const start = new Date(startDate + 'T00:00:00Z');
                if (reqDate < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate + 'T23:59:59Z');
                if (reqDate > end) return false;
            }
            return true;
        }
        return true;
    }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const TabButton: React.FC<{tabName: string, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tabName ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            {label}
            {tabName === 'pending' && <span className="ml-2 bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{requests.filter(r => r.status === RequestStatus.PENDING).length}</span>}
        </button>
    );

    const handleDownloadCSV = () => {
        if (filteredRequests.length === 0) {
            alert("Nenhum registro encontrado para o período selecionado.");
            return;
        }

        const headers = ['ID Solicitação', 'ID Reagente', 'Nome Reagente', 'Quantidade', 'Unidade', 'Solicitante', 'Data Solicitação', 'Data de Uso', 'Status', 'Justificativa'];
        const csvRows = [
            headers.join(','),
            ...filteredRequests.map(req => {
                 const row = [
                    req.id,
                    req.reagentId,
                    `"${req.reagentName.replace(/"/g, '""')}"`,
                    req.amount,
                    req.unit,
                    `"${req.requestedBy.replace(/"/g, '""')}"`,
                    new Date(req.requestedAt).toLocaleString('pt-BR'),
                    req.usageDate ? new Date(req.usageDate + 'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A',
                    req.status,
                    `"${(req.reason || '').replace(/"/g, '""')}"`
                ];
                return row.join(',');
            })
        ];


        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_retiradas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        if (filteredRequests.length === 0) {
            alert("Nenhum registro encontrado para o período selecionado.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Relatório de Histórico de Retiradas", 14, 16);
        if(startDate || endDate) {
            doc.setFontSize(10);
            const start = startDate ? new Date(startDate+'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
            const end = endDate ? new Date(endDate+'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A';
            doc.text(`Período: ${start} a ${end}`, 14, 22);
        }

        (doc as any).autoTable({
            startY: 28,
            head: [['Reagente', 'Qtd.', 'Solicitante', 'Data Solic.', 'Data Uso', 'Status']],
            body: filteredRequests.map(req => [
                req.reagentName,
                `${req.amount} ${req.unit}`,
                req.requestedBy,
                new Date(req.requestedAt).toLocaleDateString('pt-BR'),
                req.usageDate ? new Date(req.usageDate+'T00:00:00Z').toLocaleDateString('pt-BR') : '-',
                req.status
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [67, 56, 202] }
        });

        doc.save(`relatorio_retiradas_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4">
                    <TabButton tabName="pending" label="Pendentes" />
                    <TabButton tabName="history" label="Histórico" />
                </nav>
            </div>

            {activeTab === 'history' && (
                <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-700">Relatório de Retiradas</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input type="date" aria-label="Data de início" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md border-gray-300"/>
                        <span className="text-gray-500">até</span>
                        <input type="date" aria-label="Data de fim" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md border-gray-300"/>
                        <button onClick={handleDownloadCSV} className="bg-secondary-600 text-white py-2 px-3 rounded-md hover:bg-secondary-500 flex items-center gap-2 w-full sm:w-auto justify-center text-sm" title="Baixar CSV">
                           <i className="fa-solid fa-download"></i> <span>CSV</span>
                        </button>
                        <button onClick={handleDownloadPDF} className="bg-accent-600 text-white py-2 px-3 rounded-md hover:bg-accent-500 flex items-center gap-2 w-full sm:w-auto justify-center text-sm" title="Baixar PDF">
                           <i className="fa-solid fa-file-pdf"></i> <span>PDF</span>
                        </button>
                    </div>
                </div>
            )}

             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reagente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Solicitação</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Uso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">Nenhuma solicitação nesta categoria.</td>
                            </tr>
                        )}
                        {filteredRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{req.reagentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{req.amount} {req.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{req.requestedBy}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(req.requestedAt).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{req.usageDate ? new Date(req.usageDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                        req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {req.status === RequestStatus.PENDING && (
                                        <div className="flex gap-4">
                                            <button onClick={() => onAction(req.id, RequestStatus.APPROVED)} className="text-green-600 hover:text-green-900 font-semibold">Aprovar</button>
                                            <button onClick={() => onAction(req.id, RequestStatus.REJECTED)} className="text-red-600 hover:text-red-900 font-semibold">Recusar</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
