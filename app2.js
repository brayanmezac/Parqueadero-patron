const express = require('express');
const path = require('path');
const VehiculoFactory = require('./patterns/factory/vehiculoFactory');
const { GymDescuentoDecorator, HospitalDescuentoDecorator } = require('./patterns/decorator/vehiculoDecorator');
const InformeBuilder = require('./patterns/builder/informeBuilder');
const dbInstance = require('./patterns/singleton/dbSingleton').getInstance();

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear tabla si no existe
dbInstance.run(`CREATE TABLE IF NOT EXISTS parqueos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    placa TEXT, 
    tipo TEXT, 
    horaEntrada TEXT, 
    horaSalida TEXT,
    descuento TEXT
)`);

// Ruta para registrar la entrada de vehículos
app.post('/registrar-entrada', (req, res) => {
  const { placa, tipo, descuento } = req.body;
  console.log('Datos recibidos:', { placa, tipo, descuento });

  try {
    const vehiculo = VehiculoFactory.createVehiculo(tipo, placa);
    console.log('Vehículo creado:', vehiculo);

    dbInstance.run(`INSERT INTO parqueos (placa, tipo, horaEntrada, descuento) VALUES (?, ?, ?, ?)`,
      [vehiculo.placa, tipo, new Date().toISOString(), descuento], function(err) {
      if (err) {
        console.error('Error al insertar en la base de datos:', err);
        return res.status(500).send("Error al registrar la entrada: " + err.message);
      }
      console.log('Entrada registrada con éxito');
      res.status(200).send("Entrada registrada exitosamente.");
    });
  } catch (error) {
    console.error('Error al crear el vehículo:', error);
    res.status(400).send("Error al registrar la entrada: " + error.message);
  }
});

// Ruta para obtener los valores calculados
app.get('/calcular-valores/:id', (req, res) => {
  const { id } = req.params;

  dbInstance.get("SELECT * FROM parqueos WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).send("Error al buscar el registro.");
    }
    if (!row) {
      return res.status(404).send("Registro no encontrado.");
    }

    const horaEntrada = new Date(row.horaEntrada);
    const horaSalida = new Date();
    const horasEstacionado = Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60));  // Calcula horas

    try {
      let vehiculo = VehiculoFactory.createVehiculo(row.tipo, row.placa);
      const tarifaPorHora = vehiculo.tarifa;  // Tarifa por hora sin descuento

      if (row.descuento === 'gym') {
        vehiculo = new GymDescuentoDecorator(vehiculo);
      } else if (row.descuento === 'hospital') {
        vehiculo = new HospitalDescuentoDecorator(vehiculo);
      }

      const subtotal = tarifaPorHora * horasEstacionado;
      const total = vehiculo.calcularPago(horasEstacionado);

      res.json({
        horasEstacionado,
        tarifaPorHora,
        subtotal,
        total
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
});

// Ruta para listar los vehículos estacionados
app.get('/parqueos', (req, res) => {
  dbInstance.all("SELECT * FROM parqueos WHERE horaSalida IS NULL", [], (err, rows) => {
    if (err) {
      return res.status(500).send("Error al obtener los vehículos.");
    }
    res.json(rows);
  });
});

// Ruta para registrar la salida de vehículos y calcular el pago
app.post('/pagar', (req, res) => {
  const { id } = req.body;

  dbInstance.get("SELECT * FROM parqueos WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).send("Error al buscar el registro.");
    }
    if (!row) {
      return res.status(404).send("Registro no encontrado.");
    }

    const horaEntrada = new Date(row.horaEntrada);
    const horaSalida = new Date();
    const horasEstacionado = Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60));  // Calcula horas

    try {
      let vehiculo = VehiculoFactory.createVehiculo(row.tipo, row.placa);
      console.log('Vehículo antes del descuento:', vehiculo);
      const tarifaPorHora = vehiculo.calcularPago(1);  // Tarifa por hora sin descuento

      if (row.descuento === 'gym') {
        vehiculo = new GymDescuentoDecorator(vehiculo);
      } else if (row.descuento === 'hospital') {
        vehiculo = new HospitalDescuentoDecorator(vehiculo);
      }
      console.log('Vehículo después del descuento:', vehiculo);

      const subtotal = tarifaPorHora * horasEstacionado;
      const total = vehiculo.calcularPago(horasEstacionado);

      dbInstance.run("UPDATE parqueos SET horaSalida = ? WHERE id = ?", [horaSalida.toISOString(), id], (err) => {
        if (err) {
          return res.status(500).send("Error al registrar el pago.");
        }

        const informeBuilder = new InformeBuilder();
        const informe = informeBuilder
          .setVehiculo(vehiculo)
          .setHorasEstacionado(horasEstacionado)
          .setTarifaPorHora(tarifaPorHora)
          .setSubtotal(subtotal)
          .setTipoDescuento(row.descuento)
          .setTotal(total)
          .build();

        res.json({ mensaje: "Pago realizado", informe });
      });
    } catch (error) {
      res.status(400).send(error.message);
    } 
  });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});