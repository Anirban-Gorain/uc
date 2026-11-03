/**
 * @file toast.js
 * @description Global notification toast with an animated shrinking timer bar.
 */

let toastTimeout = null;

export function showToast({ icon = "🔒", message = "", duration = 2600 } = {}) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
    <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
  `;

  toast.classList.remove("show");
  // Force browser reflow to restart animation smoothly
  void toast.offsetWidth;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
