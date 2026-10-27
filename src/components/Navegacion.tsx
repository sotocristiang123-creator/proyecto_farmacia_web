import {
  BarChart3,
  Boxes,
  Cross,
  LayoutDashboard,
  Pill,
  PlusCircle,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";
import { NavLink } from "react-router";

export const Navegacion = () => {
  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="insignia-cruz">
          <Cross size={20} strokeWidth={2.6} />
        </div>
        <div>
          <h2 className="logo">FarmaGest</h2>
          <span className="logo-sub">Inventario y Ventas</span>
        </div>
      </div>

      <nav className="menu">
        <span className="menu-section">General</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <LayoutDashboard size={17} />
          Panel principal
        </NavLink>

        <span className="menu-section">Inventario y Catálogo</span>
        <NavLink
          to="/inventario"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Boxes size={17} />
          Control de inventario
        </NavLink>
        <NavLink
          to="/medicamentos"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Pill size={17} />
          Medicamentos
        </NavLink>
        <NavLink
          to="/registrar-medicamento"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <PlusCircle size={17} />
          Registrar medicamento
        </NavLink>

        <span className="menu-section">Operaciones de Venta</span>
        <NavLink
          to="/registrar-venta"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <ShoppingCart size={17} />
          Registrar venta
        </NavLink>
        <NavLink
          to="/ventas"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <ReceiptText size={17} />
          Historial de ventas
        </NavLink>
        <NavLink
          to="/reportes"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <BarChart3 size={17} />
          Reportes
        </NavLink>
      </nav>
    </aside>
  );
};
