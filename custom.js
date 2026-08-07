document.addEventListener("DOMContentLoaded", function() {
  if (document.querySelector(".sidebar-custom")) return;

  let currentPath = window.location.pathname.split('/').pop() || "index.html";
  let currentFile = (currentPath === "index.html" || currentPath === "") ? "MIC411apuntes.html" : currentPath;

  let overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.insertBefore(overlay, document.body.firstChild);

  let sidebar = document.createElement("div");
  sidebar.className = "sidebar-custom";
  
  let homeBtnHtml = (currentFile === "MIC411apuntes.html") ? '' : '<a href="MIC411apuntes.html" class="home-btn">🏠 Volver al Inicio</a>';
  sidebar.innerHTML = homeBtnHtml + '<div class="sidebar-toc"><p>Cargando menú...</p></div>';
  document.body.insertBefore(sidebar, document.body.firstChild);

  let mobileHeader = document.createElement("div");
  mobileHeader.className = "mobile-header";
  mobileHeader.innerHTML = '<button class="hamburger-btn">☰</button><span class="mobile-title">Apuntes del Curso</span>';
  document.body.insertBefore(mobileHeader, document.body.firstChild);

  let btn = document.querySelector(".hamburger-btn");
  btn.addEventListener("click", function() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  });
  overlay.addEventListener("click", function() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  });

  fetch("MIC411apuntes.html")
    .then(r => r.text())
    .then(html => {
      let doc = new DOMParser().parseFromString(html, "text/html");
      let toc = doc.querySelector(".tableofcontents");
      
      if(toc) {
        // === INICIO LÓGICA COLLAPSIBLE (JUST THE DOCS) ===
        let rootItems = Array.from(toc.childNodes);
        let currentWrapper = null;
        
        // Crear un nuevo contenedor para el índice reorganizado
        let newToc = document.createElement("div");
        newToc.className = "tableofcontents";
        
        rootItems.forEach(node => {
          if (node.nodeType === 1 && (node.classList.contains("chapterToc") || node.classList.contains("appendixToc") || node.classList.contains("partToc"))) {
              // Nodo principal: Lo agregamos directo a la raíz
              newToc.appendChild(node);
              
              // Si es capítulo o apéndice, creamos su "carpeta" colapsable
              if(node.classList.contains("chapterToc") || node.classList.contains("appendixToc")) {
                  // 1. Inyectar flecha (triángulo)
                  let toggle = document.createElement("span");
                  toggle.className = "nav-toggle";
                  toggle.innerHTML = "▶";
                  node.insertBefore(toggle, node.firstChild);
                  
                  // 2. Crear contenedor interno oculto
                  currentWrapper = document.createElement("div");
                  currentWrapper.className = "nav-sublist";
                  currentWrapper.style.display = "none";
                  newToc.appendChild(currentWrapper);
                  
                  // 3. Agregar evento click a la flecha
                  toggle.addEventListener("click", (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (currentWrapper.style.display === "none") {
                          currentWrapper.style.display = "block";
                          toggle.classList.add("open");
                      } else {
                          currentWrapper.style.display = "none";
                          toggle.classList.remove("open");
                      }
                  });
              } else {
                  currentWrapper = null; // Si es parte, no agrupa secciones
              }
          } else if (currentWrapper && node.nodeType === 1 && node.tagName !== "BR") {
              // Es una subsección: La guardamos dentro de la carpeta del capítulo actual
              currentWrapper.appendChild(node);
          } else if (!currentWrapper && node.nodeType === 1 && node.tagName !== "BR") {
              // Elementos huérfanos antes del primer capítulo
              newToc.appendChild(node);
          }
        });
        
        // === AUTO-EXPANDIR EL CAPÍTULO ACTUAL ===
        let chapters = newToc.querySelectorAll(".chapterToc, .appendixToc");
        chapters.forEach(chap => {
            let wrapper = chap.nextElementSibling;
            if (wrapper && wrapper.classList.contains("nav-sublist")) {
                // Si un capítulo no tiene secciones, ocultar la flecha
                if (wrapper.children.length === 0) {
                    let toggle = chap.querySelector(".nav-toggle");
                    if(toggle) toggle.style.visibility = "hidden";
                }
                
                // Recolectar todos los links de este capítulo (incluyendo el título padre)
                let links = [];
                if (chap.querySelector("a")) links.push(chap.querySelector("a").getAttribute("href").split('#')[0]);
                wrapper.querySelectorAll("a").forEach(a => links.push(a.getAttribute("href").split('#')[0]));
                
                // Si el archivo en el que estamos coincide con alguno del bloque, expandir
                if (links.includes(currentFile)) {
                    wrapper.style.display = "block";
                    let toggle = chap.querySelector(".nav-toggle");
                    if(toggle) toggle.classList.add("open");
                }
            }
        });
        
        document.querySelector(".sidebar-toc").innerHTML = "";
        document.querySelector(".sidebar-toc").appendChild(newToc);
        
        // Cerrar overlay en móviles al hacer click
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
