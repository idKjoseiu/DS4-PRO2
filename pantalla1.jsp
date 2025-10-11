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
    

    <link rel="stylesheet" href="CSS/style.css">
</head>
<body>
    <!-- 1. Encabezado superior fijo -->
    <header class="encabezado">
        <button id="menu-toggle" class="btn">
            <span class="material-icons">menu</span>
        </button>
        <!--agregar el logo o el título de la app en el futuro -->
    </header>
    
    <!-- 2. Contenedor principal que incluye el menú y el contenido -->
    <div class="contenido-principal">
        <!-- 3. Menú lateral (ahora fuera del flujo normal) -->
        <aside id="menu-lateral" class="menu">
            <nav>
                <a class="opciones" href="index.html"> <span class="material-icons"> home </span> Inicio </a>
                <a class="opciones" href="pantalla1.jsp"> <span class="material-icons">account_balance</span> Conciliación Bancaria </a>
                <a class="opciones" href="cheques.jsp">  <span class="material-icons">attach_money</span> Cheques </a>

                <a class="opciones" href="proveedores.jsp">  <span class="material-icons">group</span> Proveedores </a>

                <button class="dark-mode" id="darkMode">
                    <span class="material-icons">dark_mode</span>
                </button>
            </nav>
        </aside>
        
        <!-- 4. Contenido principal -->
        <main id="main-content" class="main-contenido-principal">
            <div class="contenedor">
                <div class="headC">Conciliación Bancaria</div>
                <hr>
                <form action="" class="">
                    <label for="mes">Mes</label>
                    <select id="mes">
                        <option value="01">Enero</option>
                        <option value="02">Febrero</option>
                        <option value="03">Marzo</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Junio</option>
                        <option value="07">Julio</option>
                        <option value="08">Agosto</option>
                        <option value="09">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                    </select>

                    <label for="anio">Año</label>
                    <input id="anio" name="anio" type="date" class="form-control">

                    <button type="submit" class="btn btn-success">Realizar Conciliación</button>
                </form>
            </div>
        </main>
    </div>
    
    <!-- Script para la funcionalidad del menú (hamburguesa) -->
    <script src="js/main.js"></script>
</body>
</html>
