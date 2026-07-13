import { Link } from "react-router-dom";
import { navLinks } from "../data/content";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useStickyNavbar } from "../hooks/useStickyNavbar";
import Icon from "./Icon";

export default function Navbar() {
  const scrolled = useStickyNavbar();
  const { itemCount, open } = useCart();
  const { user, signOut } = useAuth();

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-background/90 py-4 shadow-2xl backdrop-blur-xl"
          : "bg-transparent py-8"
      }`}
    >
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4 text-[24px] font-extrabold tracking-tighter text-secondary uppercase md:text-headline-lg">
          SELVA
        </div>
        <div className="hidden items-center gap-gutter md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-label-caps text-on-surface-variant uppercase transition-colors duration-300 hover:text-secondary"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <button
              aria-label="Sair da conta"
              onClick={() => signOut()}
              className="scale-95 text-on-surface-variant transition-all hover:text-secondary active:scale-90"
              title={user.email ?? undefined}
            >
              <Icon name="person" />
            </button>
          ) : (
            <Link
              to="/login"
              aria-label="Entrar"
              className="scale-95 text-on-surface-variant transition-all hover:text-secondary active:scale-90"
            >
              <Icon name="person" />
            </Link>
          )}
          <button
            aria-label={`Carrinho${itemCount > 0 ? ` (${itemCount} ${itemCount === 1 ? "item" : "itens"})` : ""}`}
            onClick={open}
            className="relative scale-95 text-on-surface-variant transition-all hover:text-secondary active:scale-90"
          >
            <Icon name="shopping_bag" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary-container">
                {itemCount}
              </span>
            )}
          </button>
          <a
            href="#colecao"
            className="hidden bg-secondary px-6 py-2 text-label-caps text-primary-container uppercase transition-all hover:brightness-110 active:scale-95 md:block"
          >
            Shop Now
          </a>
        </div>
      </div>
    </nav>
  );
}
