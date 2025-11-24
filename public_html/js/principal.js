document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    const saludo = document.getElementById("saludoUsuario");
    const foto = document.getElementById("fotoUsuario");

    // Si no hay usuario en sesión -> fuera
    if (!usuario) {
        window.location.href = "buscarHabitacionNoLogueado.html";
        return;
    }

    // Mostrar datos del usuario directamente desde la sesión
    saludo.textContent = `Hola, ${usuario.nombre}`;
    foto.src = usuario.foto && usuario.foto !== "" ? usuario.foto : "img/defaultUser.png";

    // BOTÓN LOGOUT
    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear(); 
        window.location.href = "buscarHabitacionNoLogueado.html";
    });


    // MENÚ CONSULTAR 
    document.getElementById("btnGenerica").addEventListener("click", () => {
        window.location.href = "buscarGenerica.html";
    });

    document.getElementById("btnGeo").addEventListener("click", () => {
        window.location.href = "buscarGeolocalizacion.html";
    });

    //  MENÚ HABITACIONES 
    document.getElementById("btnAnadirHab").addEventListener("click", () => {
        window.location.href = "anadirHabitacion.html";
    });

    document.getElementById("btnMisHab").addEventListener("click", () => {
        window.location.href = "misHabitaciones.html";
    });

    //  SOLICITUDES 
    document.getElementById("btnVerSolicitudes").addEventListener("click", () => {
        window.location.href = "verSolicitudes.html";
    });

    //  ALQUILERES
    document.getElementById("btnVerAlquileres").addEventListener("click", () => {
        window.location.href = "verAlquileres.html";
    });

});
