import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { PiePagina } from "../components/PiePagina";
import {
  evaluarVencimiento,
  guardarMedicamentos,
  guardarMovimientos,
  guardarVentas,
  obtenerMedicamentos,
  obtenerMovimientos,
  obtenerVentas,
} from "../data/almacenamiento";
import type {
  DetalleItemVenta,
  Medicamento,
  MovimientoInventario,
  Venta,
} from "../types/farmacia";

type FormularioCliente = {
  nombreCliente: string;
  documentoCliente: string;
  metodoPago: string;
};

export const RegistroVenta = () => {
  const navegar = useNavigate();
  const [medicamentos] = useState<Medicamento[]>(() => obtenerMedicamentos());
  const [medicamentoSeleccionadoId, setMedicamentoSeleccionadoId] =
    useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [carrito, setCarrito] = useState<DetalleItemVenta[]>([]);
  const [errorItem, setErrorItem] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioCliente>({
    defaultValues: {
      nombreCliente: "",
      documentoCliente: "",
      metodoPago: "Efectivo",
    },
  });

  const medicamentoActual = medicamentos.find(
    (m) => m.id === medicamentoSeleccionadoId,
  );

  const agregarMedicamento = () => {
    setErrorItem("");
    if (!medicamentoActual) {
      setErrorItem("Seleccione un medicamento del catálogo.");
      return;
    }

    const infoExp = evaluarVencimiento(medicamentoActual.fechaVencimiento);
    if (infoExp.dias < 0) {
      setErrorItem(
        "No se puede vender un medicamento con fecha de vencimiento cumplida.",
      );
      return;
    }

    const cantNum = Number(cantidad);
    if (!cantNum || cantNum <= 0) {
      setErrorItem("Ingrese una cantidad válida mayor a 0.");
      return;
    }

    const enCarrito = carrito.find(
      (item) => item.medicamentoId === medicamentoActual.id,
    );
    const totalSolicitado = (enCarrito ? enCarrito.cantidad : 0) + cantNum;

    if (totalSolicitado > medicamentoActual.stock) {
      setErrorItem(
        `Stock insuficiente. Disponible: ${medicamentoActual.stock} unidades.`,
      );
      return;
    }

    if (enCarrito) {
      setCarrito(
        carrito.map((item) =>
          item.medicamentoId === medicamentoActual.id
            ? {
                ...item,
                cantidad: totalSolicitado,
                subtotal: Number(
                  (totalSolicitado * medicamentoActual.precio).toFixed(2),
                ),
              }
            : item,
        ),
      );
    } else {
      const nuevoItem: DetalleItemVenta = {
        medicamentoId: medicamentoActual.id,
        nombreMedicamento: medicamentoActual.nombre,
        presentacion: medicamentoActual.presentacion,
        cantidad: cantNum,
        precioUnitario: Number(medicamentoActual.precio),
        subtotal: Number((cantNum * Number(medicamentoActual.precio)).toFixed(2)),
      };
      setCarrito([...carrito, nuevoItem]);
    }

    setMedicamentoSeleccionadoId("");
    setCantidad(1);
  };

  const quitarMedicamento = (medicamentoId: string) => {
    setCarrito(carrito.filter((item) => item.medicamentoId !== medicamentoId));
  };

  const importeTotal = carrito.reduce((suma, item) => suma + item.subtotal, 0);

  const confirmarVenta = (datosCliente: FormularioCliente) => {
    if (carrito.length === 0) {
      setErrorItem("Debe agregar al menos un medicamento a la venta.");
      return;
    }

    const codigoVenta = `vta-${uuidv4().slice(0, 6)}`;
    const fechaActual = new Date().toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const nuevaVenta: Venta = {
      id: codigoVenta,
      fecha: fechaActual,
      nombreCliente: datosCliente.nombreCliente,
      documentoCliente: datosCliente.documentoCliente,
      metodoPago: datosCliente.metodoPago,
      items: carrito,
      total: Number(importeTotal.toFixed(2)),
    };

    const listaMedicamentos = obtenerMedicamentos();
    const listaMovimientos = obtenerMovimientos();
    const nuevosMovimientos: MovimientoInventario[] = [];

    const medicamentosActualizados = listaMedicamentos.map((med) => {
      const vendido = carrito.find((item) => item.medicamentoId === med.id);
      if (!vendido) return med;

      const stockAnterior = Number(med.stock);
      const stockNuevo = Math.max(0, stockAnterior - vendido.cantidad);

      nuevosMovimientos.push({
        id: uuidv4(),
        fecha: fechaActual,
        medicamentoId: med.id,
        nombreMedicamento: med.nombre,
        tipo: "Salida por venta",
        cantidad: vendido.cantidad,
        stockAnterior,
        stockNuevo,
        lote: med.lote,
        observacion: `Venta registrada #${codigoVenta} (${datosCliente.nombreCliente})`,
      });

      return {
        ...med,
        stock: stockNuevo,
      };
    });

    guardarVentas([nuevaVenta, ...obtenerVentas()]);
    guardarMedicamentos(medicamentosActualizados);
    guardarMovimientos([...nuevosMovimientos, ...listaMovimientos]);

    navegar(`/venta/${codigoVenta}`);
  };

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Dispensación Farmacéutica</span>
          <h1>Registro de ventas</h1>
          <p>
            Selecciona medicamentos, establece cantidades, calcula el importe y
            registra la transacción descontando automáticamente el stock.
          </p>
        </div>
        <Link to="/ventas" className="btn btn-light">
          Ver historial de ventas
        </Link>
      </header>

      <section className="panel">
        <h2>1. Selección de medicamentos y cálculo de importe</h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="selectMedicamento">Medicamento disponible</label>
            <select
              id="selectMedicamento"
              value={medicamentoSeleccionadoId}
              onChange={(e) => {
                setMedicamentoSeleccionadoId(e.target.value);
                setErrorItem("");
              }}
            >
              <option value="">Seleccione un medicamento...</option>
              {medicamentos
                .filter((m) => m.stock > 0)
                .map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.nombre} ({med.presentacion}) — Bs.{" "}
                    {Number(med.precio).toFixed(2)} | Stock: {med.stock} und.
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="inputCantidad">Cantidad a vender</label>
            <div className="actions" style={{ flexWrap: "nowrap" }}>
              <input
                id="inputCantidad"
                type="number"
                min={1}
                max={medicamentoActual ? medicamentoActual.stock : 999}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
              <button
                type="button"
                className="btn"
                style={{ whiteSpace: "nowrap" }}
                onClick={agregarMedicamento}
              >
                + Agregar a la venta
              </button>
            </div>
          </div>
        </div>

        {medicamentoActual && (
          <div className="resumen-medicamento-seleccionado">
            <span>
              <strong>Principio activo:</strong>{" "}
              {medicamentoActual.principioActivo}
            </span>
            <span>
              <strong>Condición:</strong> {medicamentoActual.condicionVenta}
            </span>
            <span>
              <strong>Precio unitario:</strong> Bs.{" "}
              {Number(medicamentoActual.precio).toFixed(2)}
            </span>
            <span>
              <strong>Stock disponible:</strong> {medicamentoActual.stock} und.
              (Lote {medicamentoActual.lote})
            </span>
          </div>
        )}

        {errorItem && (
          <p className="form-help" style={{ marginTop: "10px" }}>
            {errorItem}
          </p>
        )}

        <div className="table-wrapper" style={{ marginTop: "20px" }}>
          <table>
            <thead>
              <tr>
                <th>N.º</th>
                <th>Medicamento</th>
                <th>Presentación</th>
                <th>Precio unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {carrito.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Aún no se han agregado medicamentos a la venta actual.
                  </td>
                </tr>
              ) : (
                carrito.map((item, idx) => (
                  <tr key={item.medicamentoId}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.nombreMedicamento}</strong>
                    </td>
                    <td>{item.presentacion}</td>
                    <td>Bs. {item.precioUnitario.toFixed(2)}</td>
                    <td>{item.cantidad}</td>
                    <td>
                      <strong>Bs. {item.subtotal.toFixed(2)}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => quitarMedicamento(item.medicamentoId)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="sale-total-bar">
          <span>Importe total de la venta:</span>
          <strong>Bs. {importeTotal.toFixed(2)}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>2. Datos del cliente y registro de la operación</h2>

        <form onSubmit={handleSubmit(confirmarVenta)}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombreCliente">
                Nombre completo o Razón Social
              </label>
              <input
                id="nombreCliente"
                placeholder="Ej. Juan Pérez / Sin Nombre"
                {...register("nombreCliente", {
                  required: "El nombre del cliente es obligatorio",
                })}
              />
              <p className="form-help">
                {errors.nombreCliente?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="documentoCliente">CI / NIT del cliente</label>
              <input
                id="documentoCliente"
                placeholder="Ej. 6841205 LP"
                {...register("documentoCliente", {
                  required: "El documento CI o NIT es obligatorio",
                })}
              />
              <p className="form-help">
                {errors.documentoCliente?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="metodoPago">Modalidad de pago</label>
              <select id="metodoPago" {...register("metodoPago")}>
                <option value="Efectivo">Efectivo (Bs.)</option>
                <option value="QR Simple">Pago QR Simple</option>
                <option value="Tarjeta de Débito / Crédito">
                  Tarjeta de Débito / Crédito
                </option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn">
              Confirmar y registrar venta (Bs. {importeTotal.toFixed(2)})
            </button>
          </div>
        </form>
      </section>

      <PiePagina />
    </main>
  );
};

