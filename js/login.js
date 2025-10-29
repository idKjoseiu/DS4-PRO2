document.addEventListener('DOMContentLoaded', function () {
    /*----------------------------------------------------------------------
    //INICIAR SESION
    ----------------------------------------------------------------------*/
    const formulario = document.getElementById("formularioLogin");
    const MSG = document.getElementById("MSGLogin");
    const alerta = document.getElementById("alertaLogin");

    if(!formulario){
        return;
    }

    formulario.addEventListener("submit", function(e){
        e.preventDefault();

        const datosFormulario = new FormData(formulario);

        fetch("jsp/login.jsp", {
            method: "POST",
            body: new URLSearchParams(datosFormulario)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { 
                    throw new Error(text || `Error del servidor: ${response.statusText}`); 
                });
            }
            return response.text();
        })
        .then(texto => {
            if (texto.trim() === "OK") {
                // En lugar de mostrar un mensaje, redirigimos al panel principal.
                window.location.href = "index.html";
                // MSG.textContent = "Inicio de sesión exitoso. Redirigiendo...";
                // alerta.className = "alert alert-success d-flex align-items-center gap-2 mt-3"; 
                // alerta.classList.remove("d-none");
                // formulario.reset();
            } else {
                throw new Error(texto || "Respuesta inesperada del servidor.");
            }
        })
        .catch(error => {
            MSG.textContent = "Error al iniciar sesión: " + error.message;
            alerta.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
            alerta.classList.remove("d-none");
        });
    

    });

    /*----------------------------------------------------------------------
    /
    ----------------------------------------------------------------------*/
});