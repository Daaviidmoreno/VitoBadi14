document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    if (!usuario) { window.location.href = "buscarHabitacionNoLogueado.html"; return; }

    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });
    document.getElementById("btnAtras").addEventListener("click", () => window.location.href = "principal.html");
    document.getElementById("btnBuscar").addEventListener("click", buscarHabitaciones);
});

function buscarHabitaciones() {
    const ciudadSel = document.getElementById("ciudad").value;
    const fechaSel = document.getElementById("fecha").value;
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction(["Habitacion", "Alquiler"], "readonly");

        const p1 = new Promise(r => tx.objectStore("Habitacion").getAll().onsuccess = e => r(e.target.result));
        const p2 = new Promise(r => tx.objectStore("Alquiler").getAll().onsuccess = e => r(e.target.result));

        Promise.all([p1, p2]).then(([habitaciones, alquileres]) => {
            let datos = habitaciones;

            // Filtro Ciudad
            if (ciudadSel) datos = datos.filter(h => h.ciudad === ciudadSel);

            // Excluir mis propias habitaciones
            datos = datos.filter(h => h.emailPropietario !== usuario.email);

            // Filtro Fecha Real
            if (fechaSel) {
                const fechaBuscada = new Date(fechaSel);
                datos = datos.filter(h => {
                    const estaOcupada = alquileres.some(alquiler => {
                        return alquiler.idhabitacion === h.idhabitacion && new Date(alquiler.fechaFin) >= fechaBuscada;
                    });
                    return !estaOcupada;
                });
            }

            // Ordenar Precio: Menor a Mayor
            datos.sort((a, b) => a.precio - b.precio);

            mostrarResultados(datos);
        });
    };
}

function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    cont.innerHTML = "";

    if (lista.length === 0) {
        cont.innerHTML = "<h3>No hay habitaciones disponibles.</h3>";
        return;
    }

    lista.forEach(hab => {
        const card = document.createElement("div");
        card.className = "card";
        // Foto visible normal
        card.innerHTML = `
            <div class="imagen-container"><img class="hab-imagen" src="${hab.imagen || 'img/noFoto.png'}"></div>
            <p><strong>Dirección:</strong> ${hab.direccion}</p>
            <p><strong>Latitud:</strong> ${hab.latitud} | <strong>Longitud:</strong> ${hab.longitud}</p>
            <p><strong>Precio:</strong> ${hab.precio} €</p>
        `;
        cont.appendChild(card);
    });
}
