class InformeBuilder {
  constructor() {
    this.informe = {};
  }

  setVehiculo(vehiculo) {
    this.informe.vehiculo = {
      tipo: vehiculo.constructor.name,
      placa: vehiculo.placa
    };
    return this;
  }

  setHorasEstacionado(horas) {
    this.informe.horasEstacionado = horas;
    return this;
  }

  setTarifaPorHora(tarifa) {
    this.informe.tarifaPorHora = tarifa;
    return this;
  }

  setSubtotal(subtotal) {
    this.informe.subtotal = subtotal;
    return this;
  }

  setTipoDescuento(descuento) {
    this.informe.tipoDescuento = descuento;
    return this;
  }

  setTotal(total) {
    this.informe.total = total;
    return this;
  }

  build() {
    return this.informe;
  }
}

module.exports = InformeBuilder;