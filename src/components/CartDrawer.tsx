import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatBRL } from "../lib/currency";
import { effectivePrice } from "../lib/pricing";
import Icon from "./Icon";
import { buttonClass } from "./ui/Button";

export default function CartDrawer() {
  const { lines, isOpen, close, removeItem, setQty, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho de compras"
            className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-6">
              <h2 className="font-serif text-headline-lg-mobile text-on-surface uppercase">
                Seu Carrinho
              </h2>
              <button
                aria-label="Fechar carrinho"
                onClick={close}
                className="text-on-surface-variant transition-colors hover:text-secondary"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <p className="mt-12 text-center text-on-surface-variant">
                  Seu carrinho está vazio.
                </p>
              ) : (
                <ul className="flex flex-col gap-6">
                  {lines.map((line) => (
                    <li key={line.product.id} className="flex gap-4">
                      <div className="metallic-border flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-on-surface p-2">
                        {line.product.image ? (
                          <img
                            src={line.product.image}
                            alt={line.product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Icon
                            name={line.product.icon ?? "spa"}
                            className="text-3xl text-primary-container opacity-40"
                          />
                        )}
                      </div>
                      <div className="flex flex-grow flex-col">
                        <span className="text-sm text-on-surface uppercase">
                          {line.product.name}
                        </span>
                        <span className="mt-1 text-label-caps text-secondary">
                          {formatBRL(effectivePrice(line.product))}
                        </span>
                        <div className="mt-auto flex items-center gap-3">
                          <div className="carved-well flex items-center gap-3 bg-surface-dim px-3 py-1">
                            <button
                              aria-label="Diminuir quantidade"
                              className="text-on-surface-variant hover:text-secondary"
                              onClick={() =>
                                setQty(line.product.id, line.qty - 1)
                              }
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm">
                              {line.qty}
                            </span>
                            <button
                              aria-label="Aumentar quantidade"
                              className="text-on-surface-variant hover:text-secondary"
                              onClick={() =>
                                setQty(line.product.id, line.qty + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <button
                            aria-label="Remover item"
                            className="text-on-surface-variant/60 transition-colors hover:text-error"
                            onClick={() => removeItem(line.product.id)}
                          >
                            <Icon name="close" className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-outline-variant/20 px-6 py-6">
              <div className="mb-4 flex items-center justify-between text-body-lg text-on-surface">
                <span className="uppercase">Subtotal</span>
                <span className="text-secondary">{formatBRL(subtotal)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={close}
                aria-disabled={lines.length === 0}
                className={buttonClass(
                  "filled",
                  `block w-full py-4 text-center ${
                    lines.length === 0 ? "pointer-events-none opacity-40" : ""
                  }`,
                )}
              >
                Finalizar Compra
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
