document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");
    const msg = document.getElementById("mensajeError");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        validarLogin();
    });
});

function validarLogin() {
    const emailInput = document.getElementById("email").value.trim();
    const passInput = document.getElementById("contrasena").value.trim();
    const msg = document.getElementById("mensajeError");

    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction("Usuario", "readonly");
        const store = tx.objectStore("Usuario");

        // Buscamos el usuario por email
        const buscar = store.get(emailInput);

        buscar.onsuccess = function () {
            const usuario = buscar.result;

            // Si no existe el email o la contraseña no coincide
            if (!usuario) {
                msg.textContent = "Datos incorrectos";
                return;
            }

            if (usuario.contrasena !== passInput) {
                msg.textContent = "Datos incorrectos";
                return;
            }

            // Usuario y contraseña correctos
            msg.textContent = "";
            window.location.href = "principal.html";
        };

        buscar.onerror = function () {
            msg.textContent = "Error buscando usuario";
        };
    };

    req.onerror = function () {
        msg.textContent = "Error abriendo base de datos";
    };
}
