import { Link, useNavigate, useParams } from "react-router";
import { PiePagina } from "../components/PiePagina";
import {
  evaluarStock,
  evaluarVencimiento,
  guardarMedicamentos,
  obtenerMedicamentos,
} from "../data/almacenamiento";

export const DetalleMedicamento = () => {
  const parametros = useParams();
  const navegar = useNavigate();
  const medicamento =
    obtenerMedicamentos().find((m) => m.id === parametros.id) || null;

  const eliminarMedicamento = () => {
    if (!medicamento) return;
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el medicamento "${medicamento.nombre}"?`,
    );
    if (!confirmar) return;

    const lista = obtenerMedicamentos().filter((m) => m.id !== medicamento.id);
    guardarMedicamentos(lista);
    navegar("/medicamentos");
  };

  if (!medicamento) {
    return (
      <main className="main-content">
        <div className="panel" style={{ textAlign: "center", padding: "24px" }}>
          <h2>Medicamento no encontrado</h2>
          <p style={{ marginBottom: "16px" }}>
            El medicamento solicitado no se encuentra registrado.
          </p>
          <Link to="/medicamentos" className="btn btn-light">
            Volver al listado
          </Link>
        </div>
      </main>
    );
  }

  const iniciales = medicamento.nombre.slice(0, 2).toUpperCase();
  const infoStock = evaluarStock(medicamento.stock, medicamento.stockMinimo);
  const infoExp = evaluarVencimiento(medicamento.fechaVencimiento);

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Ficha Farmacológica</span>
          <h1>Detalle del medicamento</h1>
          <p>Especificaciones terapéuticas, presentación y disponibilidad.</p>
        </div>
        <div className="actions">
          <Link
            to={`/editar-medicamento/${medicamento.id}`}
            className="btn"
          >
            Editar medicamento
          </Link>
          <Link to="/medicamentos" className="btn btn-light">
            Volver al catálogo
          </Link>
        </div>
      </header>

      <section className="panel">
        <div className="detail-header">
          <div className="avatar">{iniciales}</div>
          <div>
            <h2>{medicamento.nombre}</h2>
            <p>
              {medicamento.principioActivo} · Laboratorio{" "}
              {medicamento.laboratorio}
            </p>
          </div>
          <div className="actions" style={{ marginLeft: "auto" }}>
            <span className={infoStock.claseBadge}>{infoStock.etiqueta}</span>
            <span className={infoExp.claseBadge}>{infoExp.etiqueta}</span>
          </div>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "24px 0",
          }}
        />

        <h2>Información farmacológica y comercial</h2>

        <div className="detail-grid">
          <div className="detail-field">
            <span>Nombre comercial</span>
            <strong>{medicamento.nombre}</strong>
          </div>

          <div className="detail-field">
            <span>Principio activo / Concentración</span>
            <strong>{medicamento.principioActivo}</strong>
          </div>

          <div className="detail-field">
            <span>Categoría terapéutica</span>
            <strong>{medicamento.categoria}</strong>
          </div>

          <div className="detail-field">
            <span>Presentación</span>
            <strong>{medicamento.presentacion}</strong>
          </div>

          <div className="detail-field">
            <span>Laboratorio fabricante</span>
            <strong>{medicamento.laboratorio}</strong>
          </div>

          <div className="detail-field">
            <span>Condición de dispensación</span>
            <strong>{medicamento.condicionVenta}</strong>
          </div>

          <div className="detail-field">
            <span>Precio unitario de venta</span>
            <strong>Bs. {Number(medicamento.precio).toFixed(2)}</strong>
          </div>

          <div className="detail-field">
            <span>Existencias disponibles</span>
            <strong>
              {medicamento.stock} unidades (Mínimo: {medicamento.stockMinimo}{" "}
              und.)
            </strong>
          </div>

          <div className="detail-field">
            <span>Número de lote</span>
            <strong>{medicamento.lote}</strong>
          </div>

          <div className="detail-field">
            <span>Fecha de vencimiento</span>
            <strong>
              {medicamento.fechaVencimiento} ({infoExp.etiqueta})
            </strong>
          </div>

          <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
            <span>Indicaciones y descripción</span>
            <strong>{medicamento.descripcion}</strong>
          </div>
        </div>

        <div className="actions" style={{ margin: "24px 0 0" }}>
          <Link to="/medicamentos" className="btn btn-light">
            Volver al listado
          </Link>
          <Link to="/inventario" className="btn btn-light">
            Abastecer en inventario
          </Link>
          <Link to="/registrar-venta" className="btn">
            Registrar venta
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={eliminarMedicamento}
          >
            Eliminar medicamento
          </button>
        </div>
      </section>

      <PiePagina />
    </main>
  );
};
