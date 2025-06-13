// Espera que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Selecciona el formulario de login
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) return;

    // Crea y agrega un contenedor para mostrar mensajes de error
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none'; // Oculto por defecto
    loginForm.appendChild(errorMessage);

    // Evento al enviar el formulario
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Evita que se recargue la página

        // Obtiene los valores ingresados por el usuario
        const correo = document.getElementById('usuario').value.trim();
        const password = document.getElementById('contrasena').value;

        // Verifica que los campos no estén vacíos
        if (!correo || !password) {
            errorMessage.textContent = 'Por favor ingresa tus credenciales.';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            // Construye el objeto con los datos de login
            const loginData = { correo, password };

            // Muestra en consola para depuración
            console.log('Enviando datos:', loginData);

            // Realiza la solicitud POST al backend
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            // Muestra en consola el estado de la respuesta
            console.log('Respuesta del servidor:', response.status);

            const data = await response.json();
            console.log('Datos recibidos:', data);

            // Verifica si la respuesta fue exitosa
            if (response.ok && data.success) {
                // Guarda el token en localStorage
                localStorage.setItem('token', data.token);

                // Guarda el rol del usuario, asegurando formato minúscula
                const userRole = (data.user.rol || '').toLowerCase();
                localStorage.setItem('userRole', userRole);

                // Muestra el token y rol en consola para depuración
                console.log('Token guardado:', data.token);
                console.log('Usuario role:', userRole);

                // Redirige según el rol
                if (userRole === 'administrador') {
                    window.location.href = '../../assets/pages/admin.html';
                } else if (userRole === 'usuario') {
                    window.location.href = '../../assets/pages/archivos.html';
                } else {
                    // Rol no reconocido
                    errorMessage.textContent = 'Acceso denegado. Rol no autorizado.';
                    errorMessage.style.display = 'block';
                }
            } else {
                // Error de autenticación
                errorMessage.textContent = data.message || '❌ Credenciales incorrectas.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            // Error de red o backend caído
            console.error('Error completo:', error);
            errorMessage.textContent = '❌ Error al conectar con el servidor.';
            errorMessage.style.display = 'block';
        }
    });
});
