// Token JWT (puedes obtenerlo desde localStorage o donde lo almacenes)
const token = localStorage.getItem('token');

// Función para obtener y mostrar las facturas del usuario en el modal
async function verArchivos() {
    try {
        const response = await fetch('http://localhost:3000/api/facturas/mis-facturas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const container = document.getElementById('facturasContainer');
        container.innerHTML = ''; // Limpiar contenido anterior

        if (!data.success) {
            container.innerHTML = `<div class="alert alert-danger">No se pudieron cargar las facturas.</div>`;
            return;
        }

        if (data.data.length === 0) {
            container.innerHTML = `<div class="alert alert-info">No hay facturas disponibles.</div>`;
            return;
        }

        data.data.forEach(factura => {
            const card = document.createElement('div');
            card.className = 'card mb-3 shadow-sm';
            card.id = `factura-${factura.id}`;

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Factura N° ${factura.id}</h5>
                    <p class="card-text"><strong>Tipo:</strong> ${factura.tipo_factura}</p>
                    <p class="card-text"><strong>Fecha de emisión:</strong> ${new Date(factura.fecha_emision).toLocaleDateString()}</p>
                    <p class="card-text"><strong>Total:</strong> $${parseFloat(factura.total).toFixed(2)}</p>
                    ${factura.descripcion ? `<p class="card-text"><strong>Descripción:</strong> ${factura.descripcion}</p>` : ''}
                    <button class="btn btn-danger btn-sm mt-2" onclick="eliminarFactura(${factura.id})">
                        Eliminar
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error al obtener facturas:', error);
        document.getElementById('facturasContainer').innerHTML =
            `<div class="alert alert-danger">Ocurrió un error al cargar las facturas.</div>`;
    }
}

// Función para eliminar una factura
async function eliminarFactura(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/facturas/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            // Eliminar visualmente la tarjeta del DOM
            const card = document.getElementById(`factura-${id}`);
            if (card) card.remove();
        } else {
            alert('No se pudo eliminar la factura.');
        }
    } catch (error) {
        console.error('Error al eliminar la factura:', error);
        alert('Ocurrió un error al intentar eliminar la factura.');
    }
}


