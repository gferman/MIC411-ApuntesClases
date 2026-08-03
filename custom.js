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
        if (currentFile === "MIC411apuntes.html") {
          let deepEntries = toc.querySelectorAll(".sectionToc, .subsectionToc, .subsubsectionToc, .paragraphToc, .subparagraphToc");
          deepEntries.forEach(entry => {
            entry.style.display = "none";
            let next = entry.nextSibling;
            while(next && next.nodeType === 3) next = next.nextSibling;
            if (next && next.tagName === "BR") next.style.display = "none";
          });
        } else {
          let entries = toc.querySelectorAll("[class*='Toc']"); 
          entries.forEach(entry => {
            let link = entry.querySelector("a");
            if (link) {
              let href = link.getAttribute("href") || "";
              let hrefFile = href.split('#')[0]; 
              
              if (hrefFile !== currentFile) {
                entry.style.display = "none";
                let next = entry.nextSibling;
                while(next && next.nodeType === 3) next = next.nextSibling;
                if (next && next.tagName === "BR") next.style.display = "none";
              }
            }
          });
        }
        
        document.querySelector(".sidebar-toc").innerHTML = toc.outerHTML;
        
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
