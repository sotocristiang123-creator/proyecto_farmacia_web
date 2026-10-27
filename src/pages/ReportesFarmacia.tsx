import {
  ArrowLeftRight,
  Banknote,
  BarChart3,
  PackageCheck,
} from "lucide-react";
import { useState } from "react";
import { PiePagina } from "../components/PiePagina";
import {
  obtenerMedicamentos,
  obtenerMovimientos,
  obtenerVentas,
} from "../data/almacenamiento";
import type {
  Medicamento,
  MovimientoInventario,
  Venta,
} from "../types/farmacia";

type ReporteProductoVendido = {
  medicamentoId: string;
  nombreMedicamento: string;
  presentacion: string;
  unidadesVendidas: number;
  recaudacion: number;
};

type ReporteCategoria = {
  categoria: string;
  cantidadProductos: number;
  totalUnidades: number;
  valorInventario: number;
};

export const ReportesFarmacia = () => {
  const [medicamentos] = useState<Medicamento[]>(() => obtenerMedicamentos());
  const [ventas] = useState<Venta[]>(() => obtenerVentas());
  const [movimientos] = useState<MovimientoInventario[]>(() =>
    obtenerMovimientos(),
  );

  const valorInventarioTotal = medicamentos.reduce(
    (suma, med) => suma + Number(med.stock || 0) * Number(med.precio || 0),
    0,
  );

  const ingresosTotales = ventas.reduce(
    (suma, venta) => suma + Number(venta.total || 0),
    0,
  );

  const ticketPromedio =
    ventas.length > 0 ? ingresosTotales / ventas.length : 0;

  const mapaVentasProducto = new Map<string, ReporteProductoVendido>();
  ventas.forEach((venta) => {
    venta.items.forEach((item) => {
      const existente = mapaVentasProducto.get(item.medicamentoId);
      if (existente) {
        existente.unidadesVendidas += Number(item.cantidad);
        existente.recaudacion += Number(item.subtotal);
      } else {
        mapaVentasProducto.set(item.medicamentoId, {
          medicamentoId: item.medicamentoId,
          nombreMedicamento: item.nombreMedicamento,
          presentacion: item.presentacion,
          unidadesVendidas: Number(item.cantidad),
          recaudacion: Number(item.subtotal),
        });
      }
    });
  });

  const productosMasVendidos = Array.from(mapaVentasProducto.values()).sort(
    (a, b) => b.unidadesVendidas - a.unidadesVendidas,
  );

  const mapaCategorias = new Map<string, ReporteCategoria>();
  medicamentos.forEach((med) => {
    const actual = mapaCategorias.get(med.categoria);
    const valor = Number(med.stock || 0) * Number(med.precio || 0);
    if (actual) {
      actual.cantidadProductos += 1;
      actual.totalUnidades += Number(med.stock || 0);
      actual.valorInventario += valor;
    } else {
      mapaCategorias.set(med.categoria, {
        categoria: med.categoria,
        cantidadProductos: 1,
        totalUnidades: Number(med.stock || 0),
        valorInventario: valor,
      });
    }
  });

  const reportesPorCategoria = Array.from(mapaCategorias.values()).sort(
    (a, b) => b.valorInventario - a.valorInventario,
  );

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Análisis y Estadísticas</span>
          <h1>Reportes de ventas e inventario</h1>
          <p>
            Seguimiento consolidado de ingresos, medicamentos más
            comercializados, valorización por categoría y kardex.
          </p>
        </div>
      </header>

      <section className="stats-grid stats-grid-4">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Valorización de inventario</p>
            <span className="stat-icon stat-icon-teal">
              <PackageCheck size={18} />
            </span>
          </div>
          <strong>Bs. {valorInventarioTotal.toFixed(2)}</strong>
          <span className="stat-note">Capital en medicamentos disponibles</span>
        </div>

        <div className="stat-card stat-card-accent">
          <div className="stat-card-top">
            <p>Ingresos totales por ventas</p>
            <span className="stat-icon stat-icon-emerald">
              <Banknote size={18} />
            </span>
          </div>
          <strong>Bs. {ingresosTotales.toFixed(2)}</strong>
          <span className="stat-note">
            Acumulado en {ventas.length} transacciones
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Ticket promedio por pedido</p>
            <span className="stat-icon stat-icon-blue">
              <BarChart3 size={18} />
            </span>
          </div>
          <strong>Bs. {ticketPromedio.toFixed(2)}</strong>
          <span className="stat-note">Importe medio por compra</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <p>Movimientos de kardex</p>
            <span className="stat-icon stat-icon-amber">
              <ArrowLeftRight size={18} />
            </span>
          </div>
          <strong>{movimientos.length}</strong>
          <span className="stat-note">Ingresos y salidas registradas</span>
        </div>
      </section>

      <div className="dual-grid">
        <section className="panel">
          <h2>Medicamentos más comercializados</h2>

          {productosMasVendidos.length === 0 ? (
            <p className="empty-state">
              No existen registros de ventas para generar el ranking.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>N.º</th>
                    <th>Medicamento</th>
                    <th>Unidades vendidas</th>
                    <th>Total recaudado</th>
                  </tr>
                </thead>
                <tbody>
                  {productosMasVendidos.map((item, idx) => (
                    <tr key={item.medicamentoId}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{item.nombreMedicamento}</strong>
                        <span className="sub-cell">{item.presentacion}</span>
                      </td>
                      <td>
                        <strong>{item.unidadesVendidas}</strong> und.
                      </td>
                      <td>Bs. {item.recaudacion.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Distribución de inventario por categoría</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Categoría terapéutica</th>
                  <th>Productos</th>
                  <th>Existencias</th>
                  <th>Valor en stock</th>
                </tr>
              </thead>
              <tbody>
                {reportesPorCategoria.map((cat) => (
                  <tr key={cat.categoria}>
                    <td>
                      <strong>{cat.categoria}</strong>
                    </td>
                    <td>{cat.cantidadProductos}</td>
                    <td>{cat.totalUnidades} und.</td>
                    <td>Bs. {cat.valorInventario.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>Kardex de movimientos de inventario</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Medicamento</th>
                <th>Tipo de movimiento</th>
                <th>Cantidad</th>
                <th>Stock ant. → nuevo</th>
                <th>Lote</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No se registran movimientos de inventario.
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.id}>
                    <td>{mov.fecha}</td>
                    <td>
                      <strong>{mov.nombreMedicamento}</strong>
                    </td>
                    <td>
                      <span
                        className={
                          mov.tipo === "Ingreso"
                            ? "badge badge-active"
                            : mov.tipo === "Salida por venta"
                              ? "badge badge-otc"
                              : "badge badge-warning"
                        }
                      >
                        {mov.tipo}
                      </span>
                    </td>
                    <td>
                      <strong>{mov.cantidad}</strong> und.
                    </td>
                    <td>
                      {mov.stockAnterior} → <strong>{mov.stockNuevo}</strong>
                    </td>
                    <td>{mov.lote}</td>
                    <td>{mov.observacion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <PiePagina />
    </main>
  );
};

