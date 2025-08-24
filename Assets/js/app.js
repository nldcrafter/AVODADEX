document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.theme-toggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    toggle.innerHTML = document.body.classList.contains('light-mode')
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  });
});
});
