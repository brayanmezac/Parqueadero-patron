const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('parqueadero.db');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear tabla si no existe
db.run("CREATE TABLE IF NOT EXISTS parqueos (id INTEGER PRIMARY KEY AUTOINCREMENT, placa TEXT, tipo TEXT, horaEntrada TEXT, horaSalida TEXT)");

// Factory Method
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

// Clases de vehículos
class Vehiculo {
  constructor(placa, tarifa) {
    this.placa = placa;
    this.horaEntrada = new Date().toISOString();
    this.tarifa = tarifa;  // Precio por hora
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

const vehiculoFactory = new VehiculoFactory();

app.post('/registrar-entrada', (req, res) => {
  const { placa, tipo } = req.body;

  try {
    const vehiculo = vehiculoFactory.createVehiculo(tipo, placa);
    db.run(`INSERT INTO parqueos (placa, tipo, horaEntrada) VALUES (?, ?, ?)`,
      [vehiculo.placa, tipo, vehiculo.horaEntrada], function(err) {
      if (err) {
        return res.status(500).send("Error al registrar la entrada.");
      }
      res.send("Entrada registrada correctamente.");
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Ruta para obtener la lista de vehículos
app.get('/parqueos', (req, res) => {
  db.all("SELECT * FROM parqueos WHERE horaSalida IS NULL", [], (err, rows) => {
    if (err) {
      return res.status(500).send("Error al obtener los vehículos.");
    }
    res.json(rows);  // Devolver los vehículos en formato JSON
  });
});

app.post('/pagar', (req, res) => {
  const { id } = req.body;

  db.get("SELECT * FROM parqueos WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Vehículo no encontrado.");
    }

    const horaEntrada = new Date(row.horaEntrada);
    const horaSalida = new Date();
    const horasEstacionado = Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60));  // Calcula horas
    
    try {
      const vehiculo = vehiculoFactory.createVehiculo(row.tipo, row.placa);
      const pago = vehiculo.calcularPago(horasEstacionado);

      db.run("UPDATE parqueos SET horaSalida = ? WHERE id = ?", [horaSalida.toISOString(), id], (err) => {
        if (err) {
          return res.status(500).send("Error al registrar el pago.");
        }
        res.json({ mensaje: "Pago realizado", total: pago });
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});