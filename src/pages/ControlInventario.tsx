import { Boxes, Clock, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { PiePagina } from "../components/PiePagina";
import {
  evaluarStock,
  evaluarVencimiento,
  guardarMedicamentos,
  guardarMovimientos,
  obtenerMedicamentos,
  obtenerMovimientos,
} from "../data/almacenamiento";
import type { Medicamento, MovimientoInventario } from "../types/farmacia";

type FormularioMovimiento = {
  medicamentoId: string;
  cantidad: number;
  lote: string;
  fechaVencimiento: string;
  observacion: string;
};

export const ControlInventario = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() =>
    obtenerMedicamentos(),
  );
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>(() =>
    obtenerMovimientos(),
  );
  const [modoFiltro, setModoFiltro] = useState<
    "todos" | "bajo" | "vencimiento" | "optimo"
  >("todos");
  const [mensaje, setMensaje] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormularioMovimiento>({
    defaultValues: {
      medicamentoId: "",
    },
  });

  const registrarMovimiento = (datos: FormularioMovimiento) => {
    const seleccionado = medicamentos.find((m) => m.id === datos.medicamentoId);
    if (!seleccionado) return;

    const cantidadNum = Number(datos.cantidad);
    const stockAnterior = Number(seleccionado.stock);
    const stockNuevo = stockAnterior + cantidadNum;

    const medicamentosActualizados = medicamentos.map((m) => {
      if (m.id !== seleccionado.id) return m;
      return {
        ...m,
        stock: stockNuevo,
        lote: datos.lote.trim() ? datos.lote.trim() : m.lote,
        fechaVencimiento: datos.fechaVencimiento
          ? datos.fechaVencimiento
          : m.fechaVencimiento,
      };
    });

    const nuevoMovimiento: MovimientoInventario = {
      id: uuidv4(),
      fecha: new Date().toLocaleString("es-BO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      medicamentoId: seleccionado.id,
      nombreMedicamento: seleccionado.nombre,
      tipo: "Ingreso",
      cantidad: cantidadNum,
      stockAnterior,
      stockNuevo,
      lote: datos.lote.trim() ? datos.lote.trim() : seleccionado.lote,
      observacion: datos.observacion || "Reposición de inventario en almacén",
    };

    const listaMovimientos = [nuevoMovimiento, ...movimientos];

    setMedicamentos(medicamentosActualizados);
    setMovimientos(listaMovimientos);
    guardarMedicamentos(medicamentosActualizados);
    guardarMovimientos(listaMovimientos);

    setMensaje(
      `Ingreso registrado: se sumaron ${cantidadNum} unidades a ${seleccionado.nombre} (Stock: ${stockAnterior} → ${stockNuevo}).`,
    );
    reset({
      medicamentoId: "",
      cantidad: undefined,
      lote: "",
      fechaVencimiento: "",
      observacion: "",
    });
  };

  const seleccionarParaAbastecer = (med: Medicamento) => {
    setValue("medicamentoId", med.id);
    setValue("lote", med.lote);
    setValue("fechaVencimiento", med.fechaVencimiento);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalUnidades = medicamentos.reduce(
    (suma, item) => suma + Number(item.stock || 0),
    0,
  );
  const totalBajoStock = medicamentos.filter(
    (item) => evaluarStock(item.stock, item.stockMinimo).esBajo,
  ).length;
  const totalPorVencer = medicamentos.filter(
    (item) => evaluarVencimiento(item.fechaVencimiento).esAlerta,
  ).length;

  const medicamentosFiltrados = medicamentos.filter((med) => {
    const infoStock = evaluarStock(med.stock, med.stockMinimo);
    const infoExp = evaluarVencimiento(med.fechaVencimiento);
    if (modoFiltro === "bajo") return infoStock.esBajo;
    if (modoFiltro === "vencimiento") return infoExp.esAlerta;
    if (modoFiltro === "optimo") return !infoStock.esBajo && !infoExp.esAlerta;
    return true;
  });

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Administración de Almacén</span>
          <h1>Control de inventario</h1>
          <p>
            Supervisa las existencias disponibles, registra ingresos de lotes y
            controla fechas de vencimiento.
          </p>
        </div>
        <Link to="/registrar-medicamento" className="btn">
          + Nuevo medicamento
        </Link>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <p>Unidades totales en almacén</p>
            <span className="stat-icon stat-icon-teal">
              <Boxes size={18} />
            </span>
          </div>
          <strong>{totalUnidades}</strong>
          <span className="stat-note">
            Distribuidas en {medicamentos.length} medicamentos
          </span>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-top">
            <p>Existencias reducidas o agotadas</p>
            <span className="stat-icon stat-icon-amber">
              <TrendingDown size={18} />
            </span>
          </div>
          <strong>{totalBajoStock}</strong>
          <span className="stat-note">
            Medicamentos por debajo del stock mínimo
          </span>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-top">
            <p>Lotes próximos a vencer (≤ 90 días)</p>
            <span className="stat-icon stat-icon-amber">
              <Clock size={18} />
            </span>
          </div>
          <strong>{totalPorVencer}</strong>
          <span className="stat-note">Requieren rotación prioritaria</span>
        </div>
      </section>

      <section className="panel">
        <h2>Registrar ingreso de existencias</h2>

        {mensaje && <div className="alert-success">{mensaje}</div>}

        <form onSubmit={handleSubmit(registrarMovimiento)}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="medicamentoId">Medicamento</label>
              <select
                id="medicamentoId"
                defaultValue=""
                {...register("medicamentoId", {
                  required: "Seleccione un medicamento",
                })}
              >
                <option value="" disabled>
                  Seleccione el medicamento a abastecer
                </option>
                {medicamentos.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.nombre} (Stock actual: {med.stock} und. · Lote:{" "}
                    {med.lote})
                  </option>
                ))}
              </select>
              <p className="form-help">
                {errors.medicamentoId?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="cantidad">Cantidad de unidades a ingresar</label>
              <input
                id="cantidad"
                type="number"
                placeholder="Ej. 30"
                {...register("cantidad", {
                  required: "Ingrese la cantidad de unidades",
                  valueAsNumber: true,
                  validate: (valor) =>
                    (!Number.isNaN(valor) && valor > 0) ||
                    "La cantidad debe ser mayor que cero",
                })}
              />
              <p className="form-help">
                {errors.cantidad?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="lote">Código de lote</label>
              <input
                id="lote"
                placeholder="Ej. LT-2026-305"
                {...register("lote")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaVencimiento">Fecha de vencimiento</label>
              <input
                id="fechaVencimiento"
                type="date"
                {...register("fechaVencimiento")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="observacion">Proveedor u observación</label>
              <input
                id="observacion"
                placeholder="Ej. Factura #4021 Distribuidora INTI"
                {...register("observacion", {
                  required: "Indique el motivo o proveedor del ingreso",
                })}
              />
              <p className="form-help">
                {errors.observacion?.message?.toString()}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn">
              Registrar ingreso de stock
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Estado de existencias y vencimientos</h2>

          <div className="actions">
            <button
              type="button"
              className={`btn btn-sm ${modoFiltro === "todos" ? "" : "btn-light"}`}
              onClick={() => setModoFiltro("todos")}
            >
              Todos ({medicamentos.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${modoFiltro === "bajo" ? "" : "btn-light"}`}
              onClick={() => setModoFiltro("bajo")}
            >
              Stock reducido ({totalBajoStock})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${modoFiltro === "vencimiento" ? "" : "btn-light"}`}
              onClick={() => setModoFiltro("vencimiento")}
            >
              Próximos a vencer ({totalPorVencer})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${modoFiltro === "optimo" ? "" : "btn-light"}`}
              onClick={() => setModoFiltro("optimo")}
            >
              Óptimos
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Categoría</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Nivel de existencias</th>
                <th>Estado de stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicamentosFiltrados.map((med) => {
                const infoStock = evaluarStock(med.stock, med.stockMinimo);
                const infoExp = evaluarVencimiento(med.fechaVencimiento);
                const porcentaje = Math.min(
                  100,
                  Math.round(
                    (med.stock / Math.max(med.stockMinimo * 3, 1)) * 100,
                  ),
                );
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
                    <td>{med.categoria}</td>
                    <td>{med.lote}</td>
                    <td>
                      <div>{med.fechaVencimiento}</div>
                      <span className={infoExp.claseBadge}>
                        {infoExp.etiqueta}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{med.stock}</strong> und.{" "}
                        <small style={{ color: "#64748b" }}>
                          (mín. {med.stockMinimo})
                        </small>
                      </div>
                      <div className="stock-bar-track">
                        <div
                          className={`stock-bar-fill ${
                            infoStock.esBajo ? "stock-bar-warn" : "stock-bar-ok"
                          }`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={infoStock.claseBadge}>
                        {infoStock.etiqueta}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          onClick={() => seleccionarParaAbastecer(med)}
                        >
                          + Abastecer
                        </button>
                        <Link
                          to={`/editar-medicamento/${med.id}`}
                          className="btn btn-light btn-sm"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <PiePagina />
    </main>
  );
};
