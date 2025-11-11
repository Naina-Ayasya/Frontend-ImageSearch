import { useEffect } from "react";

function KajariaSearch() {
  useEffect(() => {
    // Suppress cross-origin script errors
    function suppressScriptError(e) {
      if (e.message === "Script error.") e.preventDefault();
    }
    window.addEventListener("error", suppressScriptError);

    return () => window.removeEventListener("error", suppressScriptError);
  }, []);

  useEffect(() => {
    fetch('https://demowebsite.kajariaceramics.com/api/shared-dependencies')
      .then(res => res.text())
      .then(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Inject styles
        temp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
          if (!document.head.querySelector(`link[href="${link.href}"]`)) {
            document.head.appendChild(link.cloneNode(true));
          }
        });

        // Inject scripts one-by-one
        const scripts = Array.from(temp.querySelectorAll('script'));
        function loadScriptsSequentially(scripts, cb) {
          if (!scripts.length) return cb();
          const script = document.createElement('script');
          script.src = scripts[0].src;
          script.onload = () => loadScriptsSequentially(scripts.slice(1), cb);
          document.head.appendChild(script);
        }

        loadScriptsSequentially(scripts, () => {
          fetch('https://demowebsite.kajariaceramics.com/api/shared-header')
            .then(res => res.text())
            .then(headerHtml => {
              const header = document.getElementById('shared-header');
              if (header) header.innerHTML = headerHtml;

              if (typeof window.attachIframeSearchToggle === 'function') window.attachIframeSearchToggle();
              if (typeof window.reinitKajariaDropdowns === 'function') window.reinitKajariaDropdowns();
              if (typeof window.reinitKajariaMobile === 'function') window.reinitKajariaMobile();

              setTimeout(() => {
                if (window.bootstrap && window.bootstrap.Dropdown) {
                  document.querySelectorAll('.dropdown-toggle').forEach(el => {
                    try {
                      new window.bootstrap.Dropdown(el);
                    } catch (e) {}
                  });
                }
              }, 100);
            });

          fetch('https://demowebsite.kajariaceramics.com/api/shared-footer')
            .then(res => res.text())
            .then(footerHtml => {
              const footer = document.getElementById('shared-footer');
              if (footer) footer.innerHTML = footerHtml;

              if (typeof window.setupFooterFormsJQ === 'function') window.setupFooterFormsJQ();
            });
        });
      });
  }, []);

  return null; // No need to return anything; it's just injecting external content
}

export default KajariaSearch;
