class VehiculoState {
  estacionar(vehiculo) {
    throw new Error("Este método debe ser implementado por subclases");
  }

  mover(vehiculo) {
    throw new Error("Este método debe ser implementado por subclases");
  }

  pagar(vehiculo) {
    throw new Error("Este método debe ser implementado por subclases");
  }

  getEstado() {
    throw new Error("Este método debe ser implementado por subclases");
  }
}

class EstacionadoState extends VehiculoState {
  estacionar(vehiculo) {
    console.log("El vehículo ya está estacionado.");
  }

  mover(vehiculo) {
    console.log("Moviendo el vehículo...");
    vehiculo.setState(new EnMovimientoState());
  }

  pagar(vehiculo) {
    console.log("Pagando el estacionamiento...");
    vehiculo.setState(new PagadoState());
  }

  getEstado() {
    return "Estacionado";
  }
}

class EnMovimientoState extends VehiculoState {
  estacionar(vehiculo) {
    console.log("Estacionando el vehículo...");
    vehiculo.setState(new EstacionadoState());
  }

  mover(vehiculo) {
    console.log("El vehículo ya está en movimiento.");
  }

  pagar(vehiculo) {
    console.log("No se puede pagar mientras el vehículo está en movimiento.");
  }

  getEstado() {
    return "En Movimiento";
  }
}

class PagadoState extends VehiculoState {
  estacionar(vehiculo) {
    console.log("No se puede estacionar después de pagar.");
  }

  mover(vehiculo) {
    console.log("No se puede mover después de pagar.");
  }

  pagar(vehiculo) {
    console.log("El vehículo ya está pagado.");
  }

  getEstado() {
    return "Pagado";
  }
}

module.exports = { VehiculoState, EstacionadoState, EnMovimientoState, PagadoState };