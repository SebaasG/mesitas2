// ✅ Actualiza el texto que muestra el nombre del archivo seleccionado
function updateFileName() {
    const fileInput = document.getElementById('archivo');
    const uploadText = document.getElementById('uploadText');

    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        uploadText.textContent = fileName;
        uploadText.style.color = '#2d5a27'; // Verde oscuro para indicar archivo cargado
        uploadText.style.fontWeight = '600';
    } else {
        resetUploadText();
    }
}
window.updateFileName = updateFileName; // Por si necesitas llamarla desde el HTML

// ✅ Restaura el texto y estilo del botón de carga de archivo a su estado por defecto
function resetUploadText() {
    const uploadText = document.getElementById('uploadText');
    uploadText.textContent = 'Cargar un archivo';
    uploadText.style.color = '#333';
    uploadText.style.fontWeight = '500';
}

// ✅ Lógica principal del formulario de subida de mensaje mensual
function handleFormSubmit(e) {
    e.preventDefault();

    const mes = document.getElementById('mes').value;
    const mensaje = document.getElementById('mensaje').value;
    const archivoInput = document.getElementById('archivo');
    const archivo = archivoInput.files[0];

    // Validación de campos obligatorios
    if (!mes || !mensaje || !archivo) {
        alert('❌ Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Validación de formato de archivo
    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
        alert('❌ El archivo debe estar en formato PDF.');
        return;
    }

    // Simulación de éxito
    alert(`✅ Archivo enviado correctamente!\n\nMes: ${mes}\nMensaje: ${mensaje}\nArchivo: ${archivo.name}`);

    // Ocultar el modal después de enviar
    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
    if (modal) modal.hide();

    // Reiniciar formulario y texto de archivo
    document.getElementById('uploadForm').reset();
    resetUploadText();
}

// ✅ Limpia el formulario y restablece el texto del archivo cuando se cierra el modal manualmente
function handleModalHidden() {
    document.getElementById('uploadForm').reset();
    resetUploadText();
}

// 👉 Asociar eventos
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadModal = document.getElementById('uploadModal');

    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit);
    }

    if (uploadModal) {
        uploadModal.addEventListener('hidden.bs.modal', handleModalHidden);
    }
});
