import { Link } from "react-router-dom";
import Icon from "./Icon";

type BackToHomeProps = {
  className?: string;
};

export default function BackToHome({ className = "" }: BackToHomeProps) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 text-label-caps text-on-surface-variant uppercase transition-colors duration-300 hover:text-secondary ${className}`}
    >
      <Icon
        name="arrow_back"
        className="text-base transition-transform duration-300 group-hover:-translate-x-1"
      />
      Voltar à loja
    </Link>
  );
}
