// =======================
// 🔐 Token desde localStorage
// =======================
const token = localStorage.getItem('token');

// =======================
// 🔁 Inicialización DOM
// =======================
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const archivoInput = document.getElementById('archivo');
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace('/index.html');
        });
    }

    // Evento principal de envío del formulario
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validación de totales
        const totalInput = document.getElementById('total_oculto').value;
        const confirmarInput = document.getElementById('confirmar_total_oculto').value;

        if (!totalInput || !confirmarInput || totalInput !== confirmarInput) {
            alert('❌ Los valores del Total no coinciden. Por favor verifica ambos campos.');
            return;
        }

        // Captura de datos del formulario
        const tipo_id = document.getElementById('tipo_id').value;
        const fecha_pago = document.getElementById('fecha_pago').value;
        const total = totalInput;
        const archivo = archivoInput.files[0];

        const formData = new FormData();
        formData.append('tipo_id', tipo_id);
        formData.append('fecha_pago', fecha_pago);
        formData.append('total', total);
        formData.append('archivo', archivo);

        console.log('Subiendo factura con los siguientes datos:');
        console.log('Tipo ID:', tipo_id);
        console.log('Fecha pago:', fecha_pago);
        console.log('Total:', total);
        console.log('Archivo:', archivo?.name || 'No se seleccionó archivo');

        try {
            const response = await fetch('http://localhost:3000/api/facturas/subir', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Factura subida correctamente.');
                uploadForm.reset();
                document.getElementById('uploadText').textContent = 'Cargar un archivo';

                const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
                if (modal) modal.hide();

                verArchivos();
            } else {
                alert(data.error || '❌ Error al subir la factura.');
            }
        } catch (error) {
            console.error('Error al subir factura:', error);
            alert('❌ Ocurrió un error al enviar la factura.');
        }
    });

    // Carga inicial de facturas al mostrar modal
    document.getElementById('facturasModal').addEventListener('shown.bs.modal', verArchivos);
});

// =======================
// 💰 Formateo de valores CLP
// =======================

// 👉 Formatea un input al escribir (y actualiza campo oculto)
function actualizarTotal(inputId, hiddenId) {
    const input = document.getElementById(inputId);
    const hidden = document.getElementById(hiddenId);
    const valorNumerico = input.value.replace(/\D/g, '');

    hidden.value = valorNumerico;

    input.value = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(valorNumerico || 0);
}
window.actualizarTotal = actualizarTotal;

// 👉 Solo formatea un input CLP visualmente (sin oculto)
function formatearPesos(input) {
    const valorNumerico = input.value.replace(/\D/g, '');
    const formateado = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(valorNumerico || 0);
    input.value = formateado;
}
window.formatearPesos = formatearPesos;

// =======================
// 📎 Nombre del archivo cargado
// =======================
function updateFileName() {
    const archivo = document.getElementById('archivo');
    const uploadText = document.getElementById('uploadText');

    uploadText.textContent = archivo.files.length > 0
        ? archivo.files[0].name
        : 'Cargar un archivo';
}
window.updateFileName = updateFileName;

// =======================
// 📤 Visualización de facturas
// =======================
async function verArchivos() {
    try {
        const response = await fetch('http://localhost:3000/api/facturas/usuario', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const container = document.getElementById('facturasContainer');
        container.innerHTML = '';

        if (!data.success) {
            container.innerHTML = `<div class="alert alert-danger">No se pudieron cargar las facturas.</div>`;
            return;
        }

        if (!data.data || data.data.length === 0) {
            container.innerHTML = `<div class="alert alert-info">No hay facturas disponibles.</div>`;
            return;
        }

        data.data.forEach(factura => {
            const card = document.createElement('div');
            card.className = 'card mb-3 shadow-sm';
            card.id = `factura-${factura.id}`;

            const tieneArchivo = factura.archivo_pdf || factura.archivo;
            const tipoTexto = factura.tipo_factura || (factura.tipo_id === 1 ? 'Administración' : 'Otro');
            const descargaDisponible = tieneArchivo
                ? `<button class="btn btn-success btn-sm mt-2" onclick="descargarFactura(${factura.id})">Descargar PDF</button>`
                : `<p class="text-muted">No hay archivo PDF</p>`;

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Factura N° ${factura.id}</h5>
                    <p class="card-text"><strong>Tipo:</strong> ${tipoTexto}</p>
                    <p class="card-text"><strong>Fecha de Pago:</strong> ${new Date(factura.fecha_pago).toLocaleDateString()}</p>
                    <p class="card-text"><strong>Total:</strong> $${parseFloat(factura.total).toLocaleString('es-CL')}</p>
                    <p class="card-text"><strong>Fecha de pago:</strong> ${new Date(factura.fecha_pago).toLocaleDateString()}</p>
                    ${factura.descripcion ? `<p class="card-text"><strong>Descripción:</strong> ${factura.descripcion}</p>` : ''}
                    ${descargaDisponible}
                    <button class="btn btn-danger btn-sm mt-2" onclick="eliminarFactura(${factura.id})">Eliminar</button>
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

// =======================
// ⬇️ Descarga de factura PDF
// =======================
async function descargarFactura(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/facturas/descargar/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Error al descargar la factura.');
            return;
        }

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
        console.error('Error al descargar factura:', error);
        alert('❌ Ocurrió un error al intentar descargar la factura.');
    }
}
window.descargarFactura = descargarFactura;

// =======================
// 🗑️ Eliminación de factura
// =======================
async function eliminarFactura(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/facturas/eliminar/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById(`factura-${id}`)?.remove();
            alert('✅ Factura eliminada correctamente.');
        } else {
            alert(data.error || '❌ No se pudo eliminar la factura.');
        }

    } catch (error) {
        console.error('Error al eliminar la factura:', error);
        alert('❌ Ocurrió un error al intentar eliminar la factura.');
    }
}
window.eliminarFactura = eliminarFactura;
