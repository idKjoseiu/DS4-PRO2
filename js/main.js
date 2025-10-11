document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('menu-lateral');
    const mainContent = document.getElementById('main-content');

    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('menu-hidden');
        mainContent.classList.toggle('content-expanded');
    });
});