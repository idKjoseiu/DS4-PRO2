//para conversión de número a letras ---
document.addEventListener('DOMContentLoaded', function() {
    const montoInput = document.getElementById('monto');
    const montoEnLetrasInput = document.getElementById('montoAletras');

    // Si los elementos no existen, salimos
    if (!montoInput || !montoEnLetrasInput) return;

    // --- Evita la entrada de la letra 'e' en el campo de monto ---
    montoInput.addEventListener('keydown', function(event) {
        if (event.key === 'e' || event.key === 'E') {
            event.preventDefault();
        }
    });

    // --- Escucha cambios en el input de monto ---
    montoInput.addEventListener('input', function() {
        const valor = this.value;
        if (valor) {
            montoEnLetrasInput.value = convertirNumeroALetras(valor);
        } else {
            montoEnLetrasInput.value = '';
        }
    });
});

/**
 * Convierte un número a su representación en letras para cheques.
 * @param {string|number} numero - El número a convertir.
 * @returns {string} Número en letras.
 */
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
            if (resto < 10) {
                texto += unidades[resto];
            } else if (resto < 20) {
                texto += especiales[resto - 10];
            } else {
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
            if (textoMiles.endsWith('uno')) textoMiles = textoMiles.slice(0, -1) + 'n'; // veintiún mil
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
// ----------------------------------------------------------------------------------------------------------------

// para obtener los proveedores registrados
// Se ejecuta cuando todo el contenido del DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    const selectProveedor = document.getElementById('proveedor');

    // Si el elemento no existe en la página actual, no hacemos nada.
    if (!selectProveedor) return;

    // Usamos fetch para llamar al JSP que nos devuelve los proveedores
    fetch('jsp/obtenerProveedores.jsp')
        .then(response => {
            // Verificamos si la respuesta del servidor es exitosa
            if (!response.ok) {
                throw new Error('Error al cargar los proveedores. Código de estado: ' + response.status);
            }
            return response.json(); // Convertimos la respuesta a JSON
        })
        .then(proveedores => {
            // Iteramos sobre la lista de proveedores recibida
            proveedores.forEach(proveedor => {
                // Creamos un nuevo elemento <option> con valor y texto
                const option = new Option(proveedor.nombre); // Asumiendo que el proveedor tiene un 'codigo' o 'id'
                // Lo añadimos al <select>
                selectProveedor.add(option);
            });
        })
        .catch(error => {
            console.error('Hubo un problema con la operación fetch:', error);
            // Opcional: Mostrar un mensaje de error al usuario en la página
            selectProveedor.options.add(new Option('Error al cargar proveedores', ''));
        });
});

// --------------------------------------------------------------------------------------------------
// para obtener objetos de gastos
document.addEventListener('DOMContentLoaded', function() {
    const selectObjetoDeGasto = document.getElementById('objetoDeGasto');

    if (!selectObjetoDeGasto) return;

    fetch('jsp/obtenerObjetoGasto.jsp')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los objetos de gasto. Código de estado: ' + response.status);
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
            console.error('Hubo un problema con la operación fetch:', error);
            selectObjetoDeGasto.options.add(new Option('Error al cargar objetos de gasto', ''));
        });
    
});