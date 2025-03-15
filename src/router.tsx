import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import PIBChartPage from './pages/PIBChart/PIBChart';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <PIBChartPage />,
      },
    ],
  },
]);