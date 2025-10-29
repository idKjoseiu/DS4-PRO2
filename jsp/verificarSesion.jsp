<%
String usuario = (String) session.getAttribute("usuario");
if (usuario != null) {
    out.print(usuario); // Devuelve el nombre si hay sesión activa
} else {
    out.print("NO_SESSION"); // Indica que no hay sesión
}
%>
