import { useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import Icon from "../../components/Icon";

const NAV = [
  { to: "/admin/produtos", label: "Produtos", icon: "inventory" },
  { to: "/admin/pedidos", label: "Pedidos", icon: "receipt" },
  { to: "/admin/cupons", label: "Cupons", icon: "bolt" },
  { to: "/admin/avaliacoes", label: "Avaliações", icon: "verified" },
];

export default function AdminLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = useIsAdmin();
  const [navOpen, setNavOpen] = useState(false);

  if (authLoading) {
    return <FullScreenMessage text="Carregando..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (isAdmin === null) {
    return <FullScreenMessage text="Carregando..." />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const currentLabel =
    NAV.find((item) => location.pathname.startsWith(item.to))?.label ??
    "Admin";

  return (
    <div className="flex min-h-screen bg-background">
      {navOpen && (
        <div
          aria-hidden
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[80vw] shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-lowest shadow-[4px_0_16px_rgba(0,0,0,0.25)] transition-transform duration-300 md:static md:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/15 px-6 py-8 md:px-8">
          <div>
            <span className="font-serif block text-xl tracking-tight text-secondary uppercase">
              Selva
            </span>
            <span className="mt-1 block text-label-caps text-on-surface-variant uppercase">
              Painel Admin
            </span>
          </div>
          <button
            aria-label="Fechar menu"
            onClick={() => setNavOpen(false)}
            className="text-on-surface-variant hover:text-secondary md:hidden"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm border-l-2 px-4 py-3 text-label-caps uppercase transition-colors ${
                  isActive
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`
              }
            >
              <Icon name={item.icon} className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-outline-variant/15 px-4 py-4">
          <div className="mb-3 truncate px-4 text-xs text-on-surface-variant">
            {user.email}
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-sm px-4 py-3 text-label-caps text-on-surface-variant uppercase transition-colors hover:bg-surface-container-low hover:text-error"
          >
            <Icon name="logout" className="text-lg" />
            Sair
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center gap-4 border-b border-outline-variant/15 bg-surface-container-lowest/40 px-4 py-5 md:px-10 md:py-8">
          <button
            aria-label="Abrir menu"
            onClick={() => setNavOpen(true)}
            className="text-on-surface-variant hover:text-secondary md:hidden"
          >
            <Icon name="menu" className="text-2xl" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-on-surface uppercase md:text-xl">
            {currentLabel}
          </h1>
        </header>
        <div className="px-4 py-6 md:px-10 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function FullScreenMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-on-surface-variant">{text}</p>
    </div>
  );
}
