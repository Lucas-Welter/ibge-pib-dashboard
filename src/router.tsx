import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import PIBChartPage from './pages/PIBChart/PIBChart';
import PIBTablePage from './pages/PIBTable/PIBTable';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <PIBChartPage />,
      },
      {
        path: 'tabela',
        element: <PIBTablePage />,
      },
    ],
  },
]);