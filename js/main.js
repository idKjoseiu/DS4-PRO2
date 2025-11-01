document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const darkModeToggle = document.getElementById('darkMode');
    const sideMenu = document.getElementById('menu-lateral');
    const mainContent = document.getElementById('main-content');

    const isMobile = () => window.innerWidth <= 768;

    // Función para ocultar el menú
    const hideMenu = () => {
        if (isMobile()) {
            document.body.classList.remove('no-scroll');
        }
        sideMenu.classList.add('menu-hidden');
        mainContent.classList.add('content-expanded');
    };

    // Evento para el botón de hamburguesa
    menuToggle.addEventListener('click', () => {
        const isHidden = sideMenu.classList.contains('menu-hidden');
        if (isMobile()) {
            // Si el menú está oculto y se va a mostrar, bloqueamos el scroll del body.
            // Si está visible y se va a ocultar, lo desbloqueamos.
            document.body.classList.toggle('no-scroll', isHidden);
        }
        sideMenu.classList.toggle('menu-hidden');
        mainContent.classList.toggle('content-expanded');
    });

    // Resaltar la opción de menú activa y añadir evento de clic para cerrar en móvil
    const paginaActual = window.location.pathname.split("/").pop();
    const menuLinks = document.querySelectorAll('#menu-lateral .opciones');

    menuLinks.forEach(link => {
        const linkPage = link.getAttribute('href');

        // Ocultar menú al hacer clic en una opción en móvil
        link.addEventListener('click', () => {
            if (isMobile()) {
                hideMenu();
            }
        });

        if (linkPage === paginaActual) {
            link.classList.add('active');
        }
    });

    // Funcionalidad del modo oscuro
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode-active');

        // Guardar la preferencia en localStorage
        if (document.body.classList.contains('dark-mode-active')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Comprobar si el modo oscuro estaba activado en la visita anterior
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode-active');
    }

    // Ocultar el menú por defecto en la carga si es móvil
    if (isMobile()) {
        hideMenu();
    }
});