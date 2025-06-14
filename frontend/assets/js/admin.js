// ✅ Asignar eventos a cada punto de parcela
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
            // Solicitud para obtener facturas de la parcela
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


// ✅ Muestra las facturas en un modal personalizado
function mostrarFacturasEnModal(facturas) {
    const modal = document.getElementById('facturasModal');
    const contenedor = document.getElementById('facturasContainer');
    contenedor.innerHTML = '';

    // Si no hay facturas
    if (!facturas.length) {
        contenedor.innerHTML = '<p>No hay facturas para esta parcela.</p>';
    } else {
        // Renderizar cada factura
        facturas.forEach(f => {
            const facturaEl = document.createElement('div');
            facturaEl.classList.add('factura-item');

            facturaEl.innerHTML = `
                <h6>Factura ID: ${f.id}</h6>
                <p><strong>Tipo:</strong> ${f.tipo_factura}</p>
                <p><strong>Usuario:</strong> ${f.nombre} ${f.apellido}</p>
                <p><strong>Fecha emisión:</strong> ${f.fecha_emision}</p>
                <p><strong>Total:</strong> $${f.total}</p>
                ${
                    f.archivo_pdf
                        ? `<button class="btn-descargar" data-id="${f.id}">Ver PDF</button>`
                        : '<em>Sin archivo</em>'
                }
                <hr>
            `;
            contenedor.appendChild(facturaEl);
        });

        // Asociar eventos a botones de descarga
        const botonesDescarga = contenedor.querySelectorAll('.btn-descargar');
        botonesDescarga.forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const token = localStorage.getItem('token');

                if (!token) {
                    alert('No tienes sesión activa. Por favor inicia sesión.');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/api/facturas/descargar/${id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/pdf'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error('No tienes permiso para acceder a esta factura.');
                        } else if (response.status === 401) {
                            throw new Error('Sesión no válida o expirada.');
                        } else {
                            throw new Error('Error al descargar el PDF.');
                        }
                    }

                    // Descargar PDF desde el blob
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `factura_${id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            });
        });
    }

    // ✅ Mostrar el modal manualmente (sin fade de Bootstrap)
    modal.classList.remove('fade');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // ✅ Evitar que el foco quede en un elemento oculto
    if (document.activeElement) document.activeElement.blur();

    // ✅ Cerrar modal con botón "X"
    const closeButton = modal.querySelector('.btn-close');
    if (closeButton) {
        closeButton.onclick = () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        };
    }

    // ✅ Cerrar modal al hacer clic fuera de él
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    };
}

// ✅ Obtener historial de acciones (visible para admins)
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

        if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
            historialList.innerHTML = '<p>No hay actividad reciente.</p>';
            return;
        }

        data.data.forEach(item => {
            const entry = document.createElement('div');
            entry.className = 'historial-item';
            entry.innerHTML = `
                <p><strong>${item.nombre} ${item.apellido}</strong> realizó <em>${item.accion}</em> en <b>${item.tabla_afectada}</b></p>
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

// ✅ Configuraciones generales al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerHistorial();

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace('/index.html');
        });
    }
});
