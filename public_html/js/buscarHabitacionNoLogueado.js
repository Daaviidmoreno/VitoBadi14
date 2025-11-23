document.addEventListener("DOMContentLoaded", () => {

    // Botón Login
    document.getElementById("btnLogin").addEventListener("click", () => {
        window.location.href = "login.html";
    });

    // Botón Atrás
    document.getElementById("btnAtras").addEventListener("click", () => {
        window.history.back();
    });

    // Botón Buscar
    document.getElementById("btnBuscar").addEventListener("click", buscarHabitaciones);
});

function buscarHabitaciones() {
    const ciudadSel = document.getElementById("ciudad").value;
    const fechaSel = document.getElementById("fecha").value;

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction("Habitacion", "readonly");
        const store = tx.objectStore("Habitacion");

        store.getAll().onsuccess = function (e) {
            let datos = e.target.result;

            // Filtrar por ciudad
            if (ciudadSel) {
                datos = datos.filter(h => h.ciudad === ciudadSel);
            }

            // Filtrar por fecha si existe
            if (fechaSel) {
                const fechaBuscada = new Date(fechaSel);
                datos = datos.filter(h => !h.disponibleDesde || new Date(h.disponibleDesde) <= fechaBuscada);
            }


            datos.sort((a, b) => a.precio - b.precio);

            mostrarResultados(datos);
        };
    };
}

function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    const template = document.getElementById("templateHabitacion");

// limpia resultados previos
    cont.innerHTML = "";

    if (lista.length === 0) {
        cont.innerHTML = "<h3>No hay resultados</h3>";
        return;
    }

    lista.forEach(h => {
        const clone = template.content.cloneNode(true);

        // Asignar la foto borrosa
        const img = clone.querySelector(".hab-imagen");
        img.src = h.imagen || "img/defaultRoom.png"; // si no hay imagen, foto por defecto
        img.alt = "Imagen de habitación";

        // Ciudad y precio
        clone.querySelector(".hab-ciudad").textContent = h.ciudad;
        clone.querySelector(".hab-precio").textContent = h.precio;

        // Botón detalles lleva al login
        clone.querySelector(".btnDetalles").addEventListener("click", () => {
            window.location.href = "login.html";
        });

        cont.appendChild(clone);
    });
}
