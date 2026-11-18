(function () {
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  };

  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-bs-theme', store.get('tm-theme', prefersDark ? 'dark' : 'light'));

  var USERS = {
    admin: { name: 'Nadia Fawzy', role: 'Admin', initials: 'NF' },
    manager: { name: 'Karim Hassan', role: 'Manager', initials: 'KH' },
    senior: { name: 'Mona Adel', role: 'Senior', initials: 'MA' },
    junior: { name: 'Youssef Samir', role: 'Junior', initials: 'YS' }
  };

  var NAV = {
    admin: [['admin-users.html', 'Users', 'people'], ['admin-departments.html', 'Departments', 'diagram-3'], ['projects.html', 'Projects', 'folder2']],
    manager: [['projects.html', 'Projects', 'folder2'], ['my-approvals.html', 'My approvals', 'patch-check', 2], ['notifications.html', 'Notifications', 'bell']],
    senior: [['projects.html', 'Projects', 'folder2'], ['my-tasks.html', 'My tasks', 'list-check'], ['my-approvals.html', 'My approvals', 'patch-check', 1], ['notifications.html', 'Notifications', 'bell']],
    junior: [['projects.html', 'Projects', 'folder2'], ['my-tasks.html', 'My tasks', 'list-check'], ['notifications.html', 'Notifications', 'bell']]
  };

  var BELL = [
    ['t-approval', 'patch-question', 'Youssef Samir needs your approval on “Label all shelving in Zone A”.', '10 min ago'],
    ['t-overdue', 'alarm', '“Integrate scanner data with stock system” is overdue. It was due on 14 Nov.', '9 h ago'],
    ['t-comment', 'chat-left-text', 'Karim Hassan commented on “Configure barcode scanners for Zone B”.', 'Yesterday']
  ];

  var MARK = '<svg class="tm-mark" width="34" height="14" viewBox="0 0 34 14" aria-hidden="true"><line x1="6" y1="7" x2="28" y2="7"/><circle class="on" cx="6" cy="7" r="5"/><circle class="on" cx="17" cy="7" r="5"/><circle cx="28" cy="7" r="5"/></svg>';

  var listeners = [];
  var S = { role: null, state: null, view: null };

  function attrList(el, name) { var v = el.getAttribute(name); return v === null ? null : v.split(/\s+/).filter(Boolean); }

  function matches(el, name, val) { var l = attrList(el, name); return l === null || l.indexOf(val) !== -1; }

  function apply() {
    document.querySelectorAll('[data-role],[data-state],[data-view]').forEach(function (el) {
      if (el.closest('.tm-proto')) return;
      el.hidden = !(matches(el, 'data-role', S.role) && matches(el, 'data-state', S.state) && matches(el, 'data-view', S.view));
    });
    document.body.setAttribute('data-active-role', S.role);
    document.body.setAttribute('data-active-state', S.state);
    if (S.view) document.body.setAttribute('data-active-view', S.view);
    listeners.forEach(function (fn) { fn(S); });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderSidebar() {
    var here = document.body.getAttribute('data-nav') || '';
    var items = NAV[S.role].map(function (n) {
      var cur = n[0] === here ? ' aria-current="page"' : '';
      var count = n[3] ? '<span class="tm-count" aria-label="' + n[3] + ' waiting">' + n[3] + '</span>' : '';
      return '<li><a href="' + n[0] + '"' + cur + '><i class="bi bi-' + n[2] + '" aria-hidden="true"></i>' + n[1] + count + '</a></li>';
    }).join('');
    return '<div class="offcanvas-lg offcanvas-start tm-sidebar" tabindex="-1" id="tmSidebar" aria-labelledby="tmSidebarLabel">' +
      '<div class="offcanvas-header"><span class="fw-semibold" id="tmSidebarLabel">Menu</span><button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#tmSidebar" aria-label="Close menu"></button></div>' +
      '<div class="offcanvas-body p-0"><div class="tm-sidebar-inner">' +
      '<a class="tm-brand" href="projects.html">' + MARK + '<span>Task Management</span></a>' +
      '<nav aria-label="Main"><ul class="tm-nav">' + items + '</ul></nav>' +
      '<div class="tm-side-foot">Signed in as ' + USERS[S.role].role + '</div>' +
      '</div></div></div>';
  }

  function renderTopbar() {
    var u = USERS[S.role];
    var dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    var bell = S.role === 'admin' ? '' :
      '<div class="dropdown">' +
      '<button class="tm-icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Notifications, 3 unread"><i class="bi bi-bell" aria-hidden="true"></i><span class="tm-dot">3</span></button>' +
      '<div class="dropdown-menu dropdown-menu-end tm-bell-menu">' +
      '<div class="tm-bell-head"><strong>Notifications</strong><button type="button" class="btn btn-link btn-sm p-0" data-tm-toast="All notifications marked as read.">Mark all as read</button></div>' +
      BELL.map(function (b) { return '<a class="dropdown-item" href="task-detail.html">' + esc(b[2]) + '<span class="d-block tm-muted tm-small mt-1">' + b[3] + '</span></a>'; }).join('') +
      '<a class="tm-bell-foot" href="notifications.html">See all notifications</a>' +
      '</div></div>';
    return '<button class="tm-icon-btn d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#tmSidebar" aria-controls="tmSidebar" aria-label="Open menu"><i class="bi bi-list" aria-hidden="true"></i></button>' +
      '<a class="tm-brand d-lg-none p-0" href="projects.html">' + MARK + '<span class="visually-hidden">Task Management</span></a>' +
      '<span class="tm-spacer"></span>' +
      '<button class="tm-icon-btn" type="button" id="tmThemeBtn" aria-label="Switch to ' + (dark ? 'light' : 'dark') + ' theme"><i class="bi bi-' + (dark ? 'sun' : 'moon') + '" aria-hidden="true"></i></button>' +
      bell +
      '<div class="dropdown">' +
      '<button class="tm-user-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false"><span class="tm-avatar">' + u.initials + '</span><span class="d-none d-sm-inline text-start lh-sm"><span class="d-block fw-semibold">' + u.name + '</span><span class="d-block tm-muted tm-small">' + u.role + '</span></span><i class="bi bi-chevron-down tm-muted tm-small" aria-hidden="true"></i></button>' +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><a class="dropdown-item" href="change-password.html">Change password</a></li>' +
      '<li><hr class="dropdown-divider"></li>' +
      '<li><a class="dropdown-item" href="sign-in.html">Sign out</a></li>' +
      '</ul></div>';
  }

  function renderShell() {
    var side = document.getElementById('tm-side-col');
    var top = document.getElementById('tm-topbar');
    if (!side || !top) return;
    var oc = window.bootstrap && document.getElementById('tmSidebar') && bootstrap.Offcanvas.getInstance(document.getElementById('tmSidebar'));
    if (oc) oc.hide();
    side.innerHTML = renderSidebar();
    top.innerHTML = renderTopbar();
    document.getElementById('tmThemeBtn').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', next);
      store.set('tm-theme', next);
      renderShell();
      document.getElementById('tmThemeBtn').focus();
    });
  }

  function buildShell() {
    var main = document.querySelector('main');
    if (!main || document.body.getAttribute('data-shell') === 'none') return;
    var app = document.createElement('div');
    app.className = 'tm-app';
    app.innerHTML = '<div class="tm-side-col" id="tm-side-col"></div><div class="tm-body"><header class="tm-topbar" id="tm-topbar"></header></div>';
    main.parentNode.insertBefore(app, main);
    app.querySelector('.tm-body').appendChild(main);
    main.classList.add('tm-main');
    main.id = main.id || 'main';
  }

  function parseOptions(str) {
    return (str || '').split('|').filter(Boolean).map(function (p) { var i = p.indexOf(':'); return i === -1 ? [p, p] : [p.slice(0, i), p.slice(i + 1)]; });
  }

  var ROLE_LABELS = { admin: 'Admin (Nadia)', manager: 'Manager (Karim)', senior: 'Senior (Mona)', junior: 'Junior (Youssef)' };
  var STATE_LABELS = { loaded: 'Loaded', loading: 'Loading', empty: 'Empty', error: 'Error', saving: 'Saving', invalid: 'Validation errors', conflict: 'Changed by someone else', notfound: 'Not found', filtered: 'No filter results', expired: 'Session ended' };

  function select(id, label, opts, val) {
    return '<label>' + label + '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
  }

  function buildProto() {
    var b = document.body;
    if (b.getAttribute('data-proto') === 'none') return;
    var roles = attrList(b, 'data-roles') || [];
    var states = attrList(b, 'data-states') || [];
    var views = parseOptions(b.getAttribute('data-views'));
    var collapsed = store.get('tm-proto-collapsed', 'false');
    var html = '<button class="tm-proto-toggle" type="button" aria-expanded="' + (collapsed !== 'true') + '"><i class="bi bi-sliders" aria-hidden="true"></i>Prototype controls<i class="bi bi-chevron-down" aria-hidden="true"></i></button><div class="tm-proto-body">';
    if (roles.length > 1) html += select('tmProtoRole', 'Viewing as', roles.map(function (r) { return [r, ROLE_LABELS[r]]; }), S.role);
    if (states.length > 1) html += select('tmProtoState', 'Screen state', states.map(function (s) { return [s, STATE_LABELS[s] || s]; }), S.state);
    if (views.length > 1) html += select('tmProtoView', b.getAttribute('data-view-label') || 'View', views, S.view);
    html += '<a href="index.html">All screens</a></div>';
    var el = document.createElement('aside');
    el.className = 'tm-proto';
    el.setAttribute('aria-label', 'Prototype controls');
    el.setAttribute('data-collapsed', collapsed);
    el.innerHTML = html;
    document.body.appendChild(el);
    el.querySelector('.tm-proto-toggle').addEventListener('click', function () {
      var c = el.getAttribute('data-collapsed') !== 'true';
      el.setAttribute('data-collapsed', String(c));
      this.setAttribute('aria-expanded', String(!c));
      store.set('tm-proto-collapsed', String(c));
    });
    var r = el.querySelector('#tmProtoRole'), s = el.querySelector('#tmProtoState'), v = el.querySelector('#tmProtoView');
    if (r) r.addEventListener('change', function () { TM.setRole(this.value); });
    if (s) s.addEventListener('change', function () { TM.setState(this.value); });
    if (v) v.addEventListener('change', function () { TM.setView(this.value); });
  }

  function syncProto() {
    var r = document.getElementById('tmProtoRole'), s = document.getElementById('tmProtoState'), v = document.getElementById('tmProtoView');
    if (r) r.value = S.role;
    if (s) s.value = S.state;
    if (v && S.view) v.value = S.view;
  }

  function toast(msg, kind) {
    var host = document.querySelector('.tm-toasts');
    if (!host) {
      host = document.createElement('div');
      host.className = 'tm-toasts';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var t = document.createElement('div');
    t.className = 'tm-toast' + (kind === 'danger' ? ' is-danger' : '');
    t.innerHTML = '<i class="bi bi-' + (kind === 'danger' ? 'exclamation-octagon' : 'check2-circle') + '" aria-hidden="true"></i><span>' + esc(msg) + '</span>';
    host.appendChild(t);
    setTimeout(function () { t.remove(); }, kind === 'danger' ? 6000 : 3500);
  }

  window.TM = {
    users: USERS,
    get role() { return S.role; },
    get state() { return S.state; },
    get view() { return S.view; },
    user: function () { return USERS[S.role]; },
    setRole: function (r) { S.role = r; store.set('tm-role', r); renderShell(); syncProto(); apply(); },
    setState: function (s) { S.state = s; syncProto(); apply(); },
    setView: function (v) { S.view = v; syncProto(); apply(); },
    onChange: function (fn) { listeners.push(fn); },
    toast: toast,
    esc: esc,
    apply: apply
  };

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.body;
    var roles = attrList(b, 'data-roles') || ['manager'];
    var stored = store.get('tm-role', 'manager');
    S.role = roles.indexOf(stored) !== -1 ? stored : roles[0];
    S.state = (attrList(b, 'data-states') || ['loaded'])[0];
    var views = parseOptions(b.getAttribute('data-views'));
    S.view = views.length ? views[0][0] : null;
    var params = new URLSearchParams(location.search);
    if (params.get('view') && views.some(function (v) { return v[0] === params.get('view'); })) S.view = params.get('view');
    if (params.get('state')) S.state = params.get('state');
    buildShell();
    renderShell();
    buildProto();
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tm-toast]');
      if (t) { e.preventDefault(); toast(t.getAttribute('data-tm-toast'), t.getAttribute('data-tm-kind')); }
      var s = e.target.closest('[data-tm-set-state]');
      if (s) { e.preventDefault(); TM.setState(s.getAttribute('data-tm-set-state')); }
      var v = e.target.closest('[data-tm-set-view]');
      if (v) { e.preventDefault(); TM.setView(v.getAttribute('data-tm-set-view')); }
    });
    apply();
  });
})();
