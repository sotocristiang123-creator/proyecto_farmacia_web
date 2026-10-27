export type Medicamento = {
  id: string;
  nombre: string;
  principioActivo: string;
  categoria: string;
  presentacion: string;
  laboratorio: string;
  lote: string;
  fechaVencimiento: string;
  condicionVenta: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  descripcion: string;
};

export type DetalleItemVenta = {
  medicamentoId: string;
  nombreMedicamento: string;
  presentacion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type Venta = {
  id: string;
  fecha: string;
  nombreCliente: string;
  documentoCliente: string;
  metodoPago: string;
  items: DetalleItemVenta[];
  total: number;
};

export type MovimientoInventario = {
  id: string;
  fecha: string;
  medicamentoId: string;
  nombreMedicamento: string;
  tipo: "Ingreso" | "Salida por venta" | "Ajuste";
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  lote: string;
  observacion: string;
};
