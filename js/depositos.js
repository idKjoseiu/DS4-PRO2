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

    /*------------------------------------------------------------
    / Para mostrar el historial de depósitos
    -------------------------------------------------------------*/
    const historialTab = document.querySelector('a[href="#Historial"]');
    const tablaHistorialBody = document.querySelector('#tablaHistorialDepositos tbody');
    const alertaHistorial = document.getElementById('alertaDeposito'); // Reutilizamos la alerta
    const MSGHistorial = document.getElementById('MSGDeposito');

    if (historialTab && tablaHistorialBody) {
        historialTab.addEventListener('show.bs.tab', function() {
            fetchDepositos();
        });
    }

    function fetchDepositos() {
        // Limpiamos la tabla antes de cargar nuevos datos
        tablaHistorialBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
        alertaHistorial.classList.add('d-none');

        fetch('jsp/obtenerDepositos.jsp')
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { 
                        throw new Error(text || `Error del servidor: ${response.statusText}`); 
                    });
                }
                return response.json();
            })
            .then(depositos => {
                tablaHistorialBody.innerHTML = ''; // Limpiar "Cargando..."

                if (depositos.length > 0) {
                    depositos.forEach(deposito => {
                        const fila = document.createElement('tr');
                        fila.innerHTML = `
                            <td data-label="Tipo">${deposito.tipo}</td>
                            <td data-label="Fecha">${deposito.fecha}</td>
                            <td data-label="Monto">${parseFloat(deposito.monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                        `;
                        tablaHistorialBody.appendChild(fila);
                    });
                } else {
                    // Si no hay depósitos, mostrar un mensaje en la tabla
                    tablaHistorialBody.innerHTML = '<tr><td colspan="3" class="text-center">No se encontraron depósitos registrados.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error al obtener historial de depósitos:', error);
                tablaHistorialBody.innerHTML = ''; // Limpiar la tabla
                // Mostrar el error en la alerta principal de la página
                MSGHistorial.textContent = "Error al cargar el historial: " + error.message;
                alertaHistorial.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alertaHistorial.classList.remove("d-none");
            });
    }

});