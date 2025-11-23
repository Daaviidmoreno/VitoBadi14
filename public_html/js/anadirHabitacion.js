document.addEventListener("DOMContentLoaded", () => {

    const selectCiudad = document.getElementById("ciudad");
    const direccionInput = document.createElement("input");
    direccionInput.style.marginTop = "10px";
    direccionInput.id = "direccion";
    selectCiudad.parentNode.insertBefore(direccionInput, selectCiudad.nextSibling);

    const latitud = document.getElementById("latitud");
    const longitud = document.getElementById("longitud");

    // ---------------------
    // OBTENER LAT/LON DE DIRECCIÓN REAL
    // ---------------------
    async function obtenerCoordenadas(ciudad, direccion) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ", " + ciudad)}`;
        try {
            const response = await fetch(url, { headers: { "Accept-Language": "es" } });
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error al geocodificar:", error);
            return null;
        }
    }

    direccionInput.addEventListener("blur", async () => {
        const ciudad = selectCiudad.value;
        const direccion = direccionInput.value.trim();

        if (!ciudad || !direccion) {
            latitud.value = "";
            longitud.value = "";
            return;
        }

        const coords = await obtenerCoordenadas(ciudad, direccion);

        if (coords) {
            latitud.value = coords.lat;
            longitud.value = coords.lon;
        } else {
            alert("No se pudo obtener coordenadas de esa dirección. Asegúrate de que es válida y pertenece a la ciudad seleccionada.");
            latitud.value = "";
            longitud.value = "";
        }
    });

    // ---------------------
    // DRAG & DROP IMAGEN
    // ---------------------
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    let imagenBase64 = "";

    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("hover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("hover"));
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("hover");
        procesarImagen(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener("change", () => procesarImagen(fileInput.files[0]));

    function procesarImagen(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagenBase64 = e.target.result;
            preview.src = imagenBase64;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }

    // ---------------------
    // BOTÓN ACEPTAR, GUARDAR EN BD
    // ---------------------
    document.getElementById("btnAceptar").addEventListener("click", () => {
        const ciudad = selectCiudad.value;
        const direccion = direccionInput.value.trim();
        const precio = parseInt(document.getElementById("precio").value);
        const emailProp = JSON.parse(sessionStorage.getItem("usuarioLogueado"))?.email;

        if (!emailProp) {
            alert("No hay usuario logueado");
            return;
        }

        if (!ciudad || !direccion || !latitud.value || !longitud.value || !precio || !imagenBase64) {
            alert("Rellena todos los campos correctamente");
            return;
        }

        const abrir = indexedDB.open("VitoBadi14", 1);

        abrir.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction("Habitacion", "readwrite");
            const store = tx.objectStore("Habitacion");

            store.add({
                ciudad: ciudad,
                direccion: direccion,
                latitud: parseFloat(latitud.value),
                longitud: parseFloat(longitud.value),
                precio: precio,
                imagen: imagenBase64,
                emailPropietario: emailProp
            });

            tx.oncomplete = () => {
                alert("Habitación añadida correctamente.");
                window.location.href = "principal.html";
            };
        };
    });

    // ---------------------
    // BOTÓN ATRÁS
    // ---------------------
    document.getElementById("btnAtras").addEventListener("click", () => {
        window.location.href = "principal.html";
    });

    // ---------------------
    // LOGOUT
    // ---------------------
    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

});
