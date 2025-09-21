// Client script to POST contact form to /api/contact
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.createElement('div');
  status.id = 'form-status';
  form.parentNode.insertBefore(status, form.nextSibling);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending...';
    const formData = new FormData(form);
    // For a static Netlify site we post the URL-encoded form to '/' so Netlify captures it.
    const payload = new URLSearchParams();
    for (const pair of formData.entries()) payload.append(pair[0], pair[1]);
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload.toString() });
      if (res.ok) {
        status.textContent = 'Message sent — thank you!';
        form.reset();
      } else {
        status.textContent = 'Submission failed';
      }
    } catch (err) {
      status.textContent = 'Network error — could not send message';
    }
  });
});
