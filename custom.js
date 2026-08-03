document.addEventListener("DOMContentLoaded", function() {
  if (document.querySelector(".sidebar-custom")) return;

  // 1. Crear el overlay oscuro para móviles
  let overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.insertBefore(overlay, document.body.firstChild);

  // 2. Crear panel lateral base
  let sidebar = document.createElement("div");
  sidebar.className = "sidebar-custom";
  sidebar.innerHTML = '<a href="MIC411apuntes.html" class="home-btn">🏠 Volver al Inicio</a><div class="sidebar-toc"><p>Cargando menú...</p></div>';
  document.body.insertBefore(sidebar, document.body.firstChild);

  // 3. Crear cabecera superior móvil
  let mobileHeader = document.createElement("div");
  mobileHeader.className = "mobile-header";
  mobileHeader.innerHTML = '<button class="hamburger-btn">☰</button><span class="mobile-title">Apuntes del Curso</span>';
  document.body.insertBefore(mobileHeader, document.body.firstChild);

  // 4. Activar los botones móviles
  let btn = document.querySelector(".hamburger-btn");
  btn.addEventListener("click", function() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  });
  overlay.addEventListener("click", function() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  });

  // 5. Detectar en qué archivo estamos actualmente
  let currentFile = window.location.pathname.split('/').pop() || "index.html";
  if (currentFile === "index.html") currentFile = "MIC411apuntes.html";

  // 6. Extraer y filtrar el índice global
  fetch("MIC411apuntes.html")
    .then(r => r.text())
    .then(html => {
      let doc = new DOMParser().parseFromString(html, "text/html");
      let toc = doc.querySelector(".tableofcontents");
      
      if(toc) {
        // Si NO estamos en la página de inicio, escondemos los demás capítulos
        if (currentFile !== "MIC411apuntes.html") {
          let entries = toc.querySelectorAll("[class*='Toc']"); // Encuentra todas las clases tipo chapterToc, sectionToc, etc.
          entries.forEach(entry => {
            let link = entry.querySelector("a");
            if (link) {
              let href = link.getAttribute("href") || "";
              let hrefFile = href.split('#')[0]; // Tomamos solo el nombre del archivo, omitiendo el #hash
              
              // Si el enlace no apunta al HTML actual, lo ocultamos
              if (hrefFile !== currentFile) {
                entry.style.display = "none";
                // Ocultar también el salto de línea <br> nativo de tex4ht para no dejar espacios en blanco
                let next = entry.nextSibling;
                while(next && next.nodeType === 3) next = next.nextSibling;
                if (next && next.tagName === "BR") next.style.display = "none";
              }
            }
          });
        }
        
        // Inyectar el HTML ya filtrado
        document.querySelector(".sidebar-toc").innerHTML = toc.outerHTML;
        
        // Hacer que el menú móvil se cierre automáticamente al elegir una sección
        document.querySelectorAll(".sidebar-custom .tableofcontents a").forEach(link => {
          link.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("open");
          });
        });
      } else {
        document.querySelector(".sidebar-toc").innerHTML = "<p>Menú no disponible.</p>";
      }
    })
    .catch(e => {
      document.querySelector(".sidebar-toc").innerHTML = "<p>Error al cargar menú.</p>";
    });
});
