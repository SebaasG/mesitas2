document.querySelectorAll('.parcel-point').forEach(point => {
    point.addEventListener('click', async () => {
        const numero = point.getAttribute('data-parcel');
        const numeroParcela = 'P' + numero.padStart(3, '0'); // Ej: "P001"
        const token = localStorage.getItem('token');

        if (!token) {
            alert('No estás autenticado. Inicia sesión para continuar.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/facturas/parcela/${numeroParcela}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text}`);
            }

            const facturas = await response.json();
            mostrarFacturasEnModal(facturas);

        } catch (error) {
            console.error('Error al obtener las facturas:', error);
            alert('No se pudieron cargar las facturas: ' + error.message);
        }
    });
});

function mostrarFacturasEnModal(facturas) {
    const modal = document.getElementById('facturasModal');
    const contenedor = document.getElementById('facturasContainer');
    contenedor.innerHTML = '';

    if (!facturas.length) {
        contenedor.innerHTML = '<p>No hay facturas para esta parcela.</p>';
    } else {
        facturas.forEach(f => {
            const facturaEl = document.createElement('div');
            facturaEl.classList.add('factura-item');
            facturaEl.innerHTML = `
                <h6>Factura ID: ${f.id}</h6>
                <p><strong>Tipo:</strong> ${f.tipo_factura}</p>
                <p><strong>Usuario:</strong> ${f.nombre} ${f.apellido}</p>
                <p><strong>Fecha emisión:</strong> ${f.fecha_emision}</p>
                <p><strong>Total:</strong> $${f.total}</p>
                ${f.archivo_pdf ? `<a href="file://${f.archivo_pdf}" target="_blank">Ver PDF</a>` : '<em>Sin archivo</em>'}
                <hr>
            `;
            contenedor.appendChild(facturaEl);
        });
    }

    // Mostrar modal sin Bootstrap
    modal.classList.remove('fade');
    modal.style.display = 'block';

    // Cerrar con botón
    const closeButton = modal.querySelector('.btn-close');
    if (closeButton) {
        closeButton.onclick = () => {
            modal.style.display = 'none';
        };
    }

    // Cerrar clic fuera del modal
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    obtenerHistorial();
});

async function obtenerHistorial() {
    try {
        const response = await fetch('http://localhost:3000/api/historial/historial', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        console.log('Historial recibido:', data);

        const historialList = document.getElementById('historial-list');
        historialList.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            historialList.innerHTML = '<p>No hay actividad reciente.</p>';
            return;
        }

        // Renderizar historial
        data.forEach(item => {
            const entry = document.createElement('div');
            entry.className = 'historial-item';

            entry.innerHTML = `
                <p><strong>Usuario ID ${item.usuario_id}</strong> realizó <em>${item.accion}</em></p>
                <small>${new Date(item.fecha).toLocaleString()}</small>
                <hr/>
            `;

            historialList.appendChild(entry);
        });

    } catch (error) {
        console.error('Error al obtener historial:', error);
        document.getElementById('historial-list').innerHTML =
            '<p class="text-danger">Error al cargar el historial.</p>';
    }
}
