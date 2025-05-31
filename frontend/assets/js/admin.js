document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const errorMessage = document.getElementById('errorMessage');

    // Verificar autenticación
    if (!token || userRole !== 'ADMIN') {
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await fetch('/api/facturas/todas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const facturas = await response.json();
            const facturasBody = document.getElementById('facturasBody');
             
            facturas.forEach(factura => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${factura.id}</td>
                    <td>${new Date(factura.fecha).toLocaleDateString()}</td>
                    <td>${factura.cliente}</td>
                    <td>$${factura.total.toFixed(2)}</td>
                    <td>${factura.estado}</td>
                `;
                facturasBody.appendChild(row);
            });
        } else if (response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '../index.html';
        } else {
            errorMessage.textContent = 'Error al cargar las facturas';
        }
    } catch (error) {
        errorMessage.textContent = 'Error al conectar con el servidor';
    }
}); 