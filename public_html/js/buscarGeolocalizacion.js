let mapaLeaflet = null;

document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    if (!usuario) { 
        window.location.href = "login.html"; 
        return; 
    }

    document.getElementById("btnAtras").addEventListener("click", () =>
        window.location.href = "principal.html"
    );

    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

    document.getElementById("btnBuscar").addEventListener("click", iniciarBusqueda);
});

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function geocodificar(direccion) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (e) { console.error(e); }
    return null;
}

async function iniciarBusqueda() {
    const dir = document.getElementById("direccionInput").value;
    const radio = parseFloat(document.querySelector("input[name='radio']:checked").value);
    const estado = document.getElementById("estadoBusqueda");

    if (!dir) { alert("Introduce una dirección"); return; }

    estado.textContent = "Buscando...";

    const centro = await geocodificar(dir);

    if (!centro) {
        estado.textContent = "Dirección no encontrada.";
        return;
    }

    estado.textContent = `Resultados en ${radio} km alrededor de: ${dir}`;

    if (mapaLeaflet) mapaLeaflet.remove();

    mapaLeaflet = L.map("mapa").setView([centro.lat, centro.lon], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(mapaLeaflet);

    L.circle([centro.lat, centro.lon], {
        color: "blue",
        fillColor: "#30f",
        fillOpacity: 0.1,
        radius: radio * 1000
    }).addTo(mapaLeaflet);

    L.marker([centro.lat, centro.lon])
        .addTo(mapaLeaflet)
        .bindPopup("<b>Tu búsqueda</b><br>" + dir)
        .openPopup();

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(["Habitacion", "Alquiler"], "readonly");

        Promise.all([
            getAll(tx.objectStore("Habitacion")),
            getAll(tx.objectStore("Alquiler"))
        ]).then(([habitaciones, alquileres]) => {

            let count = 0;

            habitaciones.forEach(hab => {
                if (hab.latitud && hab.longitud) {

                    const dist = calcularDistancia(
                        centro.lat, centro.lon,
                        hab.latitud, hab.longitud
                    );

                    if (dist <= radio) {
                        count++;

                        const alq = alquileres.find(a => a.idhabitacion === hab.idhabitacion);
                        const fechaFin = alq ? alq.fechaFin : "Disponible";

                        const marker = L.marker([hab.latitud, hab.longitud]).addTo(mapaLeaflet);
                        marker.bindPopup(`
                            <b>${hab.direccion}</b><br>
                            Precio: ${hab.precio} €<br>
                            Fin Alquiler: ${fechaFin}
                        `);
                    }
                }
            });

            if (count === 0) estado.textContent += " (Sin resultados)";
        });
    };
}

function getAll(store) {
    return new Promise(resolve =>
        store.getAll().onsuccess = ev => resolve(ev.target.result)
    );
}
