class MetodoPago {
  procesarPago(cantidad) {
    throw new Error("Este método debe ser implementado por subclases");
  }
}

class PagoEfectivo extends MetodoPago {
  procesarPago(cantidad) {
    console.log(`Procesando pago en efectivo de $${cantidad}`);
    return cantidad; // No hay comisión ni descuento
  }
}

class PagoTarjeta extends MetodoPago {
  procesarPago(cantidad) {
    const comision = cantidad * 0.02; // 2% de comisión
    const total = cantidad + comision;
    console.log(`Procesando pago con tarjeta de $${total} (incluye 2% de comisión)`);
    return total;
  }
}

class PagoAppMovil extends MetodoPago {
  procesarPago(cantidad) {
    const descuento = cantidad * 0.20; // 20% de descuento
    const total = cantidad - descuento;
    console.log(`Procesando pago con aplicación móvil de $${total} (incluye 20% de descuento)`);
    return total;
  }
}

module.exports = { MetodoPago, PagoEfectivo, PagoTarjeta, PagoAppMovil };