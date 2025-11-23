document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnLogin").addEventListener("click", () => window.location.href = "login.html");
    document.getElementById("btnAtras").addEventListener("click", () => window.history.back());
    document.getElementById("btnBuscar").addEventListener("click", buscarHabitaciones);
});

function buscarHabitaciones() {
    const ciudadSel = document.getElementById("ciudad").value;
    const fechaSel = document.getElementById("fecha").value;

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function (event) {
        const db = event.target.result;
        // Abrir transacción múltiple para cruzar datos
        const tx = db.transaction(["Habitacion", "Alquiler"], "readonly");
        
        const p1 = new Promise(r => tx.objectStore("Habitacion").getAll().onsuccess = e => r(e.target.result));
        const p2 = new Promise(r => tx.objectStore("Alquiler").getAll().onsuccess = e => r(e.target.result));

        Promise.all([p1, p2]).then(([habitaciones, alquileres]) => {
            let datos = habitaciones;

            // 1. Filtro Ciudad
            if (ciudadSel) {
                datos = datos.filter(h => h.ciudad === ciudadSel);
            }

            // 2. Filtro Fecha (Cruzar con Alquileres)
            if (fechaSel) {
                const fechaBuscada = new Date(fechaSel);
                datos = datos.filter(h => {
                    // ¿Tiene algún alquiler que termine DESPUÉS de mi fecha de entrada?
                    const estaOcupada = alquileres.some(alquiler => {
                        return alquiler.idhabitacion === h.idhabitacion && new Date(alquiler.fechaFin) >= fechaBuscada;
                    });
                    return !estaOcupada; // Si no está ocupada, la mostramos
                });
            }

            // 3. Ordenar Precio: Menor a Mayor
            datos.sort((a, b) => a.precio - b.precio);

            mostrarResultados(datos);
        });
    };
}

function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    const template = document.getElementById("templateHabitacion");
    cont.innerHTML = "";

    if (lista.length === 0) {
        cont.innerHTML = "<h3>No hay resultados disponibles.</h3>";
        return;
    }

    lista.forEach(h => {
        const clone = template.content.cloneNode(true);
        
        // Imagen borrosa para no logueados
        const img = clone.querySelector(".hab-imagen");
        img.src = h.imagen || "img/noFoto.png"; 
        
        clone.querySelector(".hab-ciudad").textContent = h.direccion; 
        clone.querySelector(".hab-precio").textContent = h.precio;

        clone.querySelector(".btnDetalles").addEventListener("click", () => {
            window.location.href = "login.html";
        });

        cont.appendChild(clone);
    });
}