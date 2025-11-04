(() => {
  const ID = 'discord-gradient-background';
  if (document.getElementById(ID)) return;

  const bg = document.createElement('div');
  bg.id = ID;
  Object.assign(bg.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    background: 'linear-gradient(135deg, #6e42c1, #8e5de9, #ff79c6)',
    transition: 'background 0.3s ease',
  });

  const mount = () => document.querySelector('[class*="appMount"]');
  const inject = () => {
    const target = mount();
    if (target && !document.getElementById(ID)) {
      target.appendChild(bg);
    }
  };
  inject();

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 10000,
    background: '#2f3136',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  });

  panel.innerHTML = `
    <label>Color 1: <input type="color" id="gradColor1" value="#6e42c1"></label><br>
    <label>Color 2: <input type="color" id="gradColor2" value="#8e5de9"></label><br>
    <label>Color 3: <input type="color" id="gradColor3" value="#ff79c6"></label><br>
    <label>Direction:
      <select id="gradDirection">
        <option value="135deg">↘︎</option>
        <option value="45deg">↗︎</option>
        <option value="to right">→</option>
        <option value="to left">←</option>
        <option value="to bottom">↓</option>
        <option value="to top">↑</option>
      </select>
    </label><br>
    <button id="stopGrad" style="margin-top:5px;">Stop</button>
  `;

  function updateGradient() {
    const c1 = document.getElementById('gradColor1').value;
    const c2 = document.getElementById('gradColor2').value;
    const c3 = document.getElementById('gradColor3').value;
    const dir = document.getElementById('gradDirection').value;
    bg.style.background = `linear-gradient(${dir}, ${c1}, ${c2}, ${c3})`;
  }

  panel.querySelectorAll('input, select').forEach(el =>
    el.addEventListener('input', updateGradient)
  );

  document.getElementById('stopGrad')?.addEventListener('click', () => {
    bg.remove();
    panel.remove();
    observer.disconnect();
  });

  document.body.appendChild(panel);

  const observer = new MutationObserver(() => inject());
  const root = mount();
  if (root) observer.observe(root, { childList: true, subtree: true });
})();
