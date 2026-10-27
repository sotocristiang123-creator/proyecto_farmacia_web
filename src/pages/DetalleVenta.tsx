import { Link, useParams } from "react-router";
import { PiePagina } from "../components/PiePagina";
import { obtenerVentas } from "../data/almacenamiento";

export const DetalleVenta = () => {
  const { id } = useParams();
  const venta = obtenerVentas().find((v) => v.id === id) || null;

  if (!venta) {
    return (
      <main className="main-content">
        <div className="panel" style={{ textAlign: "center", padding: "24px" }}>
          <h2>Comprobante de venta no encontrado</h2>
          <p style={{ marginBottom: "16px" }}>
            La transacción solicitada no existe o fue anulada.
          </p>
          <Link to="/ventas" className="btn btn-light">
            Volver al historial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Comprobante de Venta</span>
          <h1>Detalle de venta #{venta.id}</h1>
          <p>Comprobante de dispensación farmacéutica registrado.</p>
        </div>
        <div className="actions">
          <Link to="/registrar-venta" className="btn">
            + Nueva venta
          </Link>
          <Link to="/ventas" className="btn btn-light">
            Volver al historial
          </Link>
        </div>
      </header>

      <section className="panel">
        <div className="detail-header">
          <div className="avatar">RX</div>
          <div>
            <h2>Comprobante de Venta · FarmaGest</h2>
            <p>
              Operación #{venta.id} · Registrada el {venta.fecha}
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="badge badge-active">Transacción completada</span>
          </div>
        </div>

        <div className="detail-grid" style={{ marginBottom: "24px" }}>
          <div className="detail-field">
            <span>Cliente / Paciente</span>
            <strong>{venta.nombreCliente}</strong>
          </div>

          <div className="detail-field">
            <span>Documento CI / NIT</span>
            <strong>{venta.documentoCliente}</strong>
          </div>

          <div className="detail-field">
            <span>Modalidad de pago</span>
            <strong>{venta.metodoPago}</strong>
          </div>

          <div className="detail-field">
            <span>Importe total pagado</span>
            <strong>Bs. {Number(venta.total).toFixed(2)}</strong>
          </div>
        </div>

        <h2>Medicamentos dispensados</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>N.º</th>
                <th>Medicamento</th>
                <th>Presentación</th>
                <th>Precio unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.items.map((item, idx) => (
                <tr key={item.medicamentoId}>
                  <td>{idx + 1}</td>
                  <td>
                    <Link
                      to={`/medicamento/${item.medicamentoId}`}
                      className="student-name"
                    >
                      {item.nombreMedicamento}
                    </Link>
                  </td>
                  <td>{item.presentacion}</td>
                  <td>Bs. {Number(item.precioUnitario).toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td>
                    <strong>Bs. {Number(item.subtotal).toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sale-total-bar">
          <span>Total facturado:</span>
          <strong>Bs. {Number(venta.total).toFixed(2)}</strong>
        </div>
      </section>

      <PiePagina />
    </main>
  );
};
