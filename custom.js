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
        // === RECONSTRUIR TOC ESTILO "JUST THE DOCS" ===
        // Seleccionamos exclusivamente etiquetas válidas (ignorando BR y nodos de texto vacíos)
        let tocElements = Array.from(toc.querySelectorAll("[class*='Toc']"));
        let newToc = document.createElement("div");
        newToc.className = "tableofcontents";
        
        let currentPartWrapper = null;
        let currentChapWrapper = null;

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
        }

        tocElements.forEach(node => {
            // Desconectar el nodo de su estructura original plana
            if (node.parentNode) node.parentNode.removeChild(node);
            
            let isPart = node.classList.contains("partToc");
            let isChap = node.classList.contains("chapterToc") || node.classList.contains("appendixToc");
            
            if (isPart) {
                newToc.appendChild(node);
                // Crear la "carpeta" donde irán los capítulos de esta parte
                currentPartWrapper = document.createElement("div");
                currentPartWrapper.className = "nav-sublist part-sublist";
                currentPartWrapper.style.display = "none";
                newToc.appendChild(currentPartWrapper);
                addToggle(node, currentPartWrapper);
                currentChapWrapper = null; // Reiniciamos el contenedor de capítulos
            } 
            else if (isChap) {
                let targetParent = currentPartWrapper ? currentPartWrapper : newToc;
                targetParent.appendChild(node);
                
                // Crear la "carpeta" donde irán las secciones de este capítulo
                currentChapWrapper = document.createElement("div");
                currentChapWrapper.className = "nav-sublist chap-sublist";
                currentChapWrapper.style.display = "none";
                targetParent.appendChild(currentChapWrapper);
                addToggle(node, currentChapWrapper);
            } 
            else {
                // Secciones y subsecciones: van dentro del capítulo actual
                let targetParent = currentChapWrapper ? currentChapWrapper : (currentPartWrapper ? currentPartWrapper : newToc);
                targetParent.appendChild(node);
            }
        });
        
        // Auto-expandir carpetas de la página actual
        let wrappers = newToc.querySelectorAll(".nav-sublist");
        wrappers.forEach(wrapper => {
            // Ocultar la flecha si el capítulo/parte no tiene nada adentro
            if (wrapper.children.length === 0) {
                let prev = wrapper.previousElementSibling;
                if (prev) {
                    let t = prev.querySelector(".nav-toggle");
                    if (t) t.style.visibility = "hidden";
                }
            }
            
            let links = Array.from(wrapper.querySelectorAll("a")).map(a => {
                let href = a.getAttribute("href");
                return href ? href.split('#')[0] : "";
            });
            
            let parentLinkNode = wrapper.previousElementSibling;
            if (parentLinkNode && parentLinkNode.querySelector("a")) {
                let pHref = parentLinkNode.querySelector("a").getAttribute("href");
                if (pHref) links.push(pHref.split('#')[0]);
            }
            
            if (links.includes(currentFile)) {
                wrapper.style.display = "block";
                if (parentLinkNode) {
                    let t = parentLinkNode.querySelector(".nav-toggle");
                    if (t) t.classList.add("open");
                }
                
                let parentPartWrapper = wrapper.closest(".part-sublist");
                if (parentPartWrapper) {
                    parentPartWrapper.style.display = "block";
                    let pToggle = parentPartWrapper.previousElementSibling;
                    if (pToggle) {
                        let pt = pToggle.querySelector(".nav-toggle");
                        if (pt) pt.classList.add("open");
                    }
                }
            }
        });
        
        document.querySelector(".sidebar-toc").innerHTML = "";
        document.querySelector(".sidebar-toc").appendChild(newToc);
        
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
