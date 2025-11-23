document.addEventListener("DOMContentLoaded", () => {

    const usuarioLogueado = JSON.parse(sessionStorage.getItem("usuarioLogueado"));

    if (!usuarioLogueado || !usuarioLogueado.email) {
        alert("No hay usuario logueado");
        window.location.href = "buscarHabitacionNoLogueado.html";
        return;
    }

    // BOTÓN ATRÁS
    document.getElementById("btnAtras").addEventListener("click", () => {
        window.location.href = "principal.html";
    });

    // LOGOUT
    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

    // Abrir BD
    const abrir = indexedDB.open("VitoBadi14");

    abrir.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction("Habitacion", "readonly");
        const store = tx.objectStore("Habitacion");

        store.getAll().onsuccess = (e) => {
            let habitaciones = e.target.result;

            // Filtrar solo las del usuario logueado
            habitaciones = habitaciones.filter(h => h.emailPropietario === usuarioLogueado.email);

            
            habitaciones.sort((a, b) => a.precio - b.precio);

            mostrarResultados(habitaciones);
        };
    };

    function mostrarResultados(lista) {
        const cont = document.getElementById("resultados");
        const template = document.getElementById("templateHabitacion");

        cont.innerHTML = ""; // limpiar resultados previos

        if (lista.length === 0) {
            cont.innerHTML = "<h3>No tienes habitaciones registradas</h3>";
            return;
        }

        lista.forEach(h => {
            const clone = template.content.cloneNode(true);

            clone.querySelector(".hab-imagen").src = h.imagen || "";
            clone.querySelector(".hab-ciudad").textContent = h.ciudad;
            clone.querySelector(".hab-direccion").textContent = h.direccion;
            clone.querySelector(".hab-latitud").textContent = h.latitud;
            clone.querySelector(".hab-longitud").textContent = h.longitud;
            clone.querySelector(".hab-precio").textContent = h.precio;

            cont.appendChild(clone);
        });
    }

});
