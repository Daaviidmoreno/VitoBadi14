document.addEventListener("DOMContentLoaded", () => {
    // Evitar seleccionar fechas pasadas
    const fechaInput = document.getElementById("fecha");
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.setAttribute("min", hoy);

    document.getElementById("btnLogin").addEventListener("click", () => window.location.href = "login.html");
    document.getElementById("btnAtras").addEventListener("click", () => window.history.back());
    document.getElementById("btnBuscar").addEventListener("click", buscarHabitaciones);
});

function buscarHabitaciones() {
    const ciudadSel = document.getElementById("ciudad").value;
    const fechaSel = document.getElementById("fecha").value;

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function(event) {
        const db = event.target.result;
        const tx = db.transaction(["Habitacion", "Alquiler"], "readonly");

        const p1 = new Promise(r => tx.objectStore("Habitacion").getAll().onsuccess = e => r(e.target.result));
        const p2 = new Promise(r => tx.objectStore("Alquiler").getAll().onsuccess = e => r(e.target.result));

        Promise.all([p1, p2]).then(([habitaciones, alquileres]) => {
            let datos = habitaciones;

            // Filtro por ciudad
            if (ciudadSel) datos = datos.filter(h => h.ciudad === ciudadSel);

            // Filtro por fecha
            if (fechaSel) {
                const fechaBuscada = new Date(fechaSel);
                datos = datos.filter(h => {
                    const estaOcupada = alquileres.some(alquiler => 
                        alquiler.idhabitacion === h.idhabitacion && new Date(alquiler.fechaFin) >= fechaBuscada
                    );
                    return !estaOcupada;
                });
            }

            // Ordenar por precio
            datos.sort((a, b) => a.precio - b.precio);

            mostrarResultados(datos);
        });
    };
}

function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    cont.innerHTML = "";

    if (lista.length === 0) {
        const mensaje = document.createElement("h3");
        mensaje.textContent = "No hay resultados disponibles.";
        cont.appendChild(mensaje);
        return;
    }

    lista.forEach(h => {
        const card = document.createElement("div");
        card.className = "card";

        const imgContainer = document.createElement("div");
        imgContainer.className = "imagen-container";
        const img = document.createElement("img");
        img.className = "hab-imagen";
        img.src = h.imagen || "img/noFoto.png";
        imgContainer.appendChild(img);

        const pCiudad = document.createElement("p");
        pCiudad.innerHTML = `<strong>Dirección:</strong> ${h.direccion}`;

        const pPrecio = document.createElement("p");
        pPrecio.innerHTML = `<strong>Precio:</strong> ${h.precio} €`;

        const btn = document.createElement("button");
        btn.textContent = "Ver detalles";
        btn.className = "btnDetalles";
        btn.addEventListener("click", () => window.location.href = "login.html");

        card.append(imgContainer, pCiudad, pPrecio, btn);
        cont.appendChild(card);
    });
}
