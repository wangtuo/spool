(function() {
  var toc = document.querySelector('.toc-list');
  if (!toc) return;

  var headings = document.querySelectorAll('.post-content h2, .post-content h3');
  if (headings.length === 0) {
    toc.closest('.toc-sidebar').style.display = 'none';
    return;
  }

  var items = [];
  headings.forEach(function(h, i) {
    var id = h.id || ('toc-' + i);
    h.id = id;
    var li = document.createElement('li');
    li.className = h.tagName === 'H3' ? 'toc-h3' : '';
    var a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = h.textContent;
    li.appendChild(a);
    toc.appendChild(li);
    items.push({ el: h, a: a });
  });

  var active = null;
  function update() {
    var top = window.scrollY + 80;
    var current = null;
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].el.offsetTop <= top) {
        current = items[i];
        break;
      }
    }
    if (current === active) return;
    if (active) active.a.classList.remove('active');
    active = current;
    if (active) active.a.classList.add('active');
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();