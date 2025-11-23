document.addEventListener('DOMContentLoaded', function () {
    crearBD();
    configurarBotones();
});

function crearBD() {
    const abrir = indexedDB.open("VitoBadi14", 1);

    abrir.onerror = function (event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    abrir.onsuccess = function (event) {
        console.log("Base de datos creada y abierta con éxito");
    };

    abrir.onupgradeneeded = function (event) {
        const db = event.target.result;

        // Tabla Usuario
        const usuarioStore = db.createObjectStore("Usuario", {keyPath: "email"});
        usuarioStore.createIndex("nombre", "nombre", {unique: false});
        usuarioStore.createIndex("contrasena", "contrasena", {unique: false});
        usuarioStore.createIndex("foto", "foto", {unique: false});

        //8 usuarios
        usuarioStore.add({email: "ana@mail.com", nombre: "Ana", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "iker@mail.com", nombre: "Iker", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "maria@mail.com", nombre: "María", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "jon@mail.com", nombre: "Jon", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "laura@mail.com", nombre: "Laura", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "david@mail.com", nombre: "David", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "sofia@mail.com", nombre: "Sofía", contrasena: "1234", foto: ""});
        usuarioStore.add({email: "pablo@mail.com", nombre: "Pablo", contrasena: "1234", foto: ""});

        // Tabla Habitacion
        const habitacionStore = db.createObjectStore("Habitacion", {keyPath: "idhabitacion", autoIncrement: true});
        habitacionStore.createIndex("ciudad", "ciudad", {unique: false});
        habitacionStore.createIndex("direccion", "direccion", {unique: false});
        habitacionStore.createIndex("latitud", "latitud", {unique: false});
        habitacionStore.createIndex("longitud", "longitud", {unique: false});
        habitacionStore.createIndex("precio", "precio", {unique: false});
        habitacionStore.createIndex("imagen", "imagen", {unique: false});
        habitacionStore.createIndex("emailPropietario", "emailPropietario", {unique: false});

        //14 habitaciones
        //10 Vitoria
        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Calle San Prudencio 5, Vitoria-Gasteiz",
            latitud: 42.84681,
            longitud: -2.67279,
            precio: 350,
            imagen: "",
            emailPropietario: "ana@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Avenida Gasteiz 12, Vitoria-Gasteiz",
            latitud: 42.84640,
            longitud: -2.68104,
            precio: 360,
            imagen: "",
            emailPropietario: "iker@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Calle Florida 20, Vitoria-Gasteiz",
            latitud: 42.84559,
            longitud: -2.67128,
            precio: 370,
            imagen: "",
            emailPropietario: "maria@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Calle Gorbea 4, Vitoria-Gasteiz",
            latitud: 42.84721,
            longitud: -2.67332,
            precio: 380,
            imagen: "",
            emailPropietario: "jon@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Calle Francia 16, Vitoria-Gasteiz",
            latitud: 42.84922,
            longitud: -2.66989,
            precio: 390,
            imagen: "",
            emailPropietario: "laura@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Portal de Legutiano 28, Vitoria-Gasteiz",
            latitud: 42.85117,
            longitud: -2.67463,
            precio: 400,
            imagen: "",
            emailPropietario: "david@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Plaza de la Virgen Blanca 1, Vitoria-Gasteiz",
            latitud: 42.84796,
            longitud: -2.67245,
            precio: 410,
            imagen: "",
            emailPropietario: "sofia@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Calle Postas 10, Vitoria-Gasteiz",
            latitud: 42.84700,
            longitud: -2.67150,
            precio: 420,
            imagen: "",
            emailPropietario: "pablo@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Calle San Prudencio 22, Vitoria-Gasteiz",
            latitud: 42.84660,
            longitud: -2.67400,
            precio: 430,
            imagen: "",
            emailPropietario: "ana@mail.com"
        });

        habitacionStore.add({
            ciudad: "Vitoria",
            direccion: "Avenida Gasteiz 48, Vitoria-Gasteiz",
            latitud: 42.84580,
            longitud: -2.68000,
            precio: 440,
            imagen: "",
            emailPropietario: "iker@mail.com"
        });

        // 2 Bilbao
        habitacionStore.add({
            ciudad: "Bilbao",
            direccion: "Gran Vía 45, Bilbao",
            latitud: 43.26229,
            longitud: -2.93559,
            precio: 480,
            imagen: "",
            emailPropietario: "maria@mail.com"
        });

        habitacionStore.add({
            ciudad: "Bilbao",
            direccion: "Calle Autonomía 18, Bilbao",
            latitud: 43.25712,
            longitud: -2.94342,
            precio: 520,
            imagen: "",
            emailPropietario: "jon@mail.com"
        });

        // 2 Donosti
        habitacionStore.add({
            ciudad: "Donosti",
            direccion: "Calle Mayor 3, Donostia",
            latitud: 43.32313,
            longitud: -1.98403,
            precio: 600,
            imagen: "",
            emailPropietario: "laura@mail.com"
        });

        habitacionStore.add({
            ciudad: "Donosti",
            direccion: "Paseo de la Concha 22, Donostia",
            latitud: 43.31492,
            longitud: -2.00038,
            precio: 580,
            imagen: "",
            emailPropietario: "sofia@mail.com"
        });



        // Tabla Alquiler
        const alquilerStore = db.createObjectStore("Alquiler", {keyPath: "idcontrato", autoIncrement: true});
        alquilerStore.createIndex("idhabitacion", "idhabitacion", {unique: false});
        alquilerStore.createIndex("emailInquilino", "emailInquilino", {unique: false});
        alquilerStore.createIndex("fechaInicio", "fechaInicio", {unique: false});
        alquilerStore.createIndex("fechaFin", "fechaFin", {unique: false});


        //Alquileres
        alquilerStore.add({idhabitacion: 2, emailInquilino: "ana@mail.com", fechaInicio: "2024-01-01", fechaFin: "2024-12-31"});
        alquilerStore.add({idhabitacion: 7, emailInquilino: "maria@mail.com", fechaInicio: "2024-02-01", fechaFin: "2024-08-31"});


        // Tabla Solicitud
        const solicitudStore = db.createObjectStore("Solicitud", {keyPath: "idsolicitud", autoIncrement: true});
        solicitudStore.createIndex("idhabitacion", "idhabitacion", {unique: false});
        solicitudStore.createIndex("emailInquilinoPosible", "emailInquilinoPosible", {unique: false});

        //solicitudes
        solicitudStore.add({idhabitacion: 1, emailInquilinoPosible: "iker@mail.com"});
        solicitudStore.add({idhabitacion: 3, emailInquilinoPosible: "sofia@mail.com"});
        solicitudStore.add({idhabitacion: 5, emailInquilinoPosible: "pablo@mail.com"});
    };
}

function configurarBotones() {
    const botonBuscar = document.getElementById('botonBuscar');
    const botonLogin = document.getElementById('botonLogin');

    botonBuscar.addEventListener('click', () => {
        window.location.href = 'buscarHabitacionNoLogueado.html';
    });

    botonLogin.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}
