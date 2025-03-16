# Dashboard PIB Brasil

Uma aplicação web que consome dados da API do IBGE para visualizar a evolução do PIB (Produto Interno Bruto) brasileiro e do PIB per capita ao longo dos anos.

## 📑 Sumário

- [Demonstração](#-demonstração)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Requisitos](#-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto e Arquitetura](#️-estrutura-do-projeto-e-arquitetura)
- [Decisões de Design e UI/UX](#-decisões-de-design-e-uiux)
- [API do IBGE](#-api-do-ibge)
- [Melhorias Futuras](#-melhorias-futuras)
- [Testes](#-testes)

## 🔗 Demonstração

O projeto está disponível online em: [https://ibge-pib-dashboard.vercel.app](https://ibge-pib-dashboard.vercel.app)

## 🚀 Funcionalidades

- **Gráfico de Evolução do PIB**: Visualização interativa da evolução do PIB total e PIB per capita do Brasil em dólares;
- **Tabela de PIB por Ano**: Exibição detalhada dos valores em formato tabular com paginação;
- **Dashboard de Indicadores**: Resumo dos principais KPIs relacionados ao PIB;
- **Filtro por Período**: Possibilidade de filtrar os dados por intervalo de anos;
- **Design Responsivo**: Interface adaptada para dispositivos móveis e desktop.

## 🛠️ Tecnologias Utilizadas

- **React 19**: Framework/Biblioteca para construção de interfaces modernas com componentes reutilizáveis e sistema de renderização eficiente;
- **TypeScript**: Superset tipado do JavaScript para desenvolvimento mais seguro, com detecção de erros em tempo de compilação;
- **Vite**: Build tool de alta performance que proporciona um ambiente de desenvolvimento extremamente rápido com Hot Module Replacement;
- **TanStack Query (React Query)**: Biblioteca para gerenciamento de estado dos dados remotos, oferecendo cache, sincronização e atualizações otimizadas;
- **Chart.js e react-chartjs-2**: Solução robusta para criação de visualizações gráficas interativas e responsivas;
- **Tailwind CSS v4**: Framework CSS utilitário que permite desenvolvimento rápido diretamente no HTML com classes pré-definidas;
- **React Router Dom v7**: Biblioteca de roteamento declarativo para React com suporte a rotas aninhadas e carregamento preguiçoso;
- **Vitest e Testing Library**: Ferramentas modernas para testes que facilitam a escrita de casos de teste próximos ao comportamento real do usuário;
- **Axios**: Cliente HTTP baseado em Promises para fazer requisições com transformação automática de dados JSON.

## 📋 Requisitos

Para desenvolvimento:
- Node.js 18 ou superior
- npm ou yarn

Para execução em produção:
- Qualquer servidor web capaz de servir arquivos estáticos

## 🔧 Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ibge-pib-dashboard.git
cd ibge-pib-dashboard
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Acesse a aplicação em: [http://localhost:5173](http://localhost:5173)

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento;
- `npm run build` - Cria a versão de produção;
- `npm run preview` - Executa a versão de produção localmente;
- `npm run test` - Executa os testes unitários;
- `npm run test:watch` - Executa os testes no modo watch;
- `npm run test:coverage` - Gera relatório de cobertura de testes;
- `npm run lint` - Executa o linter para verificar problemas no código.

## 🏗️ Estrutura do Projeto e Arquitetura

```
src/
├── components/        # Componentes reutilizáveis da UI
├── hooks/             # Hooks personalizados (usePagination, useResponsive)
├── lib/               # Configurações de bibliotecas
├── pages/             # Páginas da aplicação
│   ├── PIBChart/      # Página do gráfico de PIB
│   └── PIBTable/      # Página da tabela de PIB
├── services/          # Serviços para comunicação com APIs
│   └── api/           # Configurações e funções da API
├── utils/             # Funções utilitárias (formatters)
└── test/              # Configurações de testes
```

### Decisões de Arquitetura

1. **Componentes Modulares**: Implementação de uma estrutura baseada em componentes independentes que podem ser combinados para formar interfaces complexas. Essa abordagem facilita a manutenção, testing e reuso do código;

2. **Hooks Personalizados**: Desenvolvimento de hooks como `usePagination` e `useResponsive` para encapsular lógicas complexas e comportamentos recorrentes, promovendo a reutilização e simplificando os componentes principais;

3. **Separação de Responsabilidades**: Organização do código baseada em princípios SOLID, onde cada parte do sistema tem uma responsabilidade bem definida - as páginas cuidam da composição da UI, os serviços isolam a comunicação com APIs externas, e os utilitários fornecem funções puras para transformações de dados;

4. **TanStack Query**: Utilização dessa biblioteca para abstrair toda a complexidade de gerenciamento de estado dos dados remotos, oferecendo benefícios como cache automático, revalidação inteligente, deduplicação de requisições e tratamento simplificado de estados de loading e erro.

## 🎨 Decisões de Design e UI/UX

- **Interface Intuitiva**: Navegação simplificada com foco na visualização de dados, utilizando uma hierarquia visual clara e caminhos de navegação consistentes;
- **Feedback Visual**: Implementação de indicadores de carregamento, mensagens de erro contextualizadas e animações sutis para melhorar a percepção de resposta do sistema;
- **Visualização Responsiva**: Desenvolvimento de layouts adaptativos com alternância entre visualizações em tabela tradicional e cards otimizados para telas menores, garantindo uma experiência fluida em todos os dispositivos.

### Otimizações

- **Gerenciamento de Cache**: Implementação de estratégias de cache com React Query para minimizar requisições à API e melhorar significativamente o tempo de resposta para o usuário;
- **Formatação de Números**: Utilização da API Intl para formatação localizada de valores monetários, garantindo padronização e legibilidade dos dados numéricos;
- **Filtragem de Dados**: Implementação de algoritmos eficientes para manipulação e filtragem de conjuntos de dados potencialmente grandes, com processamento otimizado no lado do cliente.

## 📝 API do IBGE

A aplicação consome a API de dados agregados do IBGE, especificamente:

- **Agregado**: 6784 (PIB);
- **Variáveis**: 
  - 9808 (PIB total em dólares);
  - 9810 (PIB per capita em dólares);
- **Endpoint**: `https://servicodados.ibge.gov.br/api/v3/agregados/`.

## 🚀 Melhorias Futuras

- Adicionar testes unitários para serviços e componentes específicos;
- Implementar barra de pesquisa para tabela;
- Implementar modo escuro;
- Adicionar exportação de dados para CSV ou Excel.

## 🧪 Testes

O projeto inclui testes de integração para as duas páginas principais da aplicação. Foram utilizados mocks e outras técnicas para validar desde unidades menores até a renderização de elementos.

Para executar os testes:

```bash
npm run test            # Executa todos os testes
npm run test:watch      # Executa em modo watch
npm run test:coverage   # Gera relatório de cobertura
```