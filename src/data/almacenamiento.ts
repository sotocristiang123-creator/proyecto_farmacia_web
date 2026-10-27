import datosMedicamentos from "./medicamentos.json";
import datosMovimientos from "./movimientosInventario.json";
import datosVentas from "./ventas.json";
import type {
  Medicamento,
  MovimientoInventario,
  Venta,
} from "../types/farmacia";

const CLAVE_MEDICAMENTOS = "farmagest_medicamentos_v3";
const CLAVE_VENTAS = "farmagest_ventas_v3";
const CLAVE_MOVIMIENTOS = "farmagest_movimientos_v3";

export const LISTA_INICIAL_MEDICAMENTOS = datosMedicamentos as Medicamento[];
export const LISTA_INICIAL_VENTAS = datosVentas as Venta[];
export const LISTA_INICIAL_MOVIMIENTOS =
  datosMovimientos as MovimientoInventario[];

export const obtenerMedicamentos = (): Medicamento[] => {
  const guardado = localStorage.getItem(CLAVE_MEDICAMENTOS);
  if (!guardado) {
    localStorage.setItem(
      CLAVE_MEDICAMENTOS,
      JSON.stringify(LISTA_INICIAL_MEDICAMENTOS),
    );
    return LISTA_INICIAL_MEDICAMENTOS;
  }
  return JSON.parse(guardado);
};

export const guardarMedicamentos = (medicamentos: Medicamento[]): void => {
  localStorage.setItem(CLAVE_MEDICAMENTOS, JSON.stringify(medicamentos));
};

export const obtenerVentas = (): Venta[] => {
  const guardado = localStorage.getItem(CLAVE_VENTAS);
  if (!guardado) {
    localStorage.setItem(CLAVE_VENTAS, JSON.stringify(LISTA_INICIAL_VENTAS));
    return LISTA_INICIAL_VENTAS;
  }
  return JSON.parse(guardado);
};

export const guardarVentas = (ventas: Venta[]): void => {
  localStorage.setItem(CLAVE_VENTAS, JSON.stringify(ventas));
};

export const obtenerMovimientos = (): MovimientoInventario[] => {
  const guardado = localStorage.getItem(CLAVE_MOVIMIENTOS);
  if (!guardado) {
    localStorage.setItem(
      CLAVE_MOVIMIENTOS,
      JSON.stringify(LISTA_INICIAL_MOVIMIENTOS),
    );
    return LISTA_INICIAL_MOVIMIENTOS;
  }
  return JSON.parse(guardado);
};

export const guardarMovimientos = (
  movimientos: MovimientoInventario[],
): void => {
  localStorage.setItem(CLAVE_MOVIMIENTOS, JSON.stringify(movimientos));
};

export const calcularDiasVencimiento = (fechaVencimiento: string): number => {
  if (!fechaVencimiento) return 999;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(`${fechaVencimiento}T00:00:00`);
  const diferencia = fecha.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

export const evaluarVencimiento = (fechaVencimiento: string) => {
  const dias = calcularDiasVencimiento(fechaVencimiento);
  if (dias < 0) {
    return {
      etiqueta: "Vencido",
      claseBadge: "badge badge-out",
      dias,
      esAlerta: true,
    };
  }
  if (dias <= 90) {
    return {
      etiqueta: `Próximo a vencer (${dias} d)`,
      claseBadge: "badge badge-warning",
      dias,
      esAlerta: true,
    };
  }
  return {
    etiqueta: "Vigente",
    claseBadge: "badge badge-active",
    dias,
    esAlerta: false,
  };
};

export const evaluarStock = (stock: number, stockMinimo: number) => {
  const actual = Number(stock || 0);
  const minimo = Number(stockMinimo || 10);
  if (actual <= 0) {
    return {
      etiqueta: "Agotado",
      claseBadge: "badge badge-out",
      esBajo: true,
    };
  }
  if (actual <= minimo) {
    return {
      etiqueta: "Stock reducido",
      claseBadge: "badge badge-warning",
      esBajo: true,
    };
  }
  return {
    etiqueta: "Disponible",
    claseBadge: "badge badge-active",
    esBajo: false,
  };
};
