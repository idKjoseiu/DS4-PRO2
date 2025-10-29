/*document.addEventListener("DOMContentLoaded", async () => {
    // === Verificar sesión al cargar ===
    await verificarSesion();

    // === Asignar listener al botón de logout ===
    const logoutBTN = document.getElementById("logoutBTN");
    if (logoutBTN) {
        logoutBTN.addEventListener("click", async (e) => {
            e.preventDefault();
            await cerrarSesion();
        });
    }
});

// === FUNCIÓN PARA VERIFICAR SESIÓN ===
async function verificarSesion() {
    try {
        const respuesta = await fetch("jsp/verificarSesion.jsp", { cache: "no-store" });
        const texto = await respuesta.text();

        if (texto.trim() === "NO_SESSION") {
            window.location.href = "login.html"; // redirige si no hay sesión
        } else {
            console.log("Sesión activa de:", texto.trim());
            //cambiar icono o etc
            const userElement = document.querySelector("#UsuarioBTN span");
            if (userElement) userElement.textContent = texto.trim();
        }
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "login.html";
    }
}

// === FUNCIÓN PARA CERRAR SESIÓN ===
async function cerrarSesion() {
    try {
        const respuesta = await fetch("jsp/logOut.jsp", { cache: "no-store" });
        if (respuesta.ok) {
            window.location.href = "login.html"; // redirige al login
        } else {
            console.error("Error al cerrar sesión:", respuesta.status);
        }
    } catch (error) {
        console.error("Error al intentar cerrar sesión:", error);
    }
}
*/

