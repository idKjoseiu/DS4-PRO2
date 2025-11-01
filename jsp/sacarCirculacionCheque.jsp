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
    String fechaFueraCirculacionStr = request.getParameter("fechaFueraCirculacion");
    String detalles = request.getParameter("detalles");

    if (numeroCheque == null || numeroCheque.trim().isEmpty()) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400 Bad Request
        out.print("Error: El número de cheque no puede estar vacío.");
        return;
    }

    if (fechaFueraCirculacionStr == null || fechaFueraCirculacionStr.trim().isEmpty()) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        out.print("Error: La fecha de retiro no puede estar vacía.");
        return;
    }

    try {
        // 1. Cargar el driver y establecer la conexión
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, usuario, contrasena);

        // 2. Iniciar la transacción (desactivar auto-commit)
        conn.setAutoCommit(false);

        // 3. Verificar si el cheque ya fue sacado de circulación previamente
        String sqlCheck = "SELECT NumeroCheque FROM cheques_fueracirculacion WHERE NumeroCheque = ?";
        ps = conn.prepareStatement(sqlCheck);
        ps.setString(1, numeroCheque);
        rs = ps.executeQuery();
        if (rs.next()) {
            conn.rollback();
            response.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
            out.print("El cheque N° " + numeroCheque + " ya fue sacado de circulación previamente.");
            return;
        }
        rs.close();
        ps.close();

        // 4. Obtener los datos completos del cheque original
        String sqlSelect = "SELECT FechaEmision, Proveedor, ObjetoDeGasto, Detalles, Monto FROM cheques WHERE NumeroCheque = ?";
        ps = conn.prepareStatement(sqlSelect);
        ps.setString(1, numeroCheque);
        rs = ps.executeQuery();

        if (rs.next()) {
            // Guardamos los datos del cheque encontrado
            Date fechaEmision = rs.getDate("FechaEmision");
            String proveedor = rs.getString("Proveedor");
            String objetoGasto = rs.getString("ObjetoDeGasto");
            String detalleCheque = rs.getString("Detalles");
            double monto = rs.getDouble("Monto");
            ps.close(); // Cerramos el PreparedStatement de la consulta

            // 5. Insertar el registro en la tabla de historial 'cheques_fueracirculacion'
            String sqlInsert = "INSERT INTO cheques_fueracirculacion (NumeroCheque, FechaEmision, Proveedor, ObjetoDeGasto, Detalle, Monto, FechaFueraCirculacion, Observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(sqlInsert);
            ps.setString(1, numeroCheque);
            ps.setDate(2, fechaEmision);
            ps.setString(3, proveedor);
            ps.setString(4, objetoGasto);
            ps.setString(5, detalleCheque);
            ps.setDouble(6, monto);
            ps.setDate(7, java.sql.Date.valueOf(fechaFueraCirculacionStr));
            ps.setString(8, detalles); // 'detalles' del modal va a la columna 'Observacion'
            int filasInsert = ps.executeUpdate();
            ps.close();

            if (filasInsert > 0) {
                // 6. Si la inserción fue exitosa, confirmar
                conn.commit(); // <-- Confirmar transacción
                out.print("OK"); // <-- Enviar respuesta exitosa al cliente
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