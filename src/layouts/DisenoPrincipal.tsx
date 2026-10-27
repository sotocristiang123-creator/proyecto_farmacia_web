import { Outlet } from "react-router";
import { Navegacion } from "../components/Navegacion";

export const DisenoPrincipal = () => {
  return (
    <div className="layout">
      <Navegacion />
      <Outlet />
    </div>
  );
};
