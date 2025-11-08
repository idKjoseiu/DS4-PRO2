document.addEventListener('DOMContentLoaded', function () { 

    /*------------------------------------------------------------
    / Pata guardar deposito
    -------------------------------------------------------------*/
    const formularioDeposito = document.getElementById('formularioDeposito');
    const MSG = document.getElementById("MSGDeposito");
    const alerta = document.getElementById("alertaDeposito");

    if (!formularioDeposito) {
        return; // Si no se encuentra el formulario, no hacemos nada.
    }
        
    formularioDeposito.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita que la página se recargue
        
        // Recogemos datos del formulario
        const datosFormulario = new FormData(formularioDeposito);

        // Enviar datos al JSP
        fetch('jsp/guardarDeposito.jsp', {
            method: 'POST',
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
                MSG.textContent = "Deposito registrado exitosamente.";
                alerta.className = "alert alert-success d-flex align-items-center gap-2 mt-3"; 
                alerta.classList.remove("d-none");
                formularioDeposito.reset();
            } else {
                throw new Error(texto || "Respuesta inesperada del servidor.");
            }
        })
        .catch(error => {
            MSG.textContent = "Error al registrar deposito: " + error.message;
            alerta.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
            alerta.classList.remove("d-none");
        });
    });

});