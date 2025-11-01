
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
                actualizarNumeroCheque(); // Asegura que el campo se actualice con el nuevo número
            });
        });
    }

    /* -----------------------------------------
     Para Gestion
    -----------------------------------------*/
    const formularioChequeGestion = document.getElementById('formularioChequeGestion');

    if (formularioChequeGestion) {
        const resultadoBusqueda = document.getElementById('resultadoBusquedaCheque');
        const alertaGestion = document.getElementById('alertaGestion');
        const MSGGestion = document.getElementById('MSGGestion');

        formularioChequeGestion.addEventListener('submit', function(e) {
            e.preventDefault(); // Evitamos que la página se recargue

            // Ocultamos resultados y alertas anteriores
            resultadoBusqueda.classList.add('d-none');
            alertaGestion.classList.add('d-none');

            const datosFormulario = new FormData(formularioChequeGestion);

            // Enviamos el número de cheque al JSP para buscarlo
            fetch('jsp/obtenerCheque.jsp', {
                method: 'POST',
                body: new URLSearchParams(datosFormulario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.statusText}`);
                }
                return response.json(); // Esperamos una respuesta JSON
            })
            .then(data => {
                if (data.encontrado) {
                    // Si se encontró, llenamos los campos y mostramos la sección
                    document.getElementById('resNumCheque').value = data.numeroCheque;
                    document.getElementById('resFecha').value = data.fecha;
                    document.getElementById('resProveedor').value = data.proveedor;
                    document.getElementById('resMonto').value = data.monto;

                    resultadoBusqueda.classList.remove('d-none');
                } else {
                    // Si no se encontró, mostramos una alerta de información
                    MSGGestion.textContent = data.mensaje || "No se encontró el cheque especificado.";
                    alertaGestion.className = "alert alert-info d-flex align-items-center gap-2 mt-3";
                    alertaGestion.classList.remove("d-none");
                }
            })
            .catch(error => {
                // Si hay un error en la comunicación o en el parseo, mostramos una alerta de error
                console.error('Error al buscar cheque:', error);
                MSGGestion.textContent = "Error al buscar el cheque: " + error.message;
                alertaGestion.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
            });
        });

        // --- Lógica para el botón "Sacar de Circulación" ---
        const btnSacarCirculacion = document.getElementById('btnSacarCirculacion');

        btnSacarCirculacion.addEventListener('click', function() {
            const numeroChequeInput = document.getElementById('numeroCheque');
            const numeroCheque = numeroChequeInput.value;

            if (!numeroCheque) {
                MSGGestion.textContent = "No se ha especificado un número de cheque.";
                alertaGestion.className = "alert alert-warning d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
                return;
            }

            // Enviamos el número de cheque al JSP para actualizar su estado
            fetch('jsp/sacarCirculacionCheque.jsp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `numeroCheque=${encodeURIComponent(numeroCheque)}`
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
                } else {
                    throw new Error(texto || "Respuesta inesperada del servidor.");
                }
            })
            .catch(error => {
                MSGGestion.textContent = "Error al procesar la solicitud: " + error.message;
                alertaGestion.className = "alert alert-danger d-flex align-items-center gap-2 mt-3";
                alertaGestion.classList.remove("d-none");
            });
        });
    }


    
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


});


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
