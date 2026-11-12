// Announcement ticker: rotate one genuine store detail at a time, with a
// deterministic seamless loop and reduced-motion support.
(() => {
  const track = document.querySelector('.gio5-ticker-track');
  const group = track?.querySelector('.gio5-ticker-group');
  if (!track || !group) return;
  const items = [...group.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => {
    track.style.animation = reduced.matches ? 'none' : '';
  };
  motion();
  reduced.addEventListener?.('change', motion);
  // Keep each item discrete for screen readers; only the decorative marquee moves.
  if (items.length < 2) track.style.animation = 'none';
})();
