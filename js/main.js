document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const darkModeToggle = document.getElementById('darkMode');
    const sideMenu = document.getElementById('menu-lateral');
    const mainContent = document.getElementById('main-content');

    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('menu-hidden');
        mainContent.classList.toggle('content-expanded');
    });

    // Resaltar la opción de menú activa
    const paginaActual = window.location.pathname.split("/").pop();
    const menuLinks = document.querySelectorAll('#menu-lateral .opciones');

    menuLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
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
});