document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        validarLogin();
    });

    document.getElementById("btnAtras").addEventListener("click", () => {
        window.history.back();
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

            // Usuario correcto
            msg.textContent = "";


            sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuario));


            // Ir a principal
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
