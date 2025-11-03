// Paste into console of Discord!!!!

(() => {
  if (window.__discordAutoReactorInjected) return;
  window.__discordAutoReactorInjected = true;

  let running = false;
  let observer = null;

  const reactToMessage = (messageNode, emoji) => {
    const buttons = messageNode.querySelectorAll('[aria-label*="Add Reaction"]');
    if (buttons.length === 0) return;

    buttons[0].click();

    const interval = setInterval(() => {
      const emojiList = document.querySelectorAll('[aria-label][role="menuitem"]');
      for (const item of emojiList) {
        if (item.textContent.trim() === emoji) {
          item.click();
          clearInterval(interval);
          return;
        }
      }
    }, 100);
  };

  const matchesFilter = (messageNode, filter) => {
    const content = messageNode.textContent.toLowerCase();
    const isBot = !!messageNode.querySelector('[aria-label*="BOT"]');

    if (filter === "all") return true;
    if (filter === "bots") return isBot;
    if (filter.startsWith("contains:")) {
      const keyword = filter.split(":")[1].toLowerCase();
      return content.includes(keyword);
    }
    return false;
  };

  const startObserving = () => {
    const emoji = emojiInput.value.trim();
    const filter = filterInput.value.trim();

    const chatContainer = document.querySelector('[aria-label="Messages"]');
    if (!chatContainer) return;

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.querySelector('[aria-label*="Add Reaction"]')) {
            if (matchesFilter(node, filter)) {
              reactToMessage(node, emoji);
            }
          }
        }
      }
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
  };

  const stopObserving = () => {
    if (observer) observer.disconnect();
    observer = null;
  };

  const startReactor = () => {
    if (running) return;
    running = true;
    statusIndicator.textContent = "▶ Reacting";
    startObserving();
  };

  const pauseReactor = () => {
    running = false;
    stopObserving();
    statusIndicator.textContent = "⏸ Paused";
  };

  const stopReactor = () => {
    pauseReactor();
    popup.remove();
    window.__discordAutoReactorInjected = false;
  };

  // --- UI ---
  const popup = document.createElement("div");
  Object.assign(popup.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    backgroundColor: "#1e1f23",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
    zIndex: 999999,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontFamily: "Arial, sans-serif",
    fontSize: "13px",
    minWidth: "220px"
  });

  const makeInputRow = (labelText, defaultValue) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.gap = "6px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.flex = "1";

    const input = document.createElement("input");
    input.value = defaultValue;
    input.style.flex = "1";
    input.style.padding = "2px 4px";
    input.style.borderRadius = "4px";
    input.style.border = "1px solid #555";
    input.style.backgroundColor = "#2c2f33";
    input.style.color = "#fff";

    row.appendChild(label);
    row.appendChild(input);
    popup.appendChild(row);
    return input;
  };

  const emojiInput = makeInputRow("Emoji", "👍");
  const filterInput = makeInputRow("Filter", "all");

  const controls = document.createElement("div");
  Object.assign(controls.style, {
    display: "flex",
    gap: "6px",
    justifyContent: "space-between"
  });

  const startBtn = document.createElement("button");
  startBtn.textContent = "▶ Start";
  Object.assign(startBtn.style, {
    flex: "1",
    padding: "4px 6px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#4caf50",
    color: "#fff",
    cursor: "pointer"
  });
  startBtn.onclick = startReactor;

  const pauseBtn = document.createElement("button");
  pauseBtn.textContent = "⏸ Pause";
  Object.assign(pauseBtn.style, {
    flex: "1",
    padding: "4px 6px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#f0ad4e",
    color: "#fff",
    cursor: "pointer"
  });
  pauseBtn.onclick = pauseReactor;

  const stopBtn = document.createElement("button");
  stopBtn.textContent = "✕ Stop";
  Object.assign(stopBtn.style, {
    flex: "1",
    padding: "4px 6px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#d9534f",
    color: "#fff",
    cursor: "pointer"
  });
  stopBtn.onclick = stopReactor;

  controls.appendChild(startBtn);
  controls.appendChild(pauseBtn);
  controls.appendChild(stopBtn);

  const statusIndicator = document.createElement("div");
  statusIndicator.textContent = "⏸ Paused";
  Object.assign(statusIndicator.style, {
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#333",
    padding: "2px 4px",
    borderRadius: "4px"
  });

  popup.appendChild(controls);
  popup.appendChild(statusIndicator);
  document.body.appendChild(popup);
})();
