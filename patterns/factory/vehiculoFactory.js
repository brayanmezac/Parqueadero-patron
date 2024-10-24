class Vehiculo {
  constructor(placa, tarifa) {
    this.placa = placa;
    this.tarifa = tarifa;
    this.horaEntrada = new Date().toISOString();
  }

  calcularPago(horas) {
    return horas * this.tarifa;
  }
}

class Auto extends Vehiculo {
  constructor(placa) {
    super(placa, 5000);  // Auto paga 5000 por hora
  }
}

class Moto extends Vehiculo {
  constructor(placa) {
    super(placa, 2000);  // Moto paga 2000 por hora
  }
}

class Camioneta extends Vehiculo {
  constructor(placa) {
    super(placa, 7000);  // Camioneta paga 7000 por hora
  }
}

class VehiculoFactory {
  createVehiculo(tipo, placa) {
    switch (tipo) {
      case 'auto':
        return new Auto(placa);
      case 'moto':
        return new Moto(placa);
      case 'camioneta':
        return new Camioneta(placa);
      default:
        throw new Error("Tipo de vehículo no válido.");
    }
  }
}

module.exports = new VehiculoFactory();