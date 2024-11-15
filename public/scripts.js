// Función para cargar los parqueos
function cargarParqueos() {
    fetch('/parqueos')
        .then(response => response.json())
        .then(data => {
            const listaParqueos = document.getElementById('listaEstacionados');
            const listaHistorial = document.getElementById('listaHistorial');
            listaParqueos.innerHTML = '';
            listaHistorial.innerHTML = '';

            data.forEach(parqueo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${parqueo.placa}</td>
                    <td>${parqueo.tipo}</td>
                    <td>${new Date(parqueo.horaEntrada).toLocaleString()}</td>
                    <td>${getDescuentoEmoji(parqueo.descuento)}</td>
                    <td id="horas-${parqueo.id}">Calculando...</td>
                    <td>${getDescuentoPorcentaje(parqueo.descuento)}</td>
                    <td id="total-${parqueo.id}">Calculando...</td>
                    <td id="estado-${parqueo.id}">${parqueo.estado || 'Estacionado'}</td>
                `;
                if (parqueo.estado === 'Estacionado') {
                    row.innerHTML += `<td><button class="btn btn-sm btn-primary" onclick="registrarSalida(${parqueo.id})">Pagar</button></td>`;
                    listaEstacionados.appendChild(row);
                } else {
                    listaHistorial.appendChild(row);
                }

                // Obtener y mostrar los valores calculados
                fetch(`/calcular-valores/${parqueo.id}`)
                    .then(response => response.json())
                    .then(valores => {
                        document.getElementById(`horas-${parqueo.id}`).innerText = valores.horasEstacionado;
                        document.getElementById(`total-${parqueo.id}`).innerText = `$${valores.total.toFixed(2)}`;
                    })
                    .catch(error => console.error('Error al calcular valores:', error));
            });
        })
        .catch(error => console.error('Error:', error));
}

// Función para obtener el emoji del descuento
function getDescuentoEmoji(descuento) {
    switch (descuento) {
        case 'gym':
            return '🏋️ Gimnasio';
        case 'hospital':
            return '🏥 Hospital';
        default:
            return '❌ Ninguno';
    }
}

// Función para obtener el porcentaje de descuento
function getDescuentoPorcentaje(descuento) {
    switch (descuento) {
        case 'gym':
            return '20%';
        case 'hospital':
            return '35%';
        default:
            return '0%';
    }
}

// Evento para registrar la entrada de un vehículo
document.getElementById('registroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const placa = document.getElementById('placa').value;
    const tipo = document.querySelector('input[name="tipoVehiculo"]:checked').value;
    const descuento = document.getElementById('descuento').value;

    fetch('/registrar-entrada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placa, tipo, descuento }),
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        cargarParqueos();
        document.getElementById('registroForm').reset();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Función para registrar la salida de un vehículo
function registrarSalida(id) {
    fetch('/pagar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.mensaje);
        document.getElementById(`estado-${id}`).innerText = data.informe.estado;
        document.getElementById(`horas-${id}`).innerText = data.informe.horasEstacionado;
        document.getElementById(`total-${id}`).innerText = `$${data.informe.total.toFixed(2)}`;
        cargarParqueos();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Función para mostrar el informe de pago
function mostrarInformePago(data) {
    const modalBody = document.getElementById('informePagoContent');
    const descuentoAplicado = data.informe.subtotal - data.informe.total;
    modalBody.innerHTML = `
        <p><strong>Vehículo:</strong> ${data.informe.vehiculo.tipo} (${data.informe.vehiculo.placa})</p>
        <p><strong>Horas estacionado:</strong> ${data.informe.horasEstacionado}</p>
        <p><strong>Tarifa por hora:</strong> $${data.informe.tarifaPorHora.toFixed(2)}</p>
        <p><strong>Subtotal:</strong> $${data.informe.subtotal.toFixed(2)}</p>
        <p><strong>Tipo de descuento:</strong> ${getDescuentoEmoji(data.informe.tipoDescuento)}</p>
        <p><strong>Descuento aplicado:</strong> ${getDescuentoPorcentaje(data.informe.tipoDescuento)} (- $${descuentoAplicado.toFixed(2)})</p>
        <p><strong>Total a pagar:</strong> $${data.informe.total.toFixed(2)}</p>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('informePagoModal'));
    modal.show();
}

// Cargar parqueos al iniciar la página
cargarParqueos();