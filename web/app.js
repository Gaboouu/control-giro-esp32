const $ = id => document.getElementById(id);
const names = { left: 'Izquierda', right: 'Derecha', stop: 'Detenido' };
const DEFAULT_API = 'https://control-giro-esp32.garnoldesquivel.workers.dev';
let state = { distance: 45, mode: 'manual', motor: 'stop' };
let revision = 0;
let queue = Promise.resolve();
let sliderTimer;
function autoDirection(d) {
  return d >= 10 && d <= 25 ? 'right' : d >= 26 && d <= 40 ? 'left' : 'stop';
}
function render() {
  $('distance').textContent = state.distance + ' cm';
  $('motor').textContent = names[state.motor] || 'Detenido';
  $('mode').textContent = state.mode === 'auto' ? 'Automático' : 'Manual';
  $('slider-value').textContent = state.distance;
  $('distance-slider').value = state.distance;
}
function apiBase() {
  return $('api-url').value.trim().replace(/\/$/, '');
}
function send(path, data, requestedRevision) {
  const base = apiBase();
  if (!base) {
    $('message').textContent = 'Simulación local activa.';
    return;
  }
  queue = queue.catch(() => {}).then(async () => {
    const response = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);
    // Nunca sustituir una acción reciente con una respuesta antigua.
    if (requestedRevision === revision) {
      state = result;
      render();
      $('message').textContent = 'API conectada.';
    }
  }).catch(error => {
    if (requestedRevision === revision) {
      $('message').textContent = 'Error de API: ' + error.message;
    }
  });
}
$('api-url').value = DEFAULT_API;
$('distance-slider').addEventListener('input', event => {
  state.distance = Number(event.target.value);
  if (state.mode === 'auto') state.motor = autoDirection(state.distance);
  revision++;
  render();
  clearTimeout(sliderTimer);
  sliderTimer = setTimeout(() => {
    send('/api/distance', { distance: state.distance }, revision);
  }, 160);
});
document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    clearTimeout(sliderTimer);
    state.mode = button.dataset.mode;
    if (state.mode === 'auto') state.motor = autoDirection(state.distance);
    const currentRevision = ++revision;
    render();
    // Enviar la distancia primero para que la API calcule sobre el valor visible.
    send('/api/distance', { distance: state.distance }, -1);
    send('/api/mode', { mode: state.mode }, currentRevision);
  });
});
document.querySelectorAll('[data-direction]').forEach(button => {
  button.addEventListener('click', () => {
    if (state.mode !== 'manual') {
      $('message').textContent = 'Cambia a modo manual para controlar el motor.';
      return;
    }
    state.motor = button.dataset.direction;
    const currentRevision = ++revision;
    render();
    send('/api/motor', { direction: state.motor }, currentRevision);
  });
});
render();
