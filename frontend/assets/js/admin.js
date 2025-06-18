if (typeof ultimaParcelaSeleccionada === 'undefined') {
    var ultimaParcelaSeleccionada = null;
}

// Evento para cada punto de parcela
document.querySelectorAll('.parcel-point').forEach(point => {
    point.addEventListener('click', async () => {
        const numero = point.getAttribute('data-parcel');
        const numeroParcela = 'P' + numero.padStart(3, '0');
        const token = localStorage.getItem('token');

        if (!token) {
            alert('No estás autenticado. Inicia sesión para continuar.');
            return;
        }

        ultimaParcelaSeleccionada = numeroParcela;

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

// ✅ Mostrar facturas en el modal
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
                <h3>Factura ID: ${f.id}</h3>
                <p><strong>Tipo:</strong> ${f.tipo_factura}</p>
                <p><strong>Usuario:</strong> ${f.nombre} ${f.apellido}</p>
                <p><strong>Total:</strong> $${f.total}</p>
                <p><strong>Fecha de Pago:</strong> ${new Date(f.fecha_pago).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> 
                    <span style="color: ${f.estado === 'APROBADA' ? 'green' : f.estado === 'DESAPROBADA' ? 'red' : 'orange'};">
                        ${f.estado}
                    </span>
                </p>
                ${f.archivo_pdf
                    ? `<button class="btn-descargar" data-id="${f.id}">Ver PDF</button>`
                    : '<em>Sin archivo</em>'
                }
                <br>
                <button class="btn-aprobar" data-id="${f.id}" ${f.estado === 'APROBADA' ? 'disabled' : ''}>Aprobar</button>
                <button class="btn-desaprobar" data-id="${f.id}" ${f.estado !== 'APROBADA' ? 'disabled' : ''}>Desaprobar</button>
            `;
            contenedor.appendChild(facturaEl);
        });

        agregarEventosBotones();
    }

    // Mostrar el modal
    modal.classList.remove('fade');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    const closeButton = modal.querySelector('.btn-close');
    if (closeButton) {
        closeButton.onclick = () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        };
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    };
}

// ✅ Eventos de botones de descarga, aprobar y desaprobar
function agregarEventosBotones() {
    const contenedor = document.getElementById('facturasContainer');

    contenedor.querySelectorAll('.btn-descargar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No tienes sesión activa.');
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

                if (!response.ok) throw new Error('Error al descargar el archivo');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                let filename = `factura_${id}`;
                const disposition = response.headers.get('Content-Disposition');
                if (disposition && disposition.includes('filename=')) {
                    filename = disposition.split('filename=')[1].replace(/['"]/g, '');
                }

                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    });

    contenedor.querySelectorAll('.btn-aprobar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            cambiarEstadoFactura(id, 'APROBADA');
        });
    });

    contenedor.querySelectorAll('.btn-desaprobar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            cambiarEstadoFactura(id, 'DESAPROBADA');
        });
    });
}

// ✅ Cambiar estado de la factura
async function cambiarEstadoFactura(id, nuevoEstado) {
    const token = localStorage.getItem('token');
    if (!token) return alert('No estás autenticado.');

    const confirmar = confirm(`¿Deseas cambiar el estado a "${nuevoEstado}"?`);
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/facturas/actualizar/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Factura ${id} actualizada a "${nuevoEstado}".`);
            const facturasResponse = await fetch(`http://localhost:3000/api/facturas/parcela/${ultimaParcelaSeleccionada}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const facturas = await facturasResponse.json();
            mostrarFacturasEnModal(facturas);
        } else {
            alert('Error: ' + (data.error || 'No se pudo cambiar el estado.'));
        }
    } catch (error) {
        alert('Error al cambiar el estado: ' + error.message);
    }
}

// ✅ Historial visible para administradores
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

// ✅ Configuración inicial
document.addEventListener('DOMContentLoaded', () => {
    obtenerHistorial();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace('/index.html');
        });
    }
});

 function abrirModalFechas() {
    document.getElementById('modalFechas').style.display = 'block';
  }

  function cerrarModal() {
    document.getElementById('modalFechas').style.display = 'none';
  }

  async function descargarExcel() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    if (fechaInicio > fechaFin) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    const token = localStorage.getItem('token');
    const url = `http://localhost:3000/api/extraer/exportar-facturas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al generar el Excel');

      const blob = await response.blob();
      const urlDescarga = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlDescarga;
      a.download = 'facturas_filtradas.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlDescarga);

      cerrarModal();
    } catch (error) {
      alert('Error al descargar Excel: ' + error.message);
    }
  }
