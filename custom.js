document.addEventListener("DOMContentLoaded", function() {
  let currentPath = window.location.pathname.split('/').pop() || "index.html";
  let currentFile = (currentPath === "index.html" || currentPath === "") ? "MIC411apuntes.html" : currentPath;

  // ELIMINAR LOS ÍNDICES DEL CUERPO *SOLO* EN LA PÁGINA DE INICIO PARA UNA PORTADA LIMPIA
  if (currentFile === "MIC411apuntes.html") {
      document.querySelectorAll('.tableofcontents, [class*="TOCS"]').forEach(el => {
          if (!el.closest('.sidebar-custom')) el.remove();
      });
  }

  if (document.querySelector(".sidebar-custom")) return;

  let overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.insertBefore(overlay, document.body.firstChild);

  let sidebar = document.createElement("div");
  sidebar.className = "sidebar-custom";
  
  // TITULO PARA LA BARRA LATERAL (PC)
  let titleHtml = '<div style="padding: 0 5px 15px 5px; font-weight: bold; font-size: 1.15em; color: #333; border-bottom: 1px solid #ddd; margin-bottom: 15px;">MIC411 Dinámica Estructural Avanzada</div>';
  let homeBtnHtml = (currentFile === "MIC411apuntes.html") ? '' : '<a href="MIC411apuntes.html" class="home-btn">🏠 Volver al Inicio</a>';
  sidebar.innerHTML = titleHtml + homeBtnHtml + '<div class="sidebar-toc"><p>Cargando menú...</p></div>';
  document.body.insertBefore(sidebar, document.body.firstChild);

  // TITULO PARA LA BARRA SUPERIOR (CELULAR)
  let mobileHeader = document.createElement("div");
  mobileHeader.className = "mobile-header";
  mobileHeader.innerHTML = '<button class="hamburger-btn">☰</button><span class="mobile-title">MIC411 Dinámica Estructural Avanzada</span>';
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
        let tocElements = Array.from(toc.querySelectorAll("[class*='Toc']"));
        let newToc = document.createElement("div");
        newToc.className = "tableofcontents";
        
        let currentPartWrapper = null;
        let currentChapWrapper = null;
        let inVersionesChapter = false; 

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
            if (node.parentNode) node.parentNode.removeChild(node);
            
            let cls = node.className || "";
            let level = 99;
            
            if (cls.includes("partToc")) level = 0;
            else if (cls.includes("chapterToc") || cls.includes("appendixToc") || cls.includes("likechapterToc")) level = 1;
            else if (cls.includes("subsubsectionToc") || cls.includes("likesubsubsectionToc")) level = 4;
            else if (cls.includes("subsectionToc") || cls.includes("likesubsectionToc")) level = 3;
            else if (cls.includes("sectionToc") || cls.includes("likesectionToc")) level = 2;

            let textLower = (node.textContent || "").toLowerCase().trim();

            // LÓGICA DE FILTRADO PARA VERSIONES
            if (level === 0) {
                inVersionesChapter = false; 
            } else if (level === 1) {
                inVersionesChapter = textLower.includes("versiones") || textLower.includes("versión");
            }
            
            if (level > 1 && inVersionesChapter) {
                return; 
            }

            // LÓGICA PARA EXTRAER BIBLIOGRAFÍA DEL APÉNDICE
            if (level === 1 && (textLower.includes("bibliografía") || textLower.includes("bibliografia"))) {
                currentPartWrapper = null; // Rompe el vínculo con la parte anterior
            }

            // Construcción del Árbol HTML
            if (level === 0) {
                newToc.appendChild(node);
                currentPartWrapper = document.createElement("div");
                currentPartWrapper.className = "nav-sublist part-sublist";
                currentPartWrapper.style.display = "none";
                newToc.appendChild(currentPartWrapper);
                addToggle(node, currentPartWrapper);
                currentChapWrapper = null; 
            } 
            else if (level === 1) {
                let targetParent = currentPartWrapper ? currentPartWrapper : newToc;
                targetParent.appendChild(node);
                
                currentChapWrapper = document.createElement("div");
                currentChapWrapper.className = "nav-sublist chap-sublist";
                currentChapWrapper.style.display = "none";
                targetParent.appendChild(currentChapWrapper);
                addToggle(node, currentChapWrapper);
            } 
            else {
                let targetParent = currentChapWrapper ? currentChapWrapper : (currentPartWrapper ? currentPartWrapper : newToc);
                targetParent.appendChild(node);
            }
        });
        
        let wrappers = newToc.querySelectorAll(".nav-sublist");
        wrappers.forEach(wrapper => {
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
