import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(data?.role === "admin");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

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
      <aside className="flex w-64 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-lowest">
        <div className="border-b border-outline-variant/15 px-8 py-8">
          <span className="font-serif block text-xl tracking-tight text-secondary uppercase">
            Selva
          </span>
          <span className="mt-1 block text-label-caps text-on-surface-variant uppercase">
            Painel Admin
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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

      <main className="flex-1">
        <header className="border-b border-outline-variant/15 px-10 py-8">
          <h1 className="font-serif text-2xl text-on-surface uppercase">
            {currentLabel}
          </h1>
        </header>
        <div className="px-10 py-8">
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
