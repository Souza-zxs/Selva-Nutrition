import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { navLinks } from "../data/content";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useStickyNavbar } from "../hooks/useStickyNavbar";
import { handleAnchorNav } from "../hooks/useLenis";
import Icon from "./Icon";
import { buttonClass } from "./ui/Button";

export default function Navbar() {
  const scrolled = useStickyNavbar();
  const { itemCount, open } = useCart();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-background/90 py-4 shadow-2xl backdrop-blur-xl"
          : "bg-transparent py-8"
      }`}
    >
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
        <Link to="/" aria-label="Selva Nutrition — início" className="flex items-center">
          <img
            src="/logo-selva-touro.png"
            alt="Selva Nutrition"
            className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 md:h-24"
          />
        </Link>
        <div className="hidden items-center gap-gutter md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorNav(e, link.href)}
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
              className="scale-95 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:text-[28px]"
              title={user.email ?? undefined}
            >
              <Icon name="person" />
            </button>
          ) : (
            <Link
              to="/login"
              aria-label="Entrar"
              className="scale-95 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:text-[28px]"
            >
              <Icon name="person" />
            </Link>
          )}
          <button
            aria-label={`Carrinho${itemCount > 0 ? ` (${itemCount} ${itemCount === 1 ? "item" : "itens"})` : ""}`}
            onClick={open}
            className="relative scale-95 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:text-[28px]"
          >
            <Icon name="shopping_bag" />
            {itemCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary-container">
                {itemCount}
              </span>
            )}
          </button>
          <a
            href="#colecao"
            onClick={(e) => handleAnchorNav(e, "#colecao")}
            className={buttonClass("filled", "hidden px-6 py-2 active:scale-95 md:block")}
          >
            Shop Now
          </a>
          <button
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="scale-95 text-2xl text-on-surface-variant transition-all hover:text-secondary active:scale-90 md:hidden"
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
                    className="text-label-caps text-on-surface-variant uppercase transition-colors duration-300 hover:text-secondary"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#colecao"
                  onClick={(e) => {
                    setMenuOpen(false);
                    handleAnchorNav(e, "#colecao");
                  }}
                  className={buttonClass("filled", "px-6 py-3 text-center")}
                >
                  Shop Now
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
