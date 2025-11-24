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

    // Ordenar por fecha de fin
    listaAMostrar.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));

    listaAMostrar.forEach(alq => {
        const habitacion = habitaciones.find(h => h.idhabitacion === alq.idhabitacion);
        if (!habitacion) return;

        const card = document.createElement("div");
        card.className = "card";

        const imgContainer = document.createElement("div");
        imgContainer.className = "imagen-container";

        const img = document.createElement("img");
        img.className = "hab-imagen";
        img.src = habitacion.imagen || "img/noFoto.png";
        imgContainer.appendChild(img);

        const pDireccion = document.createElement("p");
        pDireccion.innerHTML = `<strong>Dirección:</strong> ${habitacion.direccion}`;

        const pPrecio = document.createElement("p");
        pPrecio.innerHTML = `<strong>Precio:</strong> ${habitacion.precio} €`;

        const pFechas = document.createElement("p");
        pFechas.classList.add("texto-fechas");
        pFechas.innerHTML = `Del <span>${alq.fechaInicio}</span> al <span>${alq.fechaFin}</span>`;

        const pExtra = document.createElement("p");
        pExtra.classList.add("texto-extra");

        if (esPropietario) {
            pExtra.textContent = `Inquilino: ${alq.emailInquilino}`;
        } else {
            pExtra.textContent = `Propietario: ${habitacion.emailPropietario}`;
        }

        card.append(imgContainer, pDireccion, pPrecio, pFechas, pExtra);
        contenedor.appendChild(card);
    });
}
