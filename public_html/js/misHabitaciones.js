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

            // Ordenar por precio
            habitaciones.sort((a, b) => a.precio - b.precio);

            mostrarResultados(habitaciones);
        };
    };

    function mostrarResultados(lista) {
        const cont = document.getElementById("resultados");
        cont.innerHTML = ""; // limpiar resultados previos

        if (lista.length === 0) {
            const mensaje = document.createElement("h3");
            mensaje.textContent = "No tienes habitaciones registradas";
            cont.appendChild(mensaje);
            return;
        }

        lista.forEach(h => {
            // Crear tarjeta
            const card = document.createElement("div");
            card.className = "card";

            // Imagen
            const imgContainer = document.createElement("div");
            imgContainer.className = "imagen-container";
            const img = document.createElement("img");
            img.className = "hab-imagen";
            img.src = h.imagen || "";
            imgContainer.appendChild(img);

            // Ciudad
            const pCiudad = document.createElement("p");
            pCiudad.innerHTML = `<strong>Ciudad:</strong> ${h.ciudad}`;

            // Dirección
            const pDireccion = document.createElement("p");
            pDireccion.innerHTML = `<strong>Dirección:</strong> ${h.direccion}`;

            // Latitud
            const pLatitud = document.createElement("p");
            pLatitud.innerHTML = `<strong>Latitud:</strong> ${h.latitud}`;

            // Longitud
            const pLongitud = document.createElement("p");
            pLongitud.innerHTML = `<strong>Longitud:</strong> ${h.longitud}`;

            // Precio
            const pPrecio = document.createElement("p");
            pPrecio.innerHTML = `<strong>Precio:</strong> ${h.precio} €`;

            // Añadir todo a la tarjeta
            card.append(imgContainer, pCiudad, pDireccion, pLatitud, pLongitud, pPrecio);

            // Añadir tarjeta al contenedor
            cont.appendChild(card);
        });
    }

});
