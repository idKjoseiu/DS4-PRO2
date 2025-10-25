<%@ page import ="java.sql.*"%>
<%
    
    Connection con = null;
    PreparedStatement ps = null;
    
    try{
        //conexiones a la base de datos
        String url = "jdbc:mysql://localhost:3306/contable";
        String usuario = "root";
        String contrasena = "";
        Class.forName("com.mysql.cj.jdbc.Driver");
        con = DriverManager.getConnection(url, usuario, contrasena);

        // Recibimos los datos del formulario
        String nombre = request.getParameter("nombre");
        String codigo = request.getParameter("codigo");
        String RUC = request.getParameter("RUC");
        String direccion = request.getParameter("direccion");

        // 2. Validar que los datos no estén vacíos
        if(nombre == null || nombre.trim().isEmpty() || 
           codigo == null || codigo.trim().isEmpty() || 
           RUC == null || RUC.trim().isEmpty() || 
           direccion == null || direccion.trim().isEmpty()){
            out.print("Todos los campos son obligatorios.");
            return; // Detiene la ejecución del JSP
        }
        
        //Inserción de datos en la base de datos
        String sql = "INSERT INTO proveedores (Nombre, Codigo, RUC, Direccion) VALUES (?, ?, ?, ?)";
        ps = con.prepareStatement(sql);
        
        ps.setString(1, nombre);
        ps.setString(2, codigo);
        ps.setString(3, RUC);
        ps.setString(4, direccion);
        
        int filasAfectadas = ps.executeUpdate();
        
        if(filasAfectadas > 0){
            out.print("OK"); // La inserción fue exitosa
        } else {
            out.print(" No se pudo registrar el proveedor en la base de datos.");
        }

    } catch (Exception e) {
        out.print("Error del servidor: " + e.getMessage()); 
        e.printStackTrace(); 
    } finally {
        // Cerrar recursos 
        if (ps != null) try { ps.close(); } catch (SQLException e) { e.printStackTrace(); }
        if (con != null) try { con.close(); } catch (SQLException e) { e.printStackTrace(); }
    }

%>