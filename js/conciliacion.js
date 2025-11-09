document.addEventListener('DOMContentLoaded', function() {

    // Crear un elemento para mostrar alertas de conciliación
    const alertaConciliacion = document.createElement('div');
    alertaConciliacion.id = 'alertaConciliacion';
    alertaConciliacion.className = 'alert d-none mt-3';
    alertaConciliacion.setAttribute('role', 'alert');
    
    // Insertar la alerta después de la tabla
    const tablas = document.querySelector('.table-responsive');
    if (tablas) tablas.insertAdjacentElement('afterend', alertaConciliacion);

    const formulario = document.getElementById('formularioConciliacion');

    // Función para formatear números como moneda
    function formatearMoneda(valor) {
        // Asegurarse de que el valor es un número antes de formatear
        const numero = parseFloat(valor);
        if (isNaN(numero)) {
            return '$ 0.00';
        }
        return '$ ' + numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Función para parsear un valor monetario a número
    function parsearMoneda(valor) {
        if (typeof valor !== 'string') {
            return parseFloat(valor) || 0;
        }
        // Elimina el signo de dólar, comas y espacios en blanco
        const valorLimpio = valor.replace(/[$,\s]/g, '');
        return parseFloat(valorLimpio) || 0;
    }

    // Función para calcular los subtotales y totales
    function calcularConciliacion() {
        // Obtener valores de los inputs
        const saldoLibro = parsearMoneda(document.getElementById('saldoLibro').dataset.valor);
        const deposito = parsearMoneda(document.getElementById('deposito').dataset.valor);
        const chequesAnulados = parsearMoneda(document.getElementById('chequesAnulados').dataset.valor);
        const chequesGirados = parsearMoneda(document.getElementById('chequesGirados').dataset.valor);
        const saldoBanco = parsearMoneda(document.getElementById('saldoBanco').value);
        const depositoTransito = parsearMoneda(document.getElementById('depositoTransito').dataset.valor);
        const chequesCirculacion = parsearMoneda(document.getElementById('chequesCirculacion').dataset.valor);

        // --- Cálculos para la sección "Según Libros" ---
        const subtotal1 = saldoLibro + deposito + chequesAnulados;
        const saldoConciliadoLibros = subtotal1 - chequesGirados;

        // --- Cálculos para la sección "Según Banco" ---
        const saldoConciliadoBanco = saldoBanco + depositoTransito - chequesCirculacion;

        // Actualizar los inputs con los cálculos
        document.querySelector('input[name="subtotal1"]').value = formatearMoneda(subtotal1);
        document.getElementById('saldoConciliado').value = formatearMoneda(saldoConciliadoLibros);
        
        // El subtotal de la sección banco es solo una referencia visual, el cálculo final es el importante.
        // Por consistencia, lo calculamos como saldoBanco + depositoTransito
        const subtotal3 = saldoBanco + depositoTransito;
        document.querySelector('input[name="subtotal3"]').value = formatearMoneda(subtotal3);

        document.getElementById('saldoConciliadoBanco').value = formatearMoneda(saldoConciliadoBanco);

        // --- Verificación de conciliación ---
        const diferencia = saldoConciliadoLibros - saldoConciliadoBanco;

        // Usamos una pequeña tolerancia para evitar errores de punto flotante
        if (Math.abs(diferencia) > 0.001) {
            alertaConciliacion.textContent = `Diferencia en conciliación: ${formatearMoneda(diferencia)}. Los saldos no coinciden.`;
            alertaConciliacion.className = 'alert alert-danger mt-3';
            alertaConciliacion.classList.remove('d-none');
        } else {
            alertaConciliacion.textContent = '¡Conciliación correcta! Los saldos coinciden.';
            alertaConciliacion.className = 'alert alert-success mt-3';
            alertaConciliacion.classList.remove('d-none');
        }
    }

    // Función para actualizar las fechas en los labels de la tabla
    function actualizarFechasLabels(mes, anio) {
        // mes es 1-12, anio es YYYY
        const mesSeleccionado = parseInt(mes, 10);
        const anioSeleccionado = parseInt(anio, 10);
        const mesesEnEspanol = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        
        // Función auxiliar para formatear la fecha en texto
        const formatearFechaEnTexto = (fecha) => {
            const dia = fecha.getDate();
            const nombreMes = mesesEnEspanol[fecha.getMonth()]; // getMonth() es 0-11
            const anioFecha = fecha.getFullYear();
            return `${dia} DE ${nombreMes} DE ${anioFecha}`;
        };
        
        // Fecha de cierre del mes de la conciliación (mes "actual")
        // new Date(año, mes, 0) nos da el último día del mes anterior al 'mes'.
        // Como 'mes' es 1-12, new Date(anio, mes, 0) nos da el último día del mes seleccionado.
        const fechaCierreActual = new Date(anioSeleccionado, mesSeleccionado, 0);
        const fechaActualStr = formatearFechaEnTexto(fechaCierreActual);
        
        // Fecha de cierre del mes anterior
        // Usamos el mes seleccionado como día 0 para obtener el último día del mes anterior.
        const fechaCierreAnterior = new Date(anioSeleccionado, mesSeleccionado - 1, 0);
        const fechaAnteriorStr = formatearFechaEnTexto(fechaCierreAnterior);

        // Actualizar los textos en los spans
        document.getElementById('fechaSaldoLibro').textContent = fechaAnteriorStr;
        document.getElementById('fechaSaldoBanco').textContent = fechaActualStr;
        document.getElementById('fechaSaldoConciliadoLibros').textContent = fechaActualStr;
        document.getElementById('fechaSaldoConciliadoBancoLabel').textContent = fechaActualStr;
    }
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que la página se recargue

            const datosFormulario = new FormData(formulario);

            // Primero, actualizamos las fechas en los labels
            actualizarFechasLabels(datosFormulario.get('mes'), datosFormulario.get('anio'));

            // Luego, obtenemos los datos de conciliación
            fetch('jsp/obtenerDatosConciliacion.jsp', {
                method: 'POST',
                body: new URLSearchParams(datosFormulario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor.');
                }
                return response.json();
            })
            .then(data => {
                // Imprimir los datos recibidos en la consola para depuración
                console.log('Datos recibidos para la conciliación:', data);

                // Guardamos los valores numéricos en un atributo 'data-valor' y mostramos el formato de moneda
                document.getElementById('saldoLibro').value = formatearMoneda(data.saldoLibro);
                document.getElementById('saldoLibro').dataset.valor = data.saldoLibro;

                document.getElementById('deposito').value = formatearMoneda(data.deposito);
                document.getElementById('deposito').dataset.valor = data.deposito;

                document.getElementById('chequesAnulados').value = formatearMoneda(data.chequesAnulados);
                document.getElementById('chequesAnulados').dataset.valor = data.chequesAnulados;

                document.getElementById('chequesGirados').value = formatearMoneda(data.chequesGirados);
                document.getElementById('chequesGirados').dataset.valor = data.chequesGirados;

                document.getElementById('depositoTransito').value = formatearMoneda(data.depositoTransito);
                document.getElementById('depositoTransito').dataset.valor = data.depositoTransito;

                document.getElementById('chequesCirculacion').value = formatearMoneda(data.chequesCirculacion);
                document.getElementById('chequesCirculacion').dataset.valor = data.chequesCirculacion;

                // Una vez poblados los datos, realizamos el cálculo
                calcularConciliacion();
      
            })
            .catch(error => {
                console.error('Error al obtener los datos de conciliación:', error);
                alert('No se pudieron cargar los datos para la conciliación. Revise la consola para más detalles.');
            });
        });
    }

    // El único campo que el usuario puede cambiar y que debe recalcular todo es el saldo del banco.
    const saldoBancoInput = document.getElementById('saldoBanco');
    saldoBancoInput.addEventListener('input', function() {
        // Recalcula todo cuando el usuario escribe en el saldo del banco
        calcularConciliacion();
    });
    // También formatea el valor cuando el usuario deja de editar el campo
    saldoBancoInput.addEventListener('blur', () => saldoBancoInput.value = formatearMoneda(parsearMoneda(saldoBancoInput.value)));

});