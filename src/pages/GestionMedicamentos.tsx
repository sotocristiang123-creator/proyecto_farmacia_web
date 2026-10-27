import { useState } from "react";
import { Link } from "react-router";
import { PiePagina } from "../components/PiePagina";
import {
  evaluarStock,
  evaluarVencimiento,
  guardarMedicamentos,
  obtenerMedicamentos,
} from "../data/almacenamiento";
import type { Medicamento } from "../types/farmacia";

export const GestionMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() =>
    obtenerMedicamentos(),
  );
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");

  const eliminarMedicamento = (id: string, nombre: string) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el medicamento "${nombre}" del catálogo?`,
    );
    if (!confirmar) return;

    const actualizados = medicamentos.filter((item) => item.id !== id);
    setMedicamentos(actualizados);
    guardarMedicamentos(actualizados);
  };

  const categorias = [
    "Todas",
    ...Array.from(new Set(medicamentos.map((item) => item.categoria))),
  ];

  const medicamentosFiltrados = medicamentos.filter((med) => {
    const coincideTexto =
      med.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      med.principioActivo.toLowerCase().includes(busqueda.toLowerCase()) ||
      med.laboratorio.toLowerCase().includes(busqueda.toLowerCase()) ||
      med.lote.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "Todas" || med.categoria === filtroCategoria;

    return coincideTexto && coincideCategoria;
  });

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Administración de Productos</span>
          <h1>Gestión de medicamentos</h1>
          <p>
            Administra las fichas farmacológicas, precios y disponibilidad del
            catálogo.
          </p>
        </div>
        <Link to="/registrar-medicamento" className="btn">
          + Nuevo medicamento
        </Link>
      </header>

      <section className="panel">
        <div className="filter-bar">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="busquedaMed">Buscar medicamento</label>
            <input
              id="busquedaMed"
              type="text"
              placeholder="Buscar por nombre comercial, principio activo, laboratorio o lote..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="filtroCategoria">Categoría terapéutica</label>
            <select
              id="filtroCategoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2>Catálogo registrado ({medicamentosFiltrados.length})</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>N.º</th>
                <th>Medicamento</th>
                <th>Categoría</th>
                <th>Presentación</th>
                <th>Condición</th>
                <th>Vencimiento</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No se encontraron medicamentos con los criterios
                    seleccionados.
                  </td>
                </tr>
              ) : (
                medicamentosFiltrados.map((med, idx) => {
                  const infoStock = evaluarStock(med.stock, med.stockMinimo);
                  const infoExp = evaluarVencimiento(med.fechaVencimiento);

                  return (
                    <tr key={med.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{med.nombre}</strong>
                        <span className="sub-cell">
                          {med.principioActivo} · {med.laboratorio}
                        </span>
                      </td>
                      <td>{med.categoria}</td>
                      <td>{med.presentacion}</td>
                      <td>
                        <span
                          className={
                            med.condicionVenta === "Bajo receta médica"
                              ? "badge badge-rx"
                              : "badge badge-otc"
                          }
                        >
                          {med.condicionVenta}
                        </span>
                      </td>
                      <td>
                        <div>{med.fechaVencimiento}</div>
                        <span className={infoExp.claseBadge}>
                          {infoExp.etiqueta}
                        </span>
                      </td>
                      <td>
                        <strong>Bs. {Number(med.precio).toFixed(2)}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{med.stock}</strong> und.
                        </div>
                        <span className={infoStock.claseBadge}>
                          {infoStock.etiqueta}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <Link
                            to={`/medicamento/${med.id}`}
                            className="student-name"
                          >
                            Ver detalle
                          </Link>
                          <Link
                            to={`/editar-medicamento/${med.id}`}
                            className="btn btn-light btn-sm"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              eliminarMedicamento(med.id, med.nombre)
                            }
                          >
                            Eliminar
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
