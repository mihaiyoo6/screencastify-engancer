const updatePosition = (s = "100px", n = 20) =>
  `${parseInt(s) + parseInt(n)}px`;

const updateCamera = (root, newWidth = 200) => {
  if (!root) return true;
  const container = root.shadowRoot;
  const cameraContainer = container.querySelector("cf-resizeable");
  if (!cameraContainer) return true;
  const leftPosition = cameraContainer.style.left;
  const oldWidth = parseInt(cameraContainer.style.width);
  const iframe = container.querySelector("iframe");
  iframe.style.scale = 1.5;
  cameraContainer.style.borderRadius = "50%";
  cameraContainer.style.width = `${newWidth}px`;
  cameraContainer.style.left = updatePosition(
    leftPosition,
    oldWidth - newWidth
  );
};

async function run() {
  const observerConfig = {
    attributes: true,
    attributeFilter: ["style"],
  };
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === "style") {
        updateCamera(document.querySelector("castify-draw-container"));
      }
    });
  });

  const rootObserver = new MutationObserver(function (mutations_list) {
    const root = document.querySelector("castify-draw-container");
    mutations_list.forEach(function (mutation) {
      if (
        mutation.attributeName === "style" &&
        mutation.target.nodeName === "CF-RESIZEABLE"
      ) {
        updateCamera(document.querySelector("castify-draw-container"));
      }
      mutation.addedNodes.forEach(function (added_node) {
        if (added_node.nodeName === "CF-CAM-VIEW") {
          updateCamera(root);
        }
      });
    });
  });

  const bodyObserver = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (added_node) {
        if (added_node.nodeName === "CASTIFY-DRAW-CONTAINER") {
          const root = document.querySelector("castify-draw-container");
          const cameraContainer =
            root.shadowRoot.querySelector("cf-resizeable");
          updateCamera(root);
          root.shadowRoot.querySelector(".toolbox-wrapper").style.display =
            "none";
          observer.observe(cameraContainer, observerConfig);
          rootObserver.observe(
            document.querySelector("castify-draw-container").shadowRoot,
            {
              subtree: true,
              attributes: true,
              attributeFilter: ["style"],
              childList: true,
            }
          );
          // bodyObserver.disconnect();
        }
      });
    });
  });

  bodyObserver.observe(document.body, { subtree: false, childList: true });
}

window.addEventListener(
  "load",
  function load(e) {
    window.removeEventListener("load", load, false);
    this.setTimeout(() => {
      run();
    }, 3000);
  },
  false
);
