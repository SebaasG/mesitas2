function updateFileName() {
    const fileInput = document.getElementById('archivo');
    const uploadText = document.getElementById('uploadText');
    
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        uploadText.textContent = fileName;
        uploadText.style.color = '#2d5a27';
        uploadText.style.fontWeight = '600';
    } else {
        uploadText.textContent = 'Cargar un archivo';
        uploadText.style.color = '#333';
        uploadText.style.fontWeight = '500';
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const mes = document.getElementById('mes').value;
    const mensaje = document.getElementById('mensaje').value;
    const archivo = document.getElementById('archivo').files[0];
    

    if (!mes || !mensaje || !archivo) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }
    
    if (archivo && !archivo.name.toLowerCase().endsWith('.pdf')) {
        alert('Por favor, seleccione un archivo PDF.');
        return;
    }
    
    
    alert('Archivo enviado correctamente!\n\n' +
          'Mes: ' + mes + '\n' +
          'Mensaje: ' + mensaje + '\n' +
          'Archivo: ' + archivo.name);
    
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
    modal.hide();
    

    document.getElementById('uploadForm').reset();
    document.getElementById('uploadText').textContent = 'Cargar un archivo';
    document.getElementById('uploadText').style.color = '#333';
    document.getElementById('uploadText').style.fontWeight = '500';
});

document.getElementById('uploadModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadText').textContent = 'Cargar un archivo';
    document.getElementById('uploadText').style.color = '#333';
    document.getElementById('uploadText').style.fontWeight = '500';
});