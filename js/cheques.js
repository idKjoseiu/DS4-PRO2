
document.addEventListener('DOMContentLoaded', function() {

    /* -----------------------------------------
    // ESTABLECER FECHA ACTUAL POR DEFECTO
    -----------------------------------------*/
    const fechaEmisionInput = document.getElementById('fechaEmision');
    if (fechaEmisionInput) {
        // Obtiene la fecha local del usuario para evitar problemas de zona horaria.
        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        // getMonth() es 0-indexado (0=Enero), por eso se suma 1.
        // Se usa padStart para asegurar que tenga dos dígitos (ej: 01, 09, 12).
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        
        const hoy = `${anio}-${mes}-${dia}`;
        fechaEmisionInput.value = hoy; 
    }


    /* -----------------------------------------
    // OBTENER PROVEEDORES
     -----------------------------------------*/
    const selectProveedor = document.getElementById('proveedor');

    if (selectProveedor) {
        fetch('jsp/obtenerProveedores.jsp')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los proveedores. Código: ' + response.status);
                }
                return response.json();
            })
            .then(proveedores => {
                proveedores.forEach(proveedor => {
                    const option = new Option(proveedor.nombre, proveedor.codigo);
                    selectProveedor.add(option);
                });
            })
            .catch(error => {
                console.error('Error en fetch proveedores:', error);
                selectProveedor.options.add(new Option('Error al cargar proveedores', ''));
            });
    }

    /*-----------------------------------------
    OBTENER OBJETOS DE GASTO
     -----------------------------------------*/
    const selectObjetoDeGasto = document.getElementById('objetoDeGasto');

    if (selectObjetoDeGasto) {
        fetch('jsp/obtenerObjetoGasto.jsp')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los objetos de gasto. Código: ' + response.status);
                }
                return response.json();
            })
            .then(objetosDeGasto => {
                objetosDeGasto.forEach(objeto => {
                    const option = new Option(objeto.detalle, objeto.codigo);
                    selectObjetoDeGasto.add(option);
                });
            })
            .catch(error => {
                console.error('Error en fetch objetos de gasto:', error);
                selectObjetoDeGasto.options.add(new Option('Error al cargar objetos de gasto', ''));
            });
    }
    
    /*-----------------------------------------
    Guardamos los cheques
    -----------------------------------------*/
    const formularioChequeGuardar = document.getElementById('formularioChequeGuardar');

    if(formularioChequeGuardar){
        
        const MSG = document.getElementById("MSG");
        const alerta = document.getElementById("alerta");

        formularioChequeGuardar.addEventListener('submit', function(e) {
            e.preventDefault();//para que la pagina no se recargue

            //recogemos datos del formulario
            const datosFormulario = new FormData(formularioChequeGuardar);

            //enviamos los datos al JSP
            fetch('jsp/registrarCheque.jsp', {
                method: 'POST', // Esto es correcto para registrar
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
                    MSG.textContent = "Cheque registrado exitosamente.";
                    alerta.className = "alert alert-success d-flex align-items-center gap-2 mt-3"; 
                    alerta.classList.remove("d-none");

                    formularioChequeGuardar.reset();
                } else {
                    throw new Error(texto || "Respuesta inesperada del servidor.");
                }
            })
            .catch(error => {
                MSG.textContent = "Error al registrar cheque: " + error.message;
                alerta.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alerta.classList.remove("d-none");
            })
            .finally(() => {
                
            });
        });
    }

    /* -----------------------------------------
     Para Gestion
    -----------------------------------------*/
    const formularioChequeGestion = document.getElementById('formularioChequeGestion');

    if (formularioChequeGestion) {
        const tablaResultados = document.getElementById('resultadoBusquedaCheque');
        const cuerpoTabla = tablaResultados.querySelector('tbody');
        const alertaGestion = document.getElementById('alertaGestion');
        const MSGGestion = document.getElementById('MSGGestion');
        const tituloGestion = document.getElementById('tituloGestion');
        const filtrosCheque = document.querySelectorAll('input[name="filtroCheque"]');

        function buscarCheques(esBusquedaPorNumero = false) {
            // Ocultamos resultados y alertas anteriores
            tablaResultados.classList.add('d-none');
            alertaGestion.classList.add('d-none');
            if (tituloGestion) tituloGestion.classList.add('d-none');

            const datosFormulario = new FormData(formularioChequeGestion);
            const filtroSeleccionado = document.querySelector('input[name="filtroCheque"]:checked').value;
            datosFormulario.set('filtroCheque', filtroSeleccionado); // Asegurarnos que el filtro se envíe

            // El endpoint podría cambiar dependiendo del filtro
            let url;
            if (filtroSeleccionado === 'Emitidos') {
                url = 'jsp/obtenerCheque.jsp';
            } else if (filtroSeleccionado === 'Anulados') {
                url = 'jsp/obtenerChequesAnulados.jsp';
            } else if (filtroSeleccionado === 'FueraDeCirculacion') {
                url = 'jsp/obtenerChequesFC.jsp';
            }
            // if (filtroSeleccionado === 'Anulados') { url = 'jsp/obtenerChequesAnulados.jsp'; }

            fetch(url, {
                method: 'POST',
                body: new URLSearchParams(datosFormulario)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { 
                        throw new Error(text || `Error del servidor: ${response.statusText}`); 
                    });
                }
                // Si la respuesta puede ser JSON o texto (para "no encontrado")
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        return { encontrado: false, mensaje: text };
                    }
                });
            })
            .then(data => {
                cuerpoTabla.innerHTML = ''; // Limpiar resultados anteriores

                if (data.encontrado) {
                    const cheques = data.resultados || [data]; // Unificar la respuesta a un array
                    console.log('Cheques encontrados:', cheques);
                    // Actualizar y mostrar el título según el filtro
                    if (tituloGestion) {
                        let textoTitulo = '';
                        switch (filtroSeleccionado) {
                            case 'Emitidos':
                                textoTitulo = 'Cheques Emitidos';
                                break;
                            case 'Anulados':
                                textoTitulo = 'Cheques Anulados';
                                break;
                            case 'FueraDeCirculacion':
                                textoTitulo = 'Cheques Fuera de Circulación';
                                break;
                        }
                        tituloGestion.textContent = textoTitulo;
                        tituloGestion.classList.remove('d-none');
                    }


                    cheques.forEach(cheque => {
                        // Asegurarnos de que el número de cheque se muestre como un entero
                        if (cheque.numeroCheque) {
                            cheque.numeroCheque = parseInt(cheque.numeroCheque, 10);
                        }

                        const fila = document.createElement('tr');

                        // Ocultar/mostrar botones según el estado del cheque
                        const esEmitido = filtroSeleccionado === 'Emitidos';
                        const botonesAccion = `
                            <div class="d-flex gap-1">
                                <button class="btn btn-info btn-sm d-flex align-items-center justify-content-center" title="Ver Detalles">
                                    <span class="material-icons">visibility</span>
                                </button>
                                <button type="button" class="btn btn-warning btn-sm d-flex align-items-center justify-content-center" title="Sacar de Circulación" data-bs-toggle="modal" data-bs-target="#modalSacarCirculacion" style="display: ${esEmitido ? 'flex' : 'none'};">
                                    <span class="material-icons">remove_circle</span>
                                </button>
                                <button class="btn btn-danger btn-sm d-flex align-items-center justify-content-center" title="Anular Cheque" data-bs-toggle="modal" data-bs-target="#modalAnular" style="display: ${esEmitido ? 'flex' : 'none'};">
                                    <span class="material-icons">cancel</span>
                                </button>
                            </div>
                        `;

                        fila.innerHTML = `
                            <td data-label="Num. Cheque"><input type="text" class="inputEnTabla resNumCheque" value="${cheque.numeroCheque}" readonly></td>
                            <td data-label="Fecha de Emisión"><input type="text" class="inputEnTabla resFecha" value="${cheque.fecha}" readonly></td>
                            <td data-label="Proveedor"><input type="text" class="inputEnTabla resProveedor" value="${cheque.proveedor}" readonly></td>
                            <td data-label="Monto"><input type="text" class="inputEnTabla resMonto" value="${cheque.monto}" readonly></td>
                            <td data-label="Acciones">${botonesAccion}</td>
                        `;
                        cuerpoTabla.appendChild(fila);
                    });

                    tablaResultados.classList.remove('d-none');
                } else {
                    // Si no se encontraron resultados, mostramos una alerta
                    MSGGestion.textContent = data.mensaje || "No se encontraron cheques con los criterios seleccionados.";
                    alertaGestion.className = "alert alert-info d-flex align-items-center gap-2 mt-3";
                    alertaGestion.classList.remove("d-none");
                }
            })
            .catch(error => {
                console.error('Error al buscar cheque:', error);
                MSGGestion.textContent = "Error al buscar el cheque: " + error.message;
                alertaGestion.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
            });
        }

        // Evento para el envío del formulario (búsqueda por número)
        formularioChequeGestion.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarCheques(true);
        });

        // Evento para el cambio en los filtros de radio
        filtrosCheque.forEach(radio => {
            radio.addEventListener('change', () => buscarCheques(false));
        });

        // Cargar la lista de cheques emitidos por defecto al iniciar
        buscarCheques(false);
    }

// --- Lógica para el modal "Sacar de Circulación" ------------------------------------------------------------------------------------------
    const modalSacarCirculacion = document.getElementById('modalSacarCirculacion');
    if (modalSacarCirculacion) {
        const btnConfirmarSacarCirculacion = document.getElementById('btnConfirmarSacarCirculacion');
        const resultadoBusqueda = document.getElementById('resultadoBusquedaCheque');
        const formularioChequeGestion = document.getElementById('formularioChequeGestion');
        const alertaGestion = document.getElementById('alertaGestion');
        const MSGGestion = document.getElementById('MSGGestion');

        // Al mostrarse el modal, pre-rellenamos la fecha actual.
        modalSacarCirculacion.addEventListener('show.bs.modal', function () {
            const fechaInput = document.getElementById('fechaFueraCirculacion');
            const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
            fechaInput.value = hoy;
        });

        // Al enviar el formulario del modal
        document.getElementById('formSacarCirculacion').addEventListener('submit', function(e) {
            e.preventDefault(); // Evitamos el envío tradicional del formulario

            // Recopilamos los datos directamente de la tabla de resultados
            const numeroCheque = document.getElementById('resNumCheque').value;

            // Recopilamos los datos del modal
            const fechaFueraCirculacion = document.getElementById('fechaFueraCirculacion').value;
            const detalles = document.getElementById('detallesSacarCirculacion').value;

            const modalInstance = bootstrap.Modal.getInstance(modalSacarCirculacion);

            if (!numeroCheque) {
                // Este error no debería ocurrir si el modal solo se abre cuando hay un resultado,
                // pero es una buena salvaguarda.
                modalInstance.hide();
                MSGGestion.textContent = "Error: No se pudo encontrar el número de cheque. Por favor, busque el cheque de nuevo.";
                alertaGestion.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
                return;
            }

            if (!fechaFueraCirculacion) {
                // Podríamos mostrar un mensaje dentro del modal, pero por consistencia lo mostramos fuera.
                modalInstance.hide();
                MSGGestion.textContent = "Por favor, especifique la fecha de retiro.";
                alertaGestion.className = "alert alert-warning d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
                return;
            }

            if (!detalles.trim()) {
                // Ocultamos el modal para mostrar la alerta principal.
                modalInstance.hide();
                MSGGestion.textContent = "Por favor, ingrese los detalles o el motivo para sacar el cheque de circulación.";
                alertaGestion.className = "alert alert-warning d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
                return;
            }

            // Enviamos al JSP para actualizar su estado
            fetch('jsp/sacarCirculacionCheque.jsp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `numeroCheque=${encodeURIComponent(numeroCheque)}&fechaFueraCirculacion=${encodeURIComponent(fechaFueraCirculacion)}&detalles=${encodeURIComponent(detalles)}`
            })
            .then(response => response.text())
            .then(texto => {
                if (texto.trim() === "OK") {
                    MSGGestion.textContent = `El cheque N° ${numeroCheque} ha sido sacado de circulación exitosamente.`;
                    alertaGestion.className = "alert alert-success d-flex align-items-center gap-2 mt-3";
                    alertaGestion.classList.remove("d-none");

                    // Ocultamos los resultados y reseteamos el formulario de búsqueda
                    resultadoBusqueda.classList.add('d-none');
                    formularioChequeGestion.reset();
                    document.getElementById('detallesSacarCirculacion').value = ''; // Limpiar textarea

                    // Cerramos el modal manualmente
                    modalInstance.hide(); // Ya está definida arriba
                } else {
                    throw new Error(texto || "Respuesta inesperada del servidor.");
                }
            })
            .catch(error => {
                // Ocultamos el modal para que el usuario pueda ver el mensaje de error principal
                const modalInstance = bootstrap.Modal.getInstance(modalSacarCirculacion);
                if (modalInstance) modalInstance.hide();
                MSGGestion.textContent = "Error al procesar la solicitud: " + error.message;
                alertaGestion.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
            });
        });
    }

    // --- Lógica para el modal "Anular Cheque" ------------------------------------------------------------------------------------------
    const modalAnular = document.getElementById('modalAnular');
    if (modalAnular) {
        const fechaAnulacionInput = document.getElementById('fechaAnulacion');
        const fechaEmisionAnularInput = document.getElementById('fechaEmisionAnular');
        const montoAnularInput = document.getElementById('MontoAnular');
        const mensajeMontoAnular = document.getElementById('MSGmontoAnular');
        const btnConfirmarAnular = document.getElementById('btnConfirmarAnulacion');
        
        // Referencias a los elementos de alerta en la pestaña de Gestión
        const resultadoBusqueda = document.getElementById('resultadoBusquedaCheque');
        const alertaGestion = document.getElementById('alertaGestion');
        const MSGGestion = document.getElementById('MSGGestion');


        // Al mostrarse el modal, pre-rellenamos la fecha de emisión y la fecha actual para la anulación.
        modalAnular.addEventListener('show.bs.modal', function () {
            // 1. Obtener valores de la tabla de resultados
            const fechaEmisionDesdeTabla = document.getElementById('resFecha').value;
            const montoDesdeTabla = document.getElementById('resMonto').value;
            
            // 2. Asignar la fecha de emisión al input del modal (solo lectura)
            fechaEmisionAnularInput.value = fechaEmisionDesdeTabla;

            // 3. Establecer la fecha actual por defecto en el campo de fecha de anulación
            const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
            fechaAnulacionInput.value = hoy;

            // 4. Lógica de comparación de fechas para el monto
            const fechaEmision = new Date(fechaEmisionDesdeTabla + 'T00:00:00'); // Añadir hora para evitar problemas de zona horaria
            const fechaAnulacion = new Date(hoy + 'T00:00:00');

            // Comparamos si el mes y el año son los mismos
            if (fechaEmision.getMonth() === fechaAnulacion.getMonth() &&
                fechaEmision.getFullYear() === fechaAnulacion.getFullYear()) {
                
                // Si es el mismo mes, el monto es 0
                montoAnularInput.value = "0.00";
                mensajeMontoAnular.textContent = "Anulado en el mismo mes de emisión.";
                mensajeMontoAnular.style.color = 'green'; // Opcional: estilo visual

            } else {
                // Si es un mes diferente, se usa el monto original del cheque
                montoAnularInput.value = montoDesdeTabla;
                mensajeMontoAnular.textContent = "Anulado en un mes posterior a la emisión.";
                mensajeMontoAnular.style.color = 'orange'; // Opcional: estilo visual
            }

            // Limpiamos cualquier listener anterior para evitar ejecuciones múltiples
            const newBtn = btnConfirmarAnular.cloneNode(true);
            btnConfirmarAnular.parentNode.replaceChild(newBtn, btnConfirmarAnular);

            document.getElementById('formAnular').addEventListener('submit', function(e) {
                e.preventDefault(); // Evitamos el envío tradicional del formulario

                // 1. Recolectar datos
                const numeroCheque = document.getElementById('resNumCheque').value;
                const fechaAnulacion = fechaAnulacionInput.value;
                const motivoAnulacion = document.getElementById('detallesAnulacion').value;
                const montoAnular = montoAnularInput.value; // Ya está en el formulario

                if (!fechaAnulacion) {
                    alert("Por favor, especifique la fecha de anulación.");
                    return;
                }

                // 2. Preparar datos para enviar
                const datosParaAnular = new URLSearchParams();
                datosParaAnular.append('numeroCheque', numeroCheque);
                datosParaAnular.append('fechaAnulacion', fechaAnulacion);
                datosParaAnular.append('motivoAnulacion', motivoAnulacion);
                datosParaAnular.append('montoAnular', montoAnular);

                // 3. Enviar al JSP
                fetch('jsp/anularCheque.jsp', {
                    method: 'POST',
                    body: datosParaAnular
                })
                .then(response => response.text())
                .then(texto => {
                    if (texto.trim() === "OK") {
                        // Cerramos el modal
                        const modalInstance = bootstrap.Modal.getInstance(modalAnular);
                        modalInstance.hide();

                        // Mostramos mensaje de éxito en la pestaña de Gestión
                        MSGGestion.textContent = `Cheque N° ${numeroCheque} anulado exitosamente.`;
                        alertaGestion.className = "alert alert-success d-flex align-items-center gap-2 mt-3";
                        alertaGestion.classList.remove("d-none");

                        // Ocultamos la tabla de resultados y limpiamos el formulario de búsqueda
                        resultadoBusqueda.classList.add('d-none');
                        document.getElementById('formularioChequeGestion').reset();

                    } else {
                        throw new Error(texto || "Respuesta inesperada del servidor.");
                    }
                })
                .catch(error => {
                    // Cerramos el modal para mostrar el error en la página principal
                    const modalInstance = bootstrap.Modal.getInstance(modalAnular);
                    modalInstance.hide();

                    // Mostramos el error en la alerta de Gestión
                    MSGGestion.textContent = "Error al anular el cheque: " + error.message;
                    alertaGestion.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                    alertaGestion.classList.remove("d-none");
                });
            });
        });

    }

});
    
    /* -----------------------------------------
     CONVERSIÓN DE NÚMERO A LETRAS
    -----------------------------------------*/ 
    const montoInput = document.getElementById('monto');
    const montoEnLetrasInput = document.getElementById('montoAletras');

    if (montoInput && montoEnLetrasInput) {
        // Evitar la letra 'e' en el campo monto
        montoInput.addEventListener('keydown', function(event) {
            if (event.key === 'e' || event.key === 'E') {
                event.preventDefault();
            }
        });

        // Escuchar cambios y convertir a letras
        montoInput.addEventListener('input', function() {
            const valor = this.value;
            montoEnLetrasInput.value = valor ? convertirNumeroALetras(valor) : '';
        });
    }




/* =====================================================
//CONVERTIR NÚMEROS A LETRAS
 =====================================================*/
function convertirNumeroALetras(numero) {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    function convertirMenorQueMil(n) {
        if (n >= 1000) return '';
        if (n === 100) return 'cien';

        let texto = '';
        const c = Math.floor(n / 100);
        const d = Math.floor((n % 100) / 10);
        const u = n % 10;

        if (c > 0) { // Centenas (100-999)
            texto += centenas[c];
            if (n % 100 !== 0) texto += ' ';
        }

        const resto = n % 100;
        if (resto > 0) {
            if (resto < 10) { // Unidades (1-9)
                texto += unidades[resto];
            } else if (resto < 20) { // Especiales (10-19)
                texto += especiales[resto - 10];
            } else if (resto < 30) { // Veintes (20-29)
                if (u === 0) { // 20
                    texto += 'veinte';
                } else { // 21-29
                    texto += 'veinti' + unidades[u];
                }
            } else { // Decenas (30-99)
                texto += decenas[d];
                if (u > 0) texto += ' y ' + unidades[u];
            }
        }
        return texto;
    }
    function procesarParteEntera(n) {
        if (n === 0) return 'cero';

        const millones = Math.floor(n / 1000000);
        const restoMillones = n % 1000000;
        const miles = Math.floor(restoMillones / 1000);
        const restoMiles = restoMillones % 1000;

        let texto = '';

        if (millones > 0) {
            if (millones === 1) {
                texto += 'un millón ';
            } else {
                let textoMillones = convertirMenorQueMil(millones);
                if (textoMillones.endsWith('uno')) {
                    textoMillones = textoMillones.slice(0, -1) + 'n';
                }
                texto += textoMillones + ' millones ';
            }
        }

        if (miles > 0) {
            if (miles === 1) {
                texto += 'mil ';
            } else {
                let textoMiles = convertirMenorQueMil(miles);
                if (textoMiles.endsWith('uno')) {
                    textoMiles = textoMiles.slice(0, -3) + 'ún'; // veintiuno -> veintiún
                }   
                texto += textoMiles + ' mil ';
            }
        }

        if (restoMiles > 0) texto += convertirMenorQueMil(restoMiles);

        return texto.trim();
    }

    numero = String(numero).replace(/[^0-9.]/g, '');
    if (numero === '' || isNaN(parseFloat(numero))) return '';

    const partes = numero.split('.');
    const parteEntera = parseInt(partes[0], 10);
    const parteDecimal = partes.length > 1 ? partes[1].padEnd(2, '0').substring(0, 2) : '00';

    if (isNaN(parteEntera)) return '';

    const textoEntero = procesarParteEntera(parteEntera);
    return `${textoEntero.charAt(0).toUpperCase() + textoEntero.slice(1)} con ${parteDecimal}/100`;
}
