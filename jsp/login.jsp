<%@ page import ="java.sql.*" %>
<%  
    Connection con = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    try{
        //conexiones a la base de datos
        String url ="jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        Class.forName("com.mysql.cj.jdbc.Driver");
        con = DriverManager.getConnection(url, usuario, contrasena);

        //datos del formulario
        String usuarioBD = request.getParameter("usuario");
        String password = request.getParameter("password");
        
        //validacion de los datos
        if(usuarioBD == null || usuarioBD.trim().isEmpty() || password == null || password.trim().isEmpty()){
            out.print("Todos los campos son obligatorios.");
            return;
        }

        // Búsqueda del usuario en la base de datos
        String sql = "SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?";
        ps = con.prepareStatement(sql);

        ps.setString(1, usuarioBD);
        ps.setString(2, password);

        rs = ps.executeQuery();

        if(rs.next()){
            // Si el usuario existe, se crea la sesión
            session.setAttribute("usuario", usuarioBD);
            out.print("OK");
        } else {
            // Si no se encuentra, las credenciales son incorrectas
            out.print("Usuario o contraseña incorrectos.");
        }

    } catch (Exception e) {
        out.print("Error del servidor: " + e.getMessage()); 
        e.printStackTrace(); 
    } finally {
        // Cerrar recursos
        if (rs != null) try { rs.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (ps != null) try { ps.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (con != null) try { con.close(); } catch (SQLException e) { e.printStackTrace(); }
    }

%>