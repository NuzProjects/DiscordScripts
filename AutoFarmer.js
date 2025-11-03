// Paste this into console of Discord!!!

(() => {
  if (window.__discordAutoSenderInjected) return;
  window.__discordAutoSenderInjected = true;

  let running = false;
  let timers = {};
  let nextTimestamps = {};

  const sendMessage = (text) => {
    const inputBox = document.querySelector('[contenteditable="true"][data-slate-editor="true"]');
    if (!inputBox) return;

    inputBox.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("delete", false, null);

    const insertEvent = new InputEvent("beforeinput", {
      inputType: "insertText",
      data: text,
      bubbles: true,
      cancelable: true
    });
    inputBox.dispatchEvent(insertEvent);

    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true
    });
    inputBox.dispatchEvent(enter);
  };

  const schedule = (key, msg, intervalSec) => {
    nextTimestamps[key] = Date.now() + intervalSec * 1000;
    timers[key] = setTimeout(() => {
      sendMessage(msg);
      schedule(key, msg, intervalSec);
    }, intervalSec * 1000);
  };

  const startSending = () => {
    if (running) return;
    running = true;
    statusIndicator.textContent = "▶ Playing";

    const workMsg = workInput.value.trim();
    const collectMsg = collectInput.value.trim();
    const workInterval = parseFloat(workIntervalInput.value);
    const collectInterval = parseFloat(collectIntervalInput.value);

    sendMessage(workMsg);
    sendMessage(collectMsg);

    schedule("work", workMsg, workInterval);
    schedule("collect", collectMsg, collectInterval);
  };

  const pauseSending = () => {
    running = false;
    for (const key in timers) clearTimeout(timers[key]);
    statusIndicator.textContent = "⏸ Paused";
  };

  const stopSending = () => {
    pauseSending();
    popup.remove();
    window.__discordAutoSenderInjected = false;
  };

  const updateCountdown = () => {
    if (running) {
      const now = Date.now();
      const workLeft = Math.max(0, nextTimestamps.work - now);
      const collectLeft = Math.max(0, nextTimestamps.collect - now);
      countdown.textContent =
        `Next "${workInput.value}" in: ${(workLeft / 1000).toFixed(1)}s\n` +
        `Next "${collectInput.value}" in: ${(collectLeft / 1000).toFixed(1)}s`;
    } else {
      countdown.textContent = `Next "${workInput.value}" in: --s\nNext "${collectInput.value}" in: --s`;
    }
    requestAnimationFrame(updateCountdown);
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
    minWidth: "220px",
    whiteSpace: "pre-line"
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

  const workInput = makeInputRow("Work msg", "?work");
  const workIntervalInput = makeInputRow("Work interval (s)", "66");
  const collectInput = makeInputRow("Collect msg", "?collect");
  const collectIntervalInput = makeInputRow("Collect interval (s)", "3600");

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
  startBtn.onclick = startSending;

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
  pauseBtn.onclick = pauseSending;

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
  stopBtn.onclick = stopSending;

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

  const countdown = document.createElement("div");
  countdown.textContent = "Next in: --s";
  Object.assign(countdown.style, {
    fontSize: "11px",
    textAlign: "center",
    color: "#ccc"
  });

  popup.appendChild(controls);
  popup.appendChild(statusIndicator);
  popup.appendChild(countdown);
  document.body.appendChild(popup);

  updateCountdown();
})();
