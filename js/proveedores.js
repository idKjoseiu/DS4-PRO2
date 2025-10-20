document.addEventListener("DOMContentLoaded", function() {
    // Referencias a elementos del html formulario
    const formulario = document.getElementById("formularioProveedores");
    const MSG = document.getElementById("MSG");
    const alerta = document.getElementById("alerta");

    // Si el formulario no existe
    if (!formulario) {
        return;
    }

    // Evento al enviar el formulario
    formulario.addEventListener("submit", function(e) {
        e.preventDefault(); // Evita que la página se recargue

        // Recolectar los datos del formulario
        const datosFormulario = new FormData(formulario);

        // Enviar los datos al JSP
        fetch("jsp/registrarProveedores.jsp", {
            method: "POST",
            body: new URLSearchParams(datosFormulario)
        })
        .then(response => {
            if (!response.ok) {
                // Si la respuesta no es OK, intentamos leer el texto del error.
                return response.text().then(text => { 
                    throw new Error(text || `Error del servidor: ${response.statusText}`); 
                });
            }
            return response.text();
        })
        .then(texto => {
            if (texto.trim() === "OK") {
                MSG.textContent = "Proveedor registrado exitosamente.";
                alerta.className = "alert alert-success d-flex align-items-center gap-2 mt-3"; 
                alerta.classList.remove("d-none");
                formulario.reset(); // Limpiar el formulario
            } else {
                throw new Error(texto || "Respuesta inesperada del servidor.");
            }
        })
        .catch(error => {
            MSG.textContent = "Error al registrar proveedor: " + error.message;
            alerta.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
            alerta.classList.remove("d-none");
        });
    });
});