<%@ page contentType="text/plain; charset=UTF-8" %>
<%@ page import="java.sql.*" %>
<%@ page import="java.time.LocalDate" %>
<%
    
    String url = "jdbc:mysql://localhost:3306/contable"; 
    String usuario = "root"; 
    String contrasena = ""; 

    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;

    String numeroCheque = request.getParameter("numeroCheque");

    if (numeroCheque == null || numeroCheque.trim().isEmpty()) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400 Bad Request
        out.print("Error: El número de cheque no puede estar vacío.");
        return;
    }

    try {
        // 1. Cargar el driver y establecer la conexión
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 2. Iniciar la transacción (desactivar auto-commit)
        conn.setAutoCommit(false);

        // 3. Verificar si el cheque ya fue sacado de circulación o si no existe
        String sqlSelect = "SELECT FechaFueraCirculacion FROM cheques WHERE numeroCheque = ?";
        ps = conn.prepareStatement(sqlSelect);
        ps.setString(1, numeroCheque);
        rs = ps.executeQuery();

        if (rs.next()) {
            if (rs.getDate("FechaFueraCirculacion") != null) {
                // El cheque ya tiene fecha, por lo tanto, ya fue sacado de circulación.
                conn.rollback(); 
                response.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
                out.print("El cheque N° " + numeroCheque + " ya fue sacado de circulación previamente.");
                return;
            }

            // 4. Si el cheque existe y no ha sido sacado, proceder a actualizarlo.
            String sqlUpdate = "UPDATE cheques SET FechaFueraCirculacion = ? WHERE numeroCheque = ?";
            ps.close(); // Cerrar el PreparedStatement anterior
            ps = conn.prepareStatement(sqlUpdate);
            ps.setDate(1, java.sql.Date.valueOf(LocalDate.now()));
            ps.setString(2, numeroCheque);

            int filasAfectadas = ps.executeUpdate();
            if (filasAfectadas > 0) {
                conn.commit();
                out.print("OK");
            }
        } else {
            // Si no se encontró el cheque en la consulta inicial.
            conn.rollback();
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.print("No se encontró el cheque N° " + numeroCheque + " para actualizar.");
        }

    } catch (Exception e) {
        // 7. Si hay cualquier error, revertir la transacción
        if (conn != null) try { conn.rollback(); } catch (SQLException ex) {}
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("Error en el servidor al procesar la solicitud.");
        e.printStackTrace(response.getWriter()); // Útil para depuración
    } finally {
        // 8. Cerrar recursos en el orden inverso a su apertura
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
%>