import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { navLinks } from "../data/content";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useStickyNavbar } from "../hooks/useStickyNavbar";
import { handleAnchorNav } from "../hooks/useLenis";
import Icon from "./Icon";
import { buttonClass } from "./ui/Button";

export default function Navbar() {
  const scrolled = useStickyNavbar();
  const { itemCount, open } = useCart();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-[padding] duration-500 ${
        scrolled ? "py-4" : "py-8"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-all duration-300 ease-out ${
          scrolled
            ? "bg-background/70 shadow-lg backdrop-blur-md"
            : "bg-linear-to-b from-black/45 via-black/10 to-transparent"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right bg-linear-to-r from-transparent via-secondary to-transparent transition-transform duration-500 ease-in-out ${
          scrolled ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <div className="relative mx-auto grid w-full max-w-container-max grid-cols-[1fr_auto_1fr] items-center gap-gutter px-margin-mobile md:px-margin-desktop">
        <Link
          to="/"
          aria-label="Selva Nutrition — início"
          className="group flex items-center gap-3"
        >
          <img
            src="/logo-selva-touro.png"
            alt=""
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:h-14"
          />
          <span className="font-serif text-lg leading-none tracking-[0.2em] text-on-surface uppercase transition-colors duration-300 group-hover:text-secondary md:text-xl">
            Selva
          </span>
        </Link>
        <div className="hidden items-center justify-center gap-gutter md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorNav(e, link.href)}
              className="group relative py-1 text-label-caps text-on-surface-variant uppercase transition-colors duration-300 hover:text-secondary"
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-secondary transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </div>
        <div className="flex items-center justify-end gap-5 md:gap-6">
          <div className="flex items-center gap-5">
            <Link
              to={user ? "/minha-conta" : "/login"}
              aria-label={user ? "Minha conta" : "Entrar"}
              className="-m-2 scale-95 p-2 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:text-[28px]"
              title={user?.email ?? undefined}
            >
              <Icon name="person" />
            </Link>
            <button
              aria-label={`Carrinho${itemCount > 0 ? ` (${itemCount} ${itemCount === 1 ? "item" : "itens"})` : ""}`}
              onClick={open}
              className="relative -m-2 scale-95 p-2 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:text-[28px]"
            >
              <Icon name="shopping_bag" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary-container">
                  {itemCount}
                </span>
              )}
            </button>
            {isAdmin && (
              <Link
                to="/admin/produtos"
                aria-label="Painel admin"
                title="Painel admin"
                className="-m-2 scale-95 p-2 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:text-[28px]"
              >
                <Icon name="inventory" />
              </Link>
            )}
          </div>
          <span aria-hidden className="hidden h-6 w-px bg-outline-variant/50 md:block" />
          <a
            href="#colecao"
            onClick={(e) => handleAnchorNav(e, "#colecao")}
            className={buttonClass("filled", "hidden px-6 py-2 active:scale-95 md:block")}
          >
            Comprar
          </a>
          <button
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="-m-2 scale-95 p-2 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:hidden"
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="mobile-menu-backdrop"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              key="mobile-menu-panel"
              className="metallic-border absolute top-full left-0 z-40 w-full origin-top bg-background px-margin-mobile py-8 md:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      setMenuOpen(false);
                      handleAnchorNav(e, link.href);
                    }}
                    className="-my-2 py-2 text-label-caps text-on-surface-variant uppercase transition-colors duration-300 hover:text-secondary"
                  >
                    {link.label}
                  </a>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin/produtos"
                    onClick={() => setMenuOpen(false)}
                    className="text-label-caps text-secondary uppercase transition-colors duration-300 hover:text-on-surface"
                  >
                    Painel admin
                  </Link>
                )}
                <a
                  href="#colecao"
                  onClick={(e) => {
                    setMenuOpen(false);
                    handleAnchorNav(e, "#colecao");
                  }}
                  className={buttonClass("filled", "px-6 py-3 text-center")}
                >
                  Comprar
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
