document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    const saludo = document.getElementById("saludoUsuario");
    const foto = document.getElementById("fotoUsuario");

    // Si no hay usuario en sesión → fuera
    if (!usuario) {
        window.location.href = "buscarHabitacionNoLogueado.html";
        return;
    }

    // Mostrar datos del usuario directamente desde la sesión
    saludo.textContent = `Hola, ${usuario.nombre}`;
    foto.src = usuario.foto && usuario.foto !== "" ? usuario.foto : "img/defaultUser.png";

    // BOTÓN LOGOUT
    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear(); // borrar sesión por completo
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

});
