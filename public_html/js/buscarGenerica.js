document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));

    if (!usuario) {
        window.location.href = "buscarHabitacionNoLogueado.html";
        return;
    }

    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

    document.getElementById("btnAtras").addEventListener("click", () => {
        window.location.href = "principal.html";
    });

    document.getElementById("btnBuscar").addEventListener("click", buscarHabitaciones);
});

function buscarHabitaciones() {

    const ciudad = document.getElementById("ciudad").value;
    const fecha = document.getElementById("fecha").value; // por si luego haces algo con ella
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = "";

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction("Habitacion", "readonly");
        const store = tx.objectStore("Habitacion");

        const habitaciones = [];

        store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;

            if (cursor) {
                const hab = cursor.value;

                // --- FILTROS ---
                if (ciudad && hab.ciudad !== ciudad) {
                    cursor.continue();
                    return;
                }

                // NO mostrar habitaciones cuyo propietario es el usuario logueado
                if (hab.emailPropietario === usuario.email) {
                    cursor.continue();
                    return;
                }

                habitaciones.push(hab);
                cursor.continue();
            } else {
                
                habitaciones.sort((a, b) => a.precio - b.precio);
                mostrarResultados(habitaciones);
            }
        };
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

        const img = hab.imagen && hab.imagen !== "" ? hab.imagen : "img/noFoto.png";

        card.innerHTML = `
            <img src="${img}">
            <p><strong>Ciudad:</strong> ${hab.ciudad}</p>
            <p><strong>Latitud:</strong> ${hab.latitud}</p>
            <p><strong>Longitud:</strong> ${hab.longitud}</p>
            <p><strong>Precio:</strong> ${hab.precio} €</p>
        `;

        cont.appendChild(card);
    });
}
