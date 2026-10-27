import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { PiePagina } from "../components/PiePagina";
import {
  guardarMedicamentos,
  obtenerMedicamentos,
} from "../data/almacenamiento";
import type { Medicamento } from "../types/farmacia";

export const RegistroMedicamento = () => {
  const { id } = useParams();
  const navegar = useNavigate();
  const esEdicion = Boolean(id);
  const [mensajeGuardado, setMensajeGuardado] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Medicamento>({
    defaultValues: {
      condicionVenta: "Venta libre",
      stockMinimo: 10,
    },
  });

  useEffect(() => {
    if (id) {
      const medicamentos = obtenerMedicamentos();
      const encontrado = medicamentos.find((item) => item.id === id);
      if (encontrado) {
        reset(encontrado);
      }
    }
  }, [id, reset]);

  const enviarFormulario = (datos: Medicamento) => {
    const listaActual = obtenerMedicamentos();

    if (esEdicion && id) {
      const actualizada = listaActual.map((item) =>
        item.id === id ? { ...datos, id } : item,
      );
      guardarMedicamentos(actualizada);
      setMensajeGuardado(
        `El medicamento "${datos.nombre}" fue actualizado correctamente.`,
      );
      setTimeout(() => navegar(`/medicamento/${id}`), 800);
      return;
    }

    const nuevoMedicamento: Medicamento = {
      ...datos,
      id: uuidv4(),
    };

    guardarMedicamentos([...listaActual, nuevoMedicamento]);
    setMensajeGuardado(
      `El medicamento "${datos.nombre}" se registró en el catálogo.`,
    );

    reset({
      nombre: "",
      principioActivo: "",
      categoria: "",
      presentacion: "",
      laboratorio: "",
      lote: "",
      fechaVencimiento: "",
      condicionVenta: "Venta libre",
      precio: undefined,
      stock: undefined,
      stockMinimo: 10,
      descripcion: "",
    });
  };

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">Catálogo Farmacéutico</span>
          <h1>
            {esEdicion ? "Actualizar medicamento" : "Registrar medicamento"}
          </h1>
          <p>
            Completa la ficha técnica para incorporar o actualizar un
            medicamento en el inventario.
          </p>
        </div>
        <Link to="/medicamentos" className="btn btn-light">
          Ver catálogo
        </Link>
      </header>

      <section className="panel">
        <h2>Información farmacológica del medicamento</h2>

        {mensajeGuardado && (
          <div className="alert-success">{mensajeGuardado}</div>
        )}

        <form onSubmit={handleSubmit(enviarFormulario)}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre comercial del medicamento</label>
              <input
                id="nombre"
                placeholder="Ej. Paracetamol 500 mg"
                {...register("nombre", {
                  required: "El nombre del medicamento es obligatorio",
                  minLength: {
                    value: 2,
                    message: "Mínimo 2 caracteres",
                  },
                })}
              />
              <p className="form-help">{errors.nombre?.message?.toString()}</p>
            </div>

            <div className="form-group">
              <label htmlFor="principioActivo">
                Principio activo y concentración
              </label>
              <input
                id="principioActivo"
                placeholder="Ej. Acetaminofén 500 mg"
                {...register("principioActivo", {
                  required: "El principio activo es obligatorio",
                })}
              />
              <p className="form-help">
                {errors.principioActivo?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría terapéutica</label>
              <select
                id="categoria"
                defaultValue=""
                {...register("categoria", {
                  required: "La categoría terapéutica es obligatoria",
                })}
              >
                <option value="" disabled>
                  Seleccione una categoría
                </option>
                <option value="Analgésicos">Analgésicos</option>
                <option value="Antibióticos">Antibióticos</option>
                <option value="Antiinflamatorios">Antiinflamatorios</option>
                <option value="Antihistamínicos">Antihistamínicos</option>
                <option value="Gastrointestinales">Gastrointestinales</option>
                <option value="Respiratorios">Respiratorios</option>
                <option value="Vitaminas y Suplementos">
                  Vitaminas y Suplementos
                </option>
                <option value="Dermatológicos">Dermatológicos</option>
              </select>
              <p className="form-help">
                {errors.categoria?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="presentacion">
                Presentación / Forma farmacéutica
              </label>
              <input
                id="presentacion"
                placeholder="Ej. Caja x 20 comprimidos"
                {...register("presentacion", {
                  required: "La presentación es obligatoria",
                })}
              />
              <p className="form-help">
                {errors.presentacion?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="laboratorio">Laboratorio fabricante</label>
              <input
                id="laboratorio"
                placeholder="Ej. INTI S.A., Laboratorios Bagó, COFAR"
                {...register("laboratorio", {
                  required: "El laboratorio es obligatorio",
                })}
              />
              <p className="form-help">
                {errors.laboratorio?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="condicionVenta">Condición de venta</label>
              <select
                id="condicionVenta"
                {...register("condicionVenta", {
                  required: "Seleccione la condición de venta",
                })}
              >
                <option value="Venta libre">Venta libre</option>
                <option value="Bajo receta médica">Bajo receta médica</option>
              </select>
              <p className="form-help">
                {errors.condicionVenta?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="lote">Código de lote</label>
              <input
                id="lote"
                placeholder="Ej. LT-2026-104"
                {...register("lote", {
                  required: "El número de lote es obligatorio",
                })}
              />
              <p className="form-help">{errors.lote?.message?.toString()}</p>
            </div>

            <div className="form-group">
              <label htmlFor="fechaVencimiento">Fecha de vencimiento</label>
              <input
                id="fechaVencimiento"
                type="date"
                {...register("fechaVencimiento", {
                  required: "La fecha de vencimiento es obligatoria",
                })}
              />
              <p className="form-help">
                {errors.fechaVencimiento?.message?.toString()}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio unitario (Bs.)</label>
              <input
                id="precio"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("precio", {
                  required: "El precio es obligatorio",
                  valueAsNumber: true,
                  validate: (valor) =>
                    (!Number.isNaN(valor) && valor > 0) ||
                    "El precio debe ser mayor que cero",
                })}
              />
              <p className="form-help">{errors.precio?.message?.toString()}</p>
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock disponible (unidades)</label>
              <input
                id="stock"
                type="number"
                placeholder="0"
                {...register("stock", {
                  required: "El stock es obligatorio",
                  valueAsNumber: true,
                  validate: (valor) =>
                    (!Number.isNaN(valor) && valor >= 0) ||
                    "El stock no puede ser negativo",
                })}
              />
              <p className="form-help">{errors.stock?.message?.toString()}</p>
            </div>

            <div className="form-group">
              <label htmlFor="stockMinimo">
                Stock mínimo de alerta (unidades)
              </label>
              <input
                id="stockMinimo"
                type="number"
                placeholder="10"
                {...register("stockMinimo", {
                  required: "El stock mínimo es obligatorio",
                  valueAsNumber: true,
                  validate: (valor) =>
                    (!Number.isNaN(valor) && valor >= 1) ||
                    "El stock mínimo debe ser al menos 1",
                })}
              />
              <p className="form-help">
                {errors.stockMinimo?.message?.toString()}
              </p>
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="descripcion">
                Descripción e indicaciones terapéuticas
              </label>
              <textarea
                id="descripcion"
                placeholder="Describe las indicaciones terapéuticas y recomendaciones de administración..."
                {...register("descripcion", {
                  required: "La descripción es obligatoria",
                })}
              />
              <p className="form-help">
                {errors.descripcion?.message?.toString()}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/medicamentos" className="btn btn-light">
              Cancelar
            </Link>
            <button type="submit" className="btn">
              {esEdicion ? "Guardar cambios" : "Registrar medicamento"}
            </button>
          </div>
        </form>
      </section>

      <PiePagina />
    </main>
  );
};
