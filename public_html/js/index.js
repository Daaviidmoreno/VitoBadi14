document.addEventListener('DOMContentLoaded', function() {
    crearBD();
    configurarBotones();
});

function crearBD() {
    const abrir = indexedDB.open("VitoBadi14", 1);

    abrir.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    abrir.onsuccess = function(event) {
        console.log("Base de datos creada y abierta con éxito");
    };

    abrir.onupgradeneeded = function(event) {
        const db = event.target.result;

        // Tabla Usuario
        const usuarioStore = db.createObjectStore("Usuario", { keyPath: "email" });
        usuarioStore.createIndex("nombre", "nombre", { unique: false });
        usuarioStore.createIndex("contrasena", "contrasena", { unique: false });
        usuarioStore.createIndex("foto", "foto", { unique: false });

        // Tabla Habitacion
        const habitacionStore = db.createObjectStore("Habitacion", { keyPath: "idhabitacion", autoIncrement: true });
        habitacionStore.createIndex("direccion", "direccion", { unique: false });
        habitacionStore.createIndex("latitud", "latitud", { unique: false });
        habitacionStore.createIndex("longitud", "longitud", { unique: false });
        habitacionStore.createIndex("precio", "precio", { unique: false });
        habitacionStore.createIndex("imagen", "imagen", { unique: false });
        habitacionStore.createIndex("emailPropietario", "emailPropietario", { unique: false });

        // Tabla Alquiler
        const alquilerStore = db.createObjectStore("Alquiler", { keyPath: "idcontrato", autoIncrement: true });
        alquilerStore.createIndex("idhabitacion", "idhabitacion", { unique: false });
        alquilerStore.createIndex("emailInquilino", "emailInquilino", { unique: false });
        alquilerStore.createIndex("fechaInicio", "fechaInicio", { unique: false });
        alquilerStore.createIndex("fechaFin", "fechaFin", { unique: false });

        // Tabla Solicitud
        const solicitudStore = db.createObjectStore("Solicitud", { keyPath: "idsolicitud", autoIncrement: true });
        solicitudStore.createIndex("idhabitacion", "idhabitacion", { unique: false });
        solicitudStore.createIndex("emailInquilinoPosible", "emailInquilinoPosible", { unique: false });
    };
}

function configurarBotones() {
    const botonBuscar = document.getElementById('botonBuscar');
    const botonLogin = document.getElementById('botonLogin');

    botonBuscar.addEventListener('click', () => {
        window.location.href = 'buscarhabitacionnologueado.html';
    });

    botonLogin.addEventListener('click', () => {
        window.location.href = 'iniciosesion.html';
    });
}
