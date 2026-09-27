export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let toastTimeout;

export function toast(message, kind = 'info') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = `toast toast--${kind} toast--visible`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.classList.remove('toast--visible');
  }, 4000);
}

export function messageFromError(error) {
  return error && error.message ? error.message : 'Algo deu errado.';
}

export function dateInputToBrDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function brDateToDateInput(brDate) {
  if (!brDate) return '';
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}
