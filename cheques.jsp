<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conciliación Bancaria</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <!-- iconos de google -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined&display=swap" rel="stylesheet">

    <!-- Bootstrap/ css -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <link rel="stylesheet" href="CSS/style.css">
</head>
<body>
    <div class ="flex gap-[2%] flex-wrap content-start flex-row">

        <!-- Este div actúa como un espaciador superior invisible -->
        <div class="w-full h-[60px]"></div>
        <!-- MENU DE NAVEGACIÓN LATERAL -->
        <div class ="menu" >
            <nav>
                <a class ="opciones" href="pantalla1.jsp"> <span class="material-icons">account_balance</span> 
                Conciliación Bancaria 
                </a>
                
                <a class ="opciones" href="cheques.jsp">  <span class ="material-icons">attach_money</span>
                Cheques
                </a>

                <!-- Botón de Modo Oscuro -->
                <div class="dark-mode-toggle">
                    <span class="material-icons">dark_mode</span>
                </div>
            </nav>
        </div>
    </div>

    <script>
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        const body = document.body;

        // Función para aplicar el modo guardado
        const applyDarkMode = () => {
            if (localStorage.getItem('darkMode') === 'enabled') {
                body.classList.add('dark-mode');
                darkModeToggle.querySelector('.material-icons').textContent = 'light_mode';
            }
        };

        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDarkMode = body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            darkModeToggle.querySelector('.material-icons').textContent = isDarkMode ? 'light_mode' : 'dark_mode';
        });

        // Aplicar el modo oscuro al cargar la página
        applyDarkMode();
    </script>
</body>
</html>