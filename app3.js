const { PagadoState } = require('./patterns/state/vehiculoState');
const VehiculoFactory = require('./patterns/factory/vehiculoFactory');
const { PagoEfectivo, PagoTarjeta, PagoAppMovil } = require('./patterns/bridge/metodoPago');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('parqueadero.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS parqueos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        placa TEXT, 
        tipo TEXT, 
        horaEntrada TEXT, 
        horaSalida TEXT,
        descuento TEXT,
        total INTEGER
)`);

// Ruta para registrar la entrada de vehículos
app.post('/registrar-entrada', (req, res) => {
    const { placa, tipo, descuento } = req.body;
    console.log('Datos recibidos:', { placa, tipo, descuento });

    const tarifaPorHora = tipo === 'auto' ? 5000 : tipo === 'moto' ? 2000 : tipo === 'camioneta' ? 7000 : 0;
    if (tarifaPorHora === 0) {
        return res.status(400).send("Tipo de vehículo no válido.");
    }

    db.run(`INSERT INTO parqueos (placa, tipo, horaEntrada, descuento) VALUES (?, ?, ?, ?)`,
        [placa, tipo, new Date().toISOString(), descuento], function(err) {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.status(500).send("Error al registrar la entrada: " + err.message);
        }
        console.log('Entrada registrada con éxito');
        res.status(200).send("Entrada registrada exitosamente.");
    });
});

// Ruta para obtener los valores calculados
app.get('/calcular-valores/:id', (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM parqueos WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).send("Error al buscar el registro.");
        }
        if (!row) {
            return res.status(404).send("Registro no encontrado.");
        }

        const horaEntrada = new Date(row.horaEntrada);
        const horaSalida = new Date();
        const horasEstacionado = Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60));  // Calcula horas

        const tarifaPorHora = row.tipo === 'auto' ? 5000 : row.tipo === 'moto' ? 2000 : row.tipo === 'camioneta' ? 7000 : 0;
        let subtotal = tarifaPorHora * horasEstacionado;
        let total = subtotal;

        if (row.descuento === 'gym') {
            total = subtotal * 0.8;  // 20% de descuento
        } else if (row.descuento === 'hospital') {
            total = subtotal * 0.65;  // 35% de descuento
        }

        res.json({
            horasEstacionado,
            tarifaPorHora,
            subtotal,
            total
        });
    });
});

// Ruta para listar los vehículos estacionados
app.get('/parqueos', (req, res) => {
    db.all("SELECT * FROM parqueos", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error al obtener los vehículos.");
        }

        // Añadir el estado a cada vehículo
        rows.forEach(row => {
            const vehiculo = VehiculoFactory.createVehiculo(row.tipo, row.placa);
            if (row.horaSalida) {
                vehiculo.setState(new PagadoState());
            }
            row.estado = vehiculo.getEstado();
        });

        res.json(rows);
    });
});

// Ruta para registrar la salida de vehículos y calcular el pago
app.post('/pagar', (req, res) => {
    const { id, metodoPago } = req.body;

    // Validación de entrada
    if (!id || !metodoPago) {
        console.error('Datos incompletos:', { id, metodoPago });
        return res.status(400).json({ error: "Datos incompletos" });
    }

    db.get("SELECT * FROM parqueos WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error al buscar el registro." });
        }
        if (!row) {
            return res.status(404).json({ error: "Registro no encontrado." });
        }

        const horaEntrada = new Date(row.horaEntrada);
        const horaSalida = new Date();
        const horasEstacionado = Math.ceil((horaSalida - horaEntrada) / (1000 * 60 * 60));  // Calcula horas

        const tarifaPorHora = row.tipo === 'auto' ? 5000 : row.tipo === 'moto' ? 2000 : row.tipo === 'camioneta' ? 7000 : 0;
        let subtotal = tarifaPorHora * horasEstacionado;
        let total = subtotal;

        if (row.descuento === 'gym') {
            total = subtotal * 0.8;  // 20% de descuento
        } else if (row.descuento === 'hospital') {
            total = subtotal * 0.65;  // 35% de descuento
        }

        // Crear el vehículo y actualizar su estado a "Pagado"
        let metodoPagoObj;
        switch (metodoPago) {
            case 'efectivo':
                metodoPagoObj = new PagoEfectivo();
                break;
            case 'tarjeta':
                metodoPagoObj = new PagoTarjeta();
                break;
            case 'appMovil':
                metodoPagoObj = new PagoAppMovil();
                break;
            default:
                return res.status(400).json({ error: "Método de pago no válido." });
        }

        const vehiculo = VehiculoFactory.createVehiculo(row.tipo, row.placa, metodoPagoObj);
        vehiculo.horasEstacionado = horasEstacionado;
        vehiculo.setState(new PagadoState());

        // Procesar el pago con el método de pago seleccionado
        total = vehiculo.metodoPago.procesarPago(total);
        console.log('horaSalida:', horaSalida.toISOString());
        console.log('total:', total);
        console.log('id:', id);
        db.run("UPDATE parqueos SET horaSalida = ?, total = ? WHERE id = ?", [horaSalida.toISOString(), total, id], (err) => {
            if (err) {
                return res.status(500).json({ error: "Error al registrar el pago." });
            }
            
            const informe = {
                vehiculo: {
                    tipo: row.tipo,
                    placa: row.placa
                },
                horasEstacionado,
                tarifaPorHora,
                subtotal,
                tipoDescuento: row.descuento,
                total,
                estado: vehiculo.getEstado()
            };

            res.json({ mensaje: "Pago realizado", informe });
        });
    });
});

app.listen(3001, () => {
    console.log('Servidor escuchando en el puerto 3000');
});