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

    cargarAlquileres(usuario);
});

function cargarAlquileres(usuario) {
    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = (e) => {
        const db = e.target.result;

        Promise.all([
            getAll(db, "Habitacion"),
            getAll(db, "Alquiler")
        ]).then(([habitaciones, alquileres]) => {
            renderizar(usuario, habitaciones, alquileres);
        });
    };
}

function getAll(db, storeName) {
    return new Promise(resolve => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        store.getAll().onsuccess = e => resolve(e.target.result);
    });
}

function renderizar(usuario, habitaciones, alquileres) {
    const contenedor = document.getElementById("resultados");
    const titulo = document.getElementById("tituloPagina");
    contenedor.innerHTML = "";

    // Verificar si es propietario
    const misHabitaciones = habitaciones.filter(h => h.emailPropietario === usuario.email);
    const esPropietario = misHabitaciones.length > 0;

    let listaAMostrar = [];

    if (esPropietario) {
        titulo.textContent = "Alquileres en mis Propiedades";
        const misIds = misHabitaciones.map(h => h.idhabitacion);
        listaAMostrar = alquileres.filter(a => misIds.includes(a.idhabitacion));
    } else {
        titulo.textContent = "Mis Alquileres (Inquilino)";
        listaAMostrar = alquileres.filter(a => a.emailInquilino === usuario.email);
    }

    if (listaAMostrar.length === 0) {
        const mensaje = document.createElement("h3");
        mensaje.textContent = "No hay alquileres registrados.";
        contenedor.appendChild(mensaje);
        return;
    }

    // Ordenar por fecha fin
    listaAMostrar.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));

    listaAMostrar.forEach(alq => {
        const habitacion = habitaciones.find(h => h.idhabitacion === alq.idhabitacion);
        if (!habitacion) return;

        // Crear tarjeta
        const card = document.createElement("div");
        card.className = "card";

        // Imagen
        const imgContainer = document.createElement("div");
        imgContainer.className = "imagen-container";
        const img = document.createElement("img");
        img.className = "hab-imagen";
        img.src = habitacion.imagen || "img/noFoto.png";
        imgContainer.appendChild(img);

        // Dirección
        const pDireccion = document.createElement("p");
        pDireccion.innerHTML = `<strong>Dirección:</strong> ${habitacion.direccion}`;

        // Precio
        const pPrecio = document.createElement("p");
        pPrecio.innerHTML = `<strong>Precio:</strong> ${habitacion.precio} €`;

        // Fechas
        const pFechas = document.createElement("p");
        pFechas.style.color = "#555";
        pFechas.innerHTML = `Del <span>${alq.fechaInicio}</span> al <span>${alq.fechaFin}</span>`;

        // Extra (Propietario o Inquilino)
        const pExtra = document.createElement("p");
        pExtra.style.fontWeight = "bold";
        pExtra.style.color = "#4e60dd";
        if (esPropietario) {
            pExtra.textContent = `Inquilino: ${alq.emailInquilino}`;
        } else {
            pExtra.textContent = `Propietario: ${habitacion.emailPropietario}`;
        }

        // Añadir elementos a la tarjeta
        card.append(imgContainer, pDireccion, pPrecio, pFechas, pExtra);

        // Añadir tarjeta al contenedor
        contenedor.appendChild(card);
    });
}
