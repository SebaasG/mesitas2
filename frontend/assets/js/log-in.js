document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    loginForm.appendChild(errorMessage);

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const correo = document.getElementById('usuario').value;
        const password = document.getElementById('contrasena').value;

        try {
            const loginData = {
                correo: correo,
                password: password
            };

            console.log('Enviando datos:', loginData); // Para depuración

            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            console.log('Respuesta del servidor:', response.status); // Para depuración

            const data = await response.json();
            console.log('Datos recibidos:', data); // Para depuración
           

            if (response.ok && data.success) {
                // Guardar el token en localStorage
                localStorage.setItem('token', data.token);
 
                const token = localStorage.getItem('token');
                const userRole = localStorage.getItem('userRole');
                console.log('Usuario role:', userRole); 
                console.log('Token guardado:', token); 
                // Verificar si es admin
                if (userRole === 'administrador' || userRole === 'Administrador') {
                    window.location.href = '../../assets/pages/admin.html'; 
                } else {
                    errorMessage.textContent = 'Acceso denegado. Se requieren privilegios de administrador.';
                    errorMessage.style.display = 'block';
                }
            } else {
                errorMessage.textContent = data.message || 'Error al iniciar sesión';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error completo:', error); // Para depuración
            errorMessage.textContent = 'Error al conectar con el servidor';
            errorMessage.style.display = 'block';
        }
    });
});