import React from 'react';

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed }) => {
  return (
    <header className={`bg-unilab-blue text-white shadow-lg fixed top-0 left-0 w-full z-30 transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-72'}`}>
        {/* Gov.br Banner */}
        <div className="bg-[#002b52] text-white/80 text-xs py-1.5 px-6 flex items-center justify-between h-[32px]">
            <a href="https://www.gov.br/pt-br" target="_blank" rel="noopener noreferrer" className="uppercase font-semibold tracking-wider hover:text-white">Gov.br</a>
            <div className="flex items-center gap-4">
                <a href="https://www.gov.br/pt-br/orgaos-do-governo" target="_blank" rel="noopener noreferrer" className="hover:text-white">Órgãos do Governo</a>
                <a href="https://www.gov.br/acessoainformacao/pt-br" target="_blank" rel="noopener noreferrer" className="hover:text-white">Acesso à Informação</a>
                <a href="https://www4.planalto.gov.br/legislacao/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Legislação</a>
                <a href="https://unilab.edu.br/?pagina=acessibilidade" target="_blank" rel="noopener noreferrer" className="hover:text-white">Acessibilidade</a>
            </div>
        </div>
      <div className="container px-6 flex items-center h-[88px]">
        <div className="flex items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-wider">
                SIRU
                </h1>
                <p className="text-sm opacity-90">
                Sistema Integrado de Reagentes da Unilab
                </p>
            </div>
        </div>
      </div>
    </header>
  );
}