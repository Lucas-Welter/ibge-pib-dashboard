import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-ibge-blue text-white shadow-md">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <Link to="/" className="text-2xl font-bold">Dashboard PIB Brasil</Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <NavLink 
                  to="/" 
                  end
                  className={({ isActive }) => 
                    isActive 
                      ? "border-b-2 border-white pb-1 font-medium" 
                      : "hover:border-b-2 hover:border-white pb-1"
                  }
                >
                  Gráfico
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/tabela" 
                  className={({ isActive }) => 
                    isActive 
                      ? "border-b-2 border-white pb-1 font-medium" 
                      : "hover:border-b-2 hover:border-white pb-1"
                  }
                >
                  Tabela
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;