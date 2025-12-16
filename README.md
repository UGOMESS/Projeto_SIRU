# SIRU - Sistema Integrado de Reagentes da Unilab

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

O SIRU é um sistema web moderno projetado para otimizar o gerenciamento de reagentes químicos nos laboratórios da Universidade da Integração Internacional da Lusofonia Afro-Brasileira (Unilab). A plataforma oferece uma interface intuitiva e funcionalidades robustas para administradores e pesquisadores, garantindo controle de estoque, segurança e conformidade.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Como Começar](#como-começar)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Guia Rápido de Git e GitHub](#guia-rápido-de-git-e-github)
- [Licença](#licença)

---

## Sobre o Projeto

O objetivo do SIRU é centralizar e simplificar a gestão do ciclo de vida dos reagentes laboratoriais, desde a sua entrada no estoque até o descarte seguro dos resíduos. A aplicação resolve problemas comuns como a falta de controle sobre a quantidade e validade dos reagentes, a dificuldade na solicitação de retiradas e a ausência de um registro formal para o descarte de resíduos.

Com perfis de acesso distintos, o sistema atende às necessidades tanto dos administradores de laboratório, que precisam de uma visão completa do inventário, quanto dos pesquisadores, que necessitam de um processo ágil para solicitar materiais.

---

## Principais Funcionalidades

- **Painel de Controle (Dashboard):** Visão geral com estatísticas-chave (total de reagentes, estoque baixo, etc.), atalhos para ações rápidas e um feed de notícias da Unilab.
- **Gerenciamento de Inventário:**
  - Adição e remoção de reagentes.
  - Tabela de reagentes com busca, filtros por categoria e status de estoque.
  - Identificação visual para reagentes controlados, com estoque baixo ou expirados.
- **Sistema de Retiradas:**
  - **Pesquisadores:** Podem solicitar a retirada de reagentes diretamente pelo sistema.
  - **Administradores:** Têm acesso a um painel para aprovar ou recusar as solicitações pendentes.
- **Gestão de Resíduos:**
  - Registro de descarte de resíduos químicos.
  - Monitoramento do nível de preenchimento das bombonas de descarte.
  - Geração de relatórios de descarte em formatos **PDF** e **CSV**.
- **Assistente de Segurança com IA:**
  - Um chatbot integrado com a **API do Google Gemini** para responder a perguntas sobre segurança, armazenamento, compatibilidade e descarte de reagentes.
- **Controle de Acesso Baseado em Função (RBAC):**
  - **Administrador:** Acesso total a todas as funcionalidades.
  - **Pesquisador:** Acesso focado na visualização do estoque e na solicitação de reagentes.
- **Acessibilidade:**
  - Modo de alto contraste para melhorar a legibilidade.
  - Controles para aumentar e diminuir o tamanho da fonte.

---

## Tecnologias Utilizadas

- **Frontend:**
  - **React 19:** Biblioteca principal para a construção da interface.
  - **TypeScript:** Garante a tipagem e a segurança do código.
  - **Vite:** Ferramenta de build rápida e leve.
- **Estilização:**
  - **Tailwind CSS:** Framework CSS utilitário para um design rápido e responsivo.
  - **Font Awesome:** Biblioteca de ícones.
- **Inteligência Artificial:**
  - **Google Gemini API (@google/genai):** Potencializa o Assistente de Segurança.
- **Infraestrutura e Ferramentas:**
  - **Docker:** Containerização da aplicação e banco de dados.
  - **WSL 2:** Ambiente Linux no Windows.
  - **DBeaver:** Gerenciamento visual de banco de dados.
- **Geração de Documentos:**
  - **jsPDF & jsPDF-AutoTable:** Para a criação de relatórios em formato PDF.
- **Renderização de Markdown:**
  - **Marked:** Utilizada para formatar as respostas do assistente de IA.

---

## Configuração do Ambiente

Para garantir um ambiente de desenvolvimento padronizado e eficiente, este projeto utiliza as seguintes ferramentas:

### 1. WSL 2 (Windows Subsystem for Linux)
*Recomendado para usuários Windows.*
O WSL permite executar um ambiente Linux diretamente no Windows, facilitando o uso de ferramentas como Docker e Git em um ambiente nativo.

- **Instalação:** Abra o PowerShell como Administrador e execute:
  ```powershell
  wsl --install
  ```
  Reinicie o computador após o término. Por padrão, o Ubuntu será instalado.
- **Documentação:** [Guia de Instalação do WSL](https://learn.microsoft.com/pt-br/windows/wsl/install)

### 2. Docker
Utilizado para orquestrar os serviços da aplicação (como banco de dados) em containers isolados.

- **Windows/Mac:** Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Linux:** Instale o Docker Engine ([Guia](https://docs.docker.com/engine/install/)).
- **Integração WSL:** Se usar Windows, ative a integração com WSL nas configurações do Docker Desktop (*Resources > WSL Integration*).

Para verificar a instalação:
```bash
docker --version
docker compose version
```

### 3. DBeaver
Ferramenta visual para gerenciar e consultar o banco de dados do projeto.

- **Download:** Baixe a versão Community em [dbeaver.io](https://dbeaver.io/download/).
- **Uso:** Utilize para conectar ao banco de dados rodando em seu container Docker (geralmente via `localhost`).

---

## Como Começar

Para executar o projeto em seu ambiente local, siga os passos abaixo rigorosamente.

### Pré-requisitos

- **Node.js:** Versão 18 ou superior.
- **npm** ou **yarn:** Gerenciador de pacotes.
- **Git:** Sistema de controle de versão.
- **Docker:** (Opcional se rodar apenas o frontend mockado, obrigatório para backend/banco).
- **Chave de API do Google Gemini:** É necessário ter uma chave de API para utilizar o Assistente de Segurança. Você pode obter uma no [Google AI Studio](https://aistudio.google.com/app/apikey).

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/Projeto_SIRU.git
    ```

2.  **⚠️ IMPORTANTE: Acesse a pasta do Frontend:**
    Todo o código da aplicação web reside na pasta `frontend`. Você **deve** entrar neste diretório antes de executar qualquer outro comando.
    ```bash
    cd Projeto_SIRU/frontend
    ```

3.  **Instale as dependências:**
    (Certifique-se de que está dentro da pasta `frontend`)
    ```bash
    npm install
    ```

4.  **Configure as variáveis de ambiente:**
    - Crie um arquivo chamado `.env` na raiz da pasta `frontend`.
    - Adicione sua chave de API do Google Gemini a este arquivo:
      ```
      VITE_API_KEY=SUA_CHAVE_DE_API_AQUI
      ```

5.  **Suba os containers (Se aplicável):**
    Se o projeto contiver um arquivo `docker-compose.yml` na raiz, inicie os serviços de backend/banco:
    ```bash
    # Na raiz do projeto (fora da pasta frontend)
    docker compose up -d
    ```

6.  **Execute o servidor de desenvolvimento Frontend:**
    ```bash
    # Dentro da pasta frontend
    npm run dev
    ```
    O aplicativo estará disponível geralmente em `http://localhost:5173`.

---

## Estrutura de Arquivos

A estrutura do projeto está organizada da seguinte forma para facilitar a manutenção e o desenvolvimento:

```
/frontend
├── public/
│   └── ... (arquivos públicos)
├── src/
│   ├── index.tsx         # Ponto de entrada da aplicação React
│   ├── App.tsx           # Componente principal
│   ├── types.ts          # Definições de tipos do TypeScript
│   ├── constants.ts      # Dados mockados e constantes
│   ├── services/
│   │   └── geminiService.ts # Comunicação com a API do Gemini
│   └── components/       # Componentes da interface
├── package.json
├── vite.config.ts
└── README.md
```

---

## Guia Rápido de Git e GitHub

Se você não tem familiaridade com Git e GitHub, este guia rápido o ajudará a começar.

### 1. Baixando (Clonando) o Projeto

Para obter uma cópia local do projeto, você precisa "cloná-lo". Abra seu terminal, navegue até o diretório onde deseja salvar o projeto e execute o comando:

```bash
git clone https://github.com/seu-usuario/Projeto_SIRU.git
```

Isso criará uma pasta chamada `Projeto_SIRU`.

**Atenção:** Após clonar, lembre-se sempre de entrar na pasta do código fonte:
```bash
cd Projeto_SIRU/frontend
```

### 2. Enviando Suas Alterações (Contribuindo)

Para propor mudanças no projeto (como corrigir um bug ou adicionar uma nova funcionalidade), o fluxo de trabalho ideal é o seguinte:

**Passo 1: Crie um Fork**

- Vá até a página do repositório principal no GitHub.
- Clique no botão **"Fork"** no canto superior direito. Isso criará uma cópia do repositório na sua própria conta do GitHub.

**Passo 2: Clone o seu Fork**

- Agora, clone o repositório que está na *sua* conta:
  ```bash
  git clone https://github.com/SEU_NOME_DE_USUARIO/Projeto_SIRU.git
  ```
- Entre na pasta correta:
  ```bash
  cd Projeto_SIRU/frontend
  ```

**Passo 3: Crie uma Nova Branch**

- É uma boa prática criar uma "branch" (ramificação) para cada nova alteração. Isso mantém suas mudanças organizadas.
  ```bash
  # O comando abaixo cria uma nova branch e já muda para ela
  git checkout -b minha-nova-funcionalidade
  ```
  *Substitua `minha-nova-funcionalidade` por um nome descritivo (ex: `correcao-bug-login`).*

**Passo 4: Faça Suas Alterações**

- Abra o projeto no seu editor de código e faça as modificações necessárias.

**Passo 5: Salve as Alterações (Commit)**

- Após fazer as alterações, você precisa salvá-las no histórico do Git.
  ```bash
  # Adiciona todos os arquivos modificados para serem "commitados"
  git add .

  # Grava as alterações com uma mensagem descritiva
  git commit -m "Adiciona nova funcionalidade de exportação de dados"
  ```
  *Escreva uma mensagem de commit clara e objetiva.*

**Passo 6: Envie as Alterações para o Seu Fork (Push)**

- Agora, envie a sua branch com as alterações para o seu repositório fork no GitHub.
  ```bash
  git push origin minha-nova-funcionalidade
  ```

**Passo 7: Crie um Pull Request (PR)**

- Volte para a página do seu fork no GitHub.
- Você verá um aviso para criar um **"Pull Request"**. Clique nele.
- Revise suas alterações, adicione um título e uma descrição detalhada do que você fez e clique em **"Create Pull Request"**.

Pronto! Agora os mantenedores do projeto original poderão revisar suas alterações e, se estiver tudo certo, incorporá-las ao código principal.

---

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.