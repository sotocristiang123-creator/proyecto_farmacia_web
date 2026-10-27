import { Banknote, Pill, ReceiptText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { PiePagina } from "../components/PiePagina";
import {
  guardarMedicamentos,
  guardarVentas,
  obtenerMedicamentos,
  obtenerVentas,
} from "../data/almacenamiento";
import type { Venta } from "../types/farmacia";

export const HistorialVentas = () => {
  const [ventas, setVentas] = useState<Venta[]>(() => obtenerVentas());
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>("");

  const anularVenta = (venta: Venta) => {
    const confirmar = window.confirm(
      `¿Deseas anular la venta #${venta.id} de "${venta.nombreCliente}"? El stock de los medicamentos vendidos será restituido al inventario.`,
    );
    if (!confirmar) return;

    const medicamentosActuales = obtenerMedicamentos();
    const medicamentosRestaurados = medicamentosActuales.map((med) => {
      const itemVendido = venta.items.find((i) => i.medicamentoId === med.id);
      if (!itemVendido) return med;
      return {
        ...med,
        stock: Number(med.stock) + Number(itemVendido.cantidad),
      };
    });

    const ventasActualizadas = ventas.filter((v) => v.id !== venta.id);
    setVentas(ventasActualizadas);
    guardarVentas(ventasActualizadas);
    guardarMedicamentos(medicamentosRestaurados);
  };

  const ventasFiltradas = ventas.filter(
    (v) =>
      v.nombreCliente.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      v.documentoCliente
        .toLowerCase()
        .includes(terminoBusqueda.toLowerCase()) ||
      v.id.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      v.items.some((item) =>
        item.nombreMedicamento
          .toLowerCase()
          .includes(terminoBusqueda.toLowerCase()),
      ),
  );

  const totalRecaudado = ventas.reduce(
    (suma, v) => suma + Number(v.total || 0),
    0,
  );
  const totalUnidadesVendidas = ventas.reduce(
    (suma, v) => suma + v.items.reduce((acc, i) => acc + i.cantidad, 0),
    0,
  );

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Operaciones Comerciales</span>
          <h1>Historial de ventas</h1>
          <p>
            Consulta las ventas registradas, medicamentos dispensados e importes
            cobrados.
          </p>
        </div>
        <Link to="/registrar-venta" className="btn">
          + Registrar nueva venta
        </Link>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Ventas registradas</p>
            <span className="stat-icon stat-icon-teal">
              <ReceiptText size={18} />
            </span>
          </div>
          <strong>{ventas.length}</strong>
          <span className="stat-note">Operaciones completadas</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Unidades dispensadas</p>
            <span className="stat-icon stat-icon-blue">
              <Pill size={18} />
            </span>
          </div>
          <strong>{totalUnidadesVendidas}</strong>
          <span className="stat-note">Total de medicamentos vendidos</span>
        </div>

        <div className="stat-card stat-card-accent">
          <div className="stat-card-top">
            <p>Monto total recaudado</p>
            <span className="stat-icon stat-icon-emerald">
              <Banknote size={18} />
            </span>
          </div>
          <strong>Bs. {totalRecaudado.toFixed(2)}</strong>
          <span className="stat-note">Ingresos acumulados</span>
        </div>
      </section>

      <section className="panel">
        <div className="filter-bar">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="buscarVenta">Buscar operación de venta</label>
            <input
              id="buscarVenta"
              type="text"
              placeholder="Buscar por código de venta, cliente, CI/NIT o medicamento vendido..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
          </div>
        </div>

        <h2>Registro histórico de ventas ({ventasFiltradas.length})</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha y hora</th>
                <th>Cliente / CI-NIT</th>
                <th>Medicamentos vendidos</th>
                <th>Cant. total</th>
                <th>Pago</th>
                <th>Importe total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No se encontraron ventas registradas.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => {
                  const cantTotal = venta.items.reduce(
                    (suma, item) => suma + item.cantidad,
                    0,
                  );
                  return (
                    <tr key={venta.id}>
                      <td>
                        <strong>#{venta.id}</strong>
                      </td>
                      <td>{venta.fecha}</td>
                      <td>
                        <strong>{venta.nombreCliente}</strong>
                        <span className="sub-cell">
                          CI/NIT: {venta.documentoCliente}
                        </span>
                      </td>
                      <td>
                        {venta.items
                          .map(
                            (i) => `${i.nombreMedicamento} (x${i.cantidad})`,
                          )
                          .join(", ")}
                      </td>
                      <td>{cantTotal} und.</td>
                      <td>
                        <span className="badge badge-otc">
                          {venta.metodoPago}
                        </span>
                      </td>
                      <td>
                        <strong>Bs. {Number(venta.total).toFixed(2)}</strong>
                      </td>
                      <td>
                        <div className="actions">
                          <Link
                            to={`/venta/${venta.id}`}
                            className="student-name"
                          >
                            Ver comprobante
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => anularVenta(venta)}
                          >
                            Anular
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <PiePagina />
    </main>
  );
};
