
document.addEventListener('DOMContentLoaded', function() {

    /* -----------------------------------------
     GENERACIÓN AUTOMÁTICA DE NÚMERO DE CHEQUE
    -----------------------------------------*/
    const numeroChequeInput = document.getElementById('NummeroCheque');

    function actualizarNumeroCheque() {
        if (!numeroChequeInput) return;

        // Llama al JSP para obtener el siguiente número de cheque desde el servidor.
        fetch('jsp/obtenerSiguienteCheque.jsp')
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo obtener el número de cheque del servidor.');
                }
                return response.text();
            })
            .then(numero => {
                numeroChequeInput.value = numero.trim();
            })
            .catch(error => {
                console.error(error);
                numeroChequeInput.value = "Error";
            });
    }
    // Llama a la función al cargar la página
    actualizarNumeroCheque();

    

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

        if (c > 0) {
            texto += centenas[c];
            if (n % 100 !== 0) texto += ' ';
        }

        const resto = n % 100;
        if (resto > 0) {
            if (resto < 10) texto += unidades[resto];
            else if (resto < 20) texto += especiales[resto - 10];
            else {
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
            texto += millones === 1 ? 'un millón ' : convertirMenorQueMil(millones).replace('uno', 'un') + ' millones ';
        }

        if (miles > 0) {
            let textoMiles = miles === 1 ? 'mil ' : convertirMenorQueMil(miles);
            if (textoMiles.endsWith('uno')) textoMiles = textoMiles.slice(0, -1) + 'n';
            texto += textoMiles + ' mil ';
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
