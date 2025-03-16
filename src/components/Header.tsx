import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-md">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <svg
              className="w-8 h-8 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 8L12 12L20 8L12 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16L12 20L20 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 12L12 16L20 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard PIB Brasil
          </Link>

          <nav className="flex items-center">
            <ul className="flex space-x-6">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-white pb-1 font-medium flex items-center"
                      : "hover:border-b-2 hover:border-white pb-1  flex items-center"
                  }
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Gráfico
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/tabela"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-white pb-1 font-medium flex items-center"
                      : "hover:border-b-2 hover:border-white pb-1 transition-all flex items-center"
                  }
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
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