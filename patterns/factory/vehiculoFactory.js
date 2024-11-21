const { EstacionadoState } = require('../state/vehiculoState');
const { MetodoPago } = require('../bridge/metodoPago');

class Vehiculo {
  constructor(placa, tarifa, metodoPago) {
    this.placa = placa;
    this.tarifa = tarifa;
    this.horaEntrada = new Date().toISOString();
    this.state = new EstacionadoState(); // Estado inicial
    this.metodoPago = metodoPago; // Método de pago
    this.horasEstacionado = 0; // Inicializar horas estacionado
  }

  setState(state) {
    this.state = state;
  }

  estacionar() {
    this.state.estacionar(this);
  }

  mover() {
    this.state.mover(this);
  }

  pagar() {
    this.state.pagar(this);
  }

  getEstado() {
    return this.state.getEstado();
  }

  calcularPago(horas) {
    return horas * this.tarifa;
  }
}

class Auto extends Vehiculo {
  constructor(placa, metodoPago) {
    super(placa, 5000, metodoPago);  // Auto paga 5000 por hora
  }
}

class Moto extends Vehiculo {
  constructor(placa, metodoPago) {
    super(placa, 2000, metodoPago);  // Moto paga 2000 por hora
  }
}

class Camioneta extends Vehiculo {
  constructor(placa, metodoPago) {
    super(placa, 7000, metodoPago);  // Camioneta paga 7000 por hora
  }
}

class VehiculoFactory {
  createVehiculo(tipo, placa, metodoPago) {
    switch (tipo) {
      case 'auto':
        return new Auto(placa, metodoPago);
      case 'moto':
        return new Moto(placa, metodoPago);
      case 'camioneta':
        return new Camioneta(placa, metodoPago);
      default:
        throw new Error("Tipo de vehículo no válido.");
    }
  }
}

module.exports = new VehiculoFactory();