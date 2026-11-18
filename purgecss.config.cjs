// Elimina del build de Bootstrap todo lo que la landing no usa.
module.exports = {
  content: ['index.html', 'assets/js/main.js', 'node_modules/bootstrap/js/dist/collapse.js', 'node_modules/bootstrap/js/dist/tab.js'],
  css: ['assets/vendor/bootstrap/bootstrap.min.css'],
  safelist: {
    standard: ['show', 'showing', 'collapsing', 'collapsed', 'active', 'fade', 'navbar-expand-lg'],
    deep: [/^accordion/, /^navbar/, /^nav/],
    greedy: [/collapse/],
  },
  variables: true, keyframes: true, fontFace: true,
};
