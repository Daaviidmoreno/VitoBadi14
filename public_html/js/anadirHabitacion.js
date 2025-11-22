document.addEventListener("DOMContentLoaded", () => {

    // Coordenadas predefinidas
    const coordenadas = {
        "Vitoria": { lat: 42.846, lon: -2.672 },
        "Bilbao": { lat: 43.263, lon: -2.935 },
        "Donosti": { lat: 43.317, lon: -1.986 }
    };

    const ciudad = document.getElementById("ciudad");
    const latitud = document.getElementById("latitud");
    const longitud = document.getElementById("longitud");

    ciudad.addEventListener("change", () => {
        if (ciudad.value) {
            latitud.value = coordenadas[ciudad.value].lat;
            longitud.value = coordenadas[ciudad.value].lon;
        } else {
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

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("hover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("hover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("hover");
        procesarImagen(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener("change", () => {
        procesarImagen(fileInput.files[0]);
    });

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
    // BOTÓN ACEPTAR → GUARDAR BD
    // ---------------------
    document.getElementById("btnAceptar").addEventListener("click", () => {

        const precio = parseInt(document.getElementById("precio").value);
        const emailProp = JSON.parse(sessionStorage.getItem("usuarioLogueado"))?.email;

        if (!emailProp) {
            alert("No hay usuario logueado");
            return;
        }

        if (!ciudad.value || !precio || !imagenBase64) {
            alert("Rellena todos los campos");
            return;
        }

        const abrir = indexedDB.open("VitoBadi14", 1);

        abrir.onsuccess = (event) => {
            const db = event.target.result;

            const tx = db.transaction("Habitacion", "readwrite");
            const store = tx.objectStore("Habitacion");

            store.add({
                ciudad: ciudad.value,
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
