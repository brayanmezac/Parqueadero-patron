class VehiculoDecorator {
  constructor(vehiculo) {
    this.vehiculo = vehiculo;
  }

  calcularPago(horas) {
    return this.vehiculo.calcularPago(horas);
  }
}

class GymDescuentoDecorator extends VehiculoDecorator {
  constructor(vehiculo) {
    super(vehiculo);
    this.descuento = 0.2; // 20% de descuento
  }

  calcularPago(horas) {
    const pagoOriginal = super.calcularPago(horas);
    return pagoOriginal - (pagoOriginal * this.descuento);
  }
}

class HospitalDescuentoDecorator extends VehiculoDecorator {
  constructor(vehiculo) {
    super(vehiculo);
    this.descuento = 0.35; // 35% de descuento
  }

  calcularPago(horas) {
    const pagoOriginal = super.calcularPago(horas);
    return pagoOriginal - (pagoOriginal * this.descuento);
  }
}

module.exports = { VehiculoDecorator, GymDescuentoDecorator, HospitalDescuentoDecorator };