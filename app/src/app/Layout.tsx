import { Outlet, NavLink } from 'react-router-dom';
import { Sparkles, PenTool, FolderOpen } from 'lucide-react';

export function Layout() {
  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ResuMate
            </h1>
          </div>
          <nav className="flex gap-1 text-sm font-medium">
            <NavLink
              to="/my-cvs"
              className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen size={16} />
                Mis CVs
              </div>
            </NavLink>
            <NavLink
              to="/optimize"
              className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                Optimizar CV
              </div>
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <PenTool size={16} />
                Crear CV
              </div>
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content - Rendered by child routes */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
