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
        let rootItems = Array.from(toc.childNodes);
        let newToc = document.createElement("div");
        newToc.className = "tableofcontents";
        
        let currentPartWrapper = null;
        let currentChapWrapper = null;

        // Helper para inyectar flechas desplegables
        function addToggle(parentNode, wrapperNode) {
            let toggle = document.createElement("span");
            toggle.className = "nav-toggle";
            toggle.innerHTML = "▶";
            parentNode.insertBefore(toggle, parentNode.firstChild);
            
            toggle.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (wrapperNode.style.display === "none") {
                    wrapperNode.style.display = "block";
                    toggle.classList.add("open");
                } else {
                    wrapperNode.style.display = "none";
                    toggle.classList.remove("open");
                }
            });
            return toggle;
        }

        // 1. Reconstruir la jerarquía: Parte > Capítulo > Sección
        rootItems.forEach(node => {
            if (node.nodeType === 1 && node.tagName !== "BR") {
                // Limpiar cualquier inline style que tex4ht haya exportado
                node.style.display = ""; 
                
                if (node.classList.contains("partToc")) {
                    // Nueva Parte
                    newToc.appendChild(node);
                    currentPartWrapper = document.createElement("div");
                    currentPartWrapper.className = "nav-sublist part-sublist";
                    currentPartWrapper.style.display = "none"; // Oculto por defecto
                    newToc.appendChild(currentPartWrapper);
                    addToggle(node, currentPartWrapper);
                    currentChapWrapper = null; // Reiniciar capítulo al cambiar de parte
                } 
                else if (node.classList.contains("chapterToc") || node.classList.contains("appendixToc")) {
                    // Nuevo Capítulo (va dentro de la parte actual, si existe)
                    let targetParent = currentPartWrapper ? currentPartWrapper : newToc;
                    targetParent.appendChild(node);
                    
                    currentChapWrapper = document.createElement("div");
                    currentChapWrapper.className = "nav-sublist chap-sublist";
                    currentChapWrapper.style.display = "none"; // Oculto por defecto
                    targetParent.appendChild(currentChapWrapper);
                    addToggle(node, currentChapWrapper);
                } 
                else {
                    // Es una Sección, Subsección, etc.
                    if (currentChapWrapper) {
                        currentChapWrapper.appendChild(node); // Va en el capítulo
                    } else if (currentPartWrapper) {
                        currentPartWrapper.appendChild(node); // Va en la parte (raro pero posible)
                    } else {
                        newToc.appendChild(node); // Huérfano en la raíz
                    }
                }
            }
        });
        
        // 2. Auto-expandir el menú según la página actual
        let wrappers = newToc.querySelectorAll(".nav-sublist");
        wrappers.forEach(wrapper => {
            // Si la carpeta quedó vacía, esconder el triángulo
            if (wrapper.children.length === 0) {
                let prev = wrapper.previousElementSibling;
                if (prev) {
                    let t = prev.querySelector(".nav-toggle");
                    if (t) t.style.visibility = "hidden";
                }
            }
            
            // Extraer links dentro de este nivel y del título padre
            let links = Array.from(wrapper.querySelectorAll("a")).map(a => a.getAttribute("href").split('#')[0]);
            let parentLinkNode = wrapper.previousElementSibling;
            if (parentLinkNode && parentLinkNode.querySelector("a")) {
                links.push(parentLinkNode.querySelector("a").getAttribute("href").split('#')[0]);
            }
            
            // Si estamos en este capítulo/parte, lo abrimos
            if (links.includes(currentFile)) {
                wrapper.style.display = "block";
                if (parentLinkNode) {
                    let t = parentLinkNode.querySelector(".nav-toggle");
                    if (t) t.classList.add("open");
                }
                // Si abrimos un capítulo, nos aseguramos de abrir la Parte que lo contiene
                let parentPartWrapper = wrapper.closest(".part-sublist");
                if (parentPartWrapper) {
                    parentPartWrapper.style.display = "block";
                    let pToggle = parentPartWrapper.previousElementSibling.querySelector(".nav-toggle");
                    if (pToggle) pToggle.classList.add("open");
                }
            }
        });
        
        // Reemplazar el viejo índice plano por el nuevo jerárquico
        document.querySelector(".sidebar-toc").innerHTML = "";
        document.querySelector(".sidebar-toc").appendChild(newToc);
        
        // Cerrar menú móvil al seleccionar una opción
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
