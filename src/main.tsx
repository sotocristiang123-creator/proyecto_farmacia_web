import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { DisenoPrincipal } from "./layouts/DisenoPrincipal";
import { ControlInventario } from "./pages/ControlInventario";
import { DetalleMedicamento } from "./pages/DetalleMedicamento";
import { DetalleVenta } from "./pages/DetalleVenta";
import { GestionMedicamentos } from "./pages/GestionMedicamentos";
import { HistorialVentas } from "./pages/HistorialVentas";
import { PanelPrincipal } from "./pages/PanelPrincipal";
import { RegistroMedicamento } from "./pages/RegistroMedicamento";
import { RegistroVenta } from "./pages/RegistroVenta";
import { ReportesFarmacia } from "./pages/ReportesFarmacia";
import "../public/css/styles.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<DisenoPrincipal />}>
        <Route index path="/" element={<PanelPrincipal />} />
        <Route path="inventario" element={<ControlInventario />} />
        <Route path="medicamentos" element={<GestionMedicamentos />} />
        <Route path="registrar-medicamento" element={<RegistroMedicamento />} />
        <Route
          path="editar-medicamento/:id"
          element={<RegistroMedicamento />}
        />
        <Route path="medicamento/:id" element={<DetalleMedicamento />} />
        <Route path="registrar-venta" element={<RegistroVenta />} />
        <Route path="ventas" element={<HistorialVentas />} />
        <Route path="venta/:id" element={<DetalleVenta />} />
        <Route path="reportes" element={<ReportesFarmacia />} />
      </Route>
    </Routes>
  </BrowserRouter>,
);
