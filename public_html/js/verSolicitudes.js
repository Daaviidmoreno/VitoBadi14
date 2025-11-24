document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    if (!usuario) { 
        window.location.href = "login.html"; 
        return; 
    }

    // Botones
    document.getElementById("btnAtras").addEventListener("click", () => window.location.href = "principal.html");
    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

    cargarSolicitudes(usuario);
});

function cargarSolicitudes(usuario) {
    const req = indexedDB.open("VitoBadi14");
    req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(["Habitacion", "Solicitud", "Usuario"], "readonly");
        
        Promise.all([
            getAll(tx.objectStore("Habitacion")),
            getAll(tx.objectStore("Solicitud")),
            getAll(tx.objectStore("Usuario"))
        ]).then(([habitaciones, solicitudes, usuarios]) => {
            renderizar(usuario, habitaciones, solicitudes, usuarios);
        });
    };
}

function getAll(store) {
    return new Promise(resolve => store.getAll().onsuccess = e => resolve(e.target.result));
}

function renderizar(usuario, habitaciones, solicitudes, usuarios) {
    const contenedor = document.getElementById("resultados");
    const titulo = document.getElementById("tituloPagina");
    contenedor.innerHTML = "";

    const misHabitaciones = habitaciones.filter(h => h.emailPropietario === usuario.email);
    const esPropietario = misHabitaciones.length > 0;

    let lista = [];

    if (esPropietario) {
        titulo.textContent = "Solicitudes Recibidas";
        const misIds = misHabitaciones.map(h => h.idhabitacion);
        lista = solicitudes.filter(s => misIds.includes(s.idhabitacion));
    } else {
        titulo.textContent = "Mis Solicitudes Enviadas";
        lista = solicitudes.filter(s => s.emailInquilinoPosible === usuario.email);
    }

    if (lista.length === 0) {
        const mensaje = document.createElement("h3");
        mensaje.textContent = "No hay solicitudes.";
        contenedor.appendChild(mensaje);
        return;
    }

    lista.forEach(sol => {
        const hab = habitaciones.find(h => h.idhabitacion === sol.idhabitacion);
        if (!hab) return;

        // Crear tarjeta
        const card = document.createElement("div");
        card.className = "card";

        // Imagen
        const imgContainer = document.createElement("div");
        imgContainer.className = "imagen-container";
        const img = document.createElement("img");
        img.className = "hab-imagen";
        img.src = hab.imagen || "img/noFoto.png";
        imgContainer.appendChild(img);

        // Dirección
        const pDireccion = document.createElement("p");
        pDireccion.innerHTML = `<strong>Dirección:</strong> ${hab.direccion}`;

        // Precio
        const pPrecio = document.createElement("p");
        pPrecio.innerHTML = `<strong>Precio:</strong> ${hab.precio} €`;

        card.append(imgContainer, pDireccion, pPrecio);

        if (esPropietario) {
            // Botón para ver inquilino
            const btnDetalle = document.createElement("button");
            btnDetalle.className = "btn-detalle";
            btnDetalle.textContent = "Ver posible inquilino";

            btnDetalle.addEventListener("click", () => {
                const inquilino = usuarios.find(u => u.email === sol.emailInquilinoPosible);
                if (inquilino) {
                    alert(`Detalles del Inquilino:\n\nNombre: ${inquilino.nombre}\nEmail: ${inquilino.email}`);
                } else {
                    alert("Usuario no encontrado");
                }
            });

            card.appendChild(btnDetalle);
        } else {
            const pPropietario = document.createElement("p");
            pPropietario.innerHTML = `<strong>Propietario:</strong> ${hab.emailPropietario}`;
            card.appendChild(pPropietario);
        }

        contenedor.appendChild(card);
    });
}
