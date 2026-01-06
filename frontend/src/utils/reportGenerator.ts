import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WasteRecord } from '../types';

// --- GERAR CSV (Planilha) ---
export const generateWasteCSV = (data: WasteRecord[]) => {
  // 1. Cabeçalho
  const headers = ['Data', 'Reagente', 'Quantidade', 'Unidade', 'Responsável', 'Destino'];
  
  // 2. Linhas de dados
  const rows = data.map(item => [
    new Date(item.date).toLocaleDateString('pt-BR'),
    item.reagentName,
    item.amount,
    item.unit,
    item.registeredBy,
    item.destination || 'Descarte Padrão'
  ]);

  // 3. Montar o conteúdo CSV
  const csvContent = [
    headers.join(','), 
    ...rows.map(row => row.join(','))
  ].join('\n');

  // 4. Criar Blob e Baixar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_residuos_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- GERAR PDF ---
export const generateWastePDF = (data: WasteRecord[]) => {
  const doc = new jsPDF();

  // Título e Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('Relatório de Gestão de Resíduos - SIRU', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
  doc.text('Universidade da Integração Internacional da Lusofonia Afro-Brasileira (Unilab)', 14, 34);

  // Dados para a Tabela
  const tableColumn = ["Data", "Reagente", "Qtd", "Unid", "Responsável", "Destino"];
  const tableRows = data.map(item => [
    new Date(item.date).toLocaleDateString('pt-BR'),
    item.reagentName,
    item.amount,
    item.unit,
    item.registeredBy,
    item.destination || '-'
  ]);

  // Gerar Tabela
  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }, // Azul
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Salvar
  doc.save(`relatorio_residuos_${new Date().toISOString().split('T')[0]}.pdf`);
};