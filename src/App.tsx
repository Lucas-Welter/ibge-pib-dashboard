import { Outlet } from 'react-router-dom';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container text-center text-gray-600 text-sm">
          Dashboard PIB Brasil - Dados fornecidos pelo IBGE
        </div>
      </footer>
    </div>
  );
}

export default App;