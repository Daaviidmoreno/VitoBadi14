document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnLogin").addEventListener("click", () => {
        window.location.href = "login.html";
    });

    document.getElementById("btnBuscar").addEventListener("click", buscarHabitaciones);

    document.getElementById("btnAtras").addEventListener("click", () => {
        window.history.back();
    });

});

function buscarHabitaciones() {
    const ciudadSel = document.getElementById("ciudad").value;
    const fechaSel = document.getElementById("fecha").value;

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction("Habitacion", "readonly");
        const store = tx.objectStore("Habitacion");

        store.getAll().onsuccess = e => {
            let datos = e.target.result;

            // Filtrar por ciudad
            datos = datos.filter(h => h.ciudad === ciudadSel);

            // Filtrar por fecha si existe
            if (fechaSel) {
                const fechaBuscada = new Date(fechaSel);
                datos = datos.filter(h => !h.disponibleDesde || new Date(h.disponibleDesde) <= fechaBuscada);
            }

            // Ordenar de mayor a menor precio
            datos.sort((a, b) => b.precio - a.precio);

            mostrarResultados(datos);
        };
    };
}

function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    const template = document.getElementById("templateHabitacion");

    cont.innerHTML = ""; // limpia resultados previos

    if (lista.length === 0) {
        cont.innerHTML = "<h3>No hay resultados</h3>";
        return;
    }

    lista.forEach(h => {
        const clone = template.content.cloneNode(true);

        clone.querySelector(".hab-id").textContent = h.idhabitacion;
        clone.querySelector(".hab-ciudad").textContent = h.ciudad;
        clone.querySelector(".hab-precio").textContent = h.precio;

        clone.querySelector(".btnDetalles").addEventListener("click", () => {
            window.location.href = "login.html";
        });

        cont.appendChild(clone);
    });
}
