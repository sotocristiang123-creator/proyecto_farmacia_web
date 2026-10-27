import {
  AlertTriangle,
  Banknote,
  ClipboardCheck,
  Cross,
  Package,
  Pill,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { PiePagina } from "../components/PiePagina";
import {
  evaluarStock,
  evaluarVencimiento,
  obtenerMedicamentos,
  obtenerVentas,
} from "../data/almacenamiento";
import type { Medicamento, Venta } from "../types/farmacia";

export const PanelPrincipal = () => {
  const [medicamentos] = useState<Medicamento[]>(() => obtenerMedicamentos());
  const [ventas] = useState<Venta[]>(() => obtenerVentas());

  const totalMedicamentos = medicamentos.length;
  const totalStock = medicamentos.reduce(
    (suma, item) => suma + Number(item.stock || 0),
    0,
  );
  const totalCategorias = new Set(medicamentos.map((item) => item.categoria))
    .size;

  const ingresosTotales = ventas.reduce(
    (suma, venta) => suma + Number(venta.total || 0),
    0,
  );

  const medicamentosBajoStock = medicamentos.filter(
    (item) => evaluarStock(item.stock, item.stockMinimo).esBajo,
  );

  const medicamentosPorVencer = medicamentos.filter(
    (item) => evaluarVencimiento(item.fechaVencimiento).esAlerta,
  );

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Sistema de Gestión Farmacéutica</span>
          <h1>Panel principal</h1>
          <p>
            Control centralizado de inventario de medicamentos y registro de
            operaciones de venta.
          </p>
        </div>
        <div className="actions">
          <Link to="/registrar-venta" className="btn">
            + Registrar venta
          </Link>
          <Link to="/inventario" className="btn btn-light">
            Control de inventario
          </Link>
        </div>
      </header>

      <section className="banner-panel-admin">
        <div>
          <span className="pharma-pill">
            <Cross size={13} /> FarmaGest · Farmacia
          </span>
          <h2>Control de Inventario y Registro de Ventas</h2>
          <p>
            Administra las existencias de medicamentos, supervisa fechas de
            vencimiento, abastece lotes y registra las ventas diarias de la
            farmacia de manera sencilla y organizada.
          </p>
          <div className="actions" style={{ marginTop: "18px" }}>
            <Link to="/registrar-venta" className="btn">
              Realizar venta
            </Link>
            <Link to="/registrar-medicamento" className="btn btn-light">
              Registrar medicamento
            </Link>
          </div>
        </div>
        <div className="espacio-imagen-banner">
          <img src="/img/banner-principal.jpg" alt="FarmaGest Farmacia" />
        </div>
      </section>

      <section className="stats-grid stats-grid-4">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Medicamentos registrados</p>
            <span className="stat-icon stat-icon-teal">
              <Pill size={18} />
            </span>
          </div>
          <strong>{totalMedicamentos}</strong>
          <span className="stat-note">
            En {totalCategorias} categorías terapéuticas
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Existencias disponibles</p>
            <span className="stat-icon stat-icon-blue">
              <Package size={18} />
            </span>
          </div>
          <strong>{totalStock}</strong>
          <span className="stat-note">Unidades totales en inventario</span>
        </div>

        <div className="stat-card stat-card-accent">
          <div className="stat-card-top">
            <p>Ingresos por ventas</p>
            <span className="stat-icon stat-icon-emerald">
              <Banknote size={18} />
            </span>
          </div>
          <strong>Bs. {ingresosTotales.toFixed(2)}</strong>
          <span className="stat-note">
            {ventas.length} transacciones registradas
          </span>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-top">
            <p>Alertas de inventario</p>
            <span className="stat-icon stat-icon-amber">
              <AlertTriangle size={18} />
            </span>
          </div>
          <strong>
            {medicamentosBajoStock.length + medicamentosPorVencer.length}
          </strong>
          <span className="stat-note">
            {medicamentosBajoStock.length} stock reducido ·{" "}
            {medicamentosPorVencer.length} por vencer
          </span>
        </div>
      </section>

      <section className="franja-banners-diseno">
        <div className="tarjeta-banner-diseno">
          <div className="icono-tarjeta-info stat-icon-teal">
            <ClipboardCheck size={26} />
          </div>
          <div>
            <h3>Supervisión de Existencias y Lotes</h3>
            <p>
              Monitorea cantidades disponibles y fechas de vencimiento próximas.
            </p>
          </div>
        </div>

        <div className="tarjeta-banner-diseno">
          <div className="icono-tarjeta-info stat-icon-blue">
            <ShoppingBag size={26} />
          </div>
          <div>
            <h3>Dispensación y Registro Comercial</h3>
            <p>
              Calcula importes automáticamente y actualiza el stock en cada
              venta.
            </p>
          </div>
        </div>
      </section>

      <div className="dual-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Medicamentos con existencias reducidas</h2>
            <Link to="/inventario" className="student-name">
              Abastecer stock →
            </Link>
          </div>

          {medicamentosBajoStock.length === 0 ? (
            <p className="empty-state">
              Todos los medicamentos cuentan con stock óptimo.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Stock actual</th>
                    <th>Mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosBajoStock.map((med) => {
                    const infoStock = evaluarStock(med.stock, med.stockMinimo);
                    return (
                      <tr key={med.id}>
                        <td>
                          <Link
                            to={`/medicamento/${med.id}`}
                            className="student-name"
                          >
                            {med.nombre}
                          </Link>
                          <span className="sub-cell">{med.laboratorio}</span>
                        </td>
                        <td>
                          <strong>{med.stock}</strong> und.
                        </td>
                        <td>{med.stockMinimo} und.</td>
                        <td>
                          <span className={infoStock.claseBadge}>
                            {infoStock.etiqueta}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Vencimientos próximos (≤ 90 días)</h2>
            <Link to="/reportes" className="student-name">
              Ver reportes →
            </Link>
          </div>

          {medicamentosPorVencer.length === 0 ? (
            <p className="empty-state">
              No existen lotes próximos a vencer en los siguientes 90 días.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosPorVencer.map((med) => {
                    const infoExp = evaluarVencimiento(med.fechaVencimiento);
                    return (
                      <tr key={med.id}>
                        <td>
                          <Link
                            to={`/medicamento/${med.id}`}
                            className="student-name"
                          >
                            {med.nombre}
                          </Link>
                          <span className="sub-cell">{med.presentacion}</span>
                        </td>
                        <td>{med.lote}</td>
                        <td>{med.fechaVencimiento}</td>
                        <td>
                          <span className={infoExp.claseBadge}>
                            {infoExp.etiqueta}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <PiePagina />
    </main>
  );
};
