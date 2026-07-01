// ===== Global Search Button =====

(function() {

function injectSearchBtn() {
  if (document.getElementById('gs-fbtn')) return;

  var btn = document.createElement('div');
  btn.id = 'gs-fbtn';
  btn.innerHTML = '\uD83D\uDD0D  Search';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '99999',
    background: '#000', color: '#fff', padding: '10px 18px',
    borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: '14px', fontWeight: '600', lineHeight: '1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none'
  });
  btn.onclick = openSearchDialog;
  btn.onmouseenter = function() { this.style.background = '#333'; };
  btn.onmouseleave = function() { this.style.background = '#000'; };
  document.body.appendChild(btn);
}

function openSearchDialog() {
  var d = new frappe.ui.Dialog({
    title: 'Global Search', size: 'extra-large',
    fields: [{ fieldname: 'q', label: 'Search', fieldtype: 'Data', placeholder: 'Search all documents...' }],
    primary_action_label: 'Search',
    primary_action: function(v) { doSearch(d, v.q); }
  });
  d.show();
  d.$wrapper.find('[data-fieldname="q"] input').css('font-size', '16px').focus()
    .on('keydown', function(e) { if (e.which === 13) d.get_primary_btn().click(); });
  d.$wrapper.find('.modal-body').css('max-height', '600px').css('overflow-y', 'auto')
    .append('<div class="gs-results" style="margin-top:15px"></div>');
}

function doSearch(d, q) {
  var $r = d.$wrapper.find('.gs-results');
  if (!q || !q.trim()) { $r.empty(); return; }
  $r.html('<div class="text-muted text-center" style="padding:20px">Searching...</div>');
  frappe.call({
    method: 'frappe.utils.global_search.search',
    args: { text: q, limit: 100 },
    callback: function(r) {
      var data = r.message;
      if (!data || !data.length) { $r.html('<div class="text-muted text-center" style="padding:20px">No results</div>'); return; }
      var by = {};
      data.forEach(function(row) {
        if (!by[row.doctype]) by[row.doctype] = [];
        by[row.doctype].push(row);
      });
      var order = ['Customer','Contact','Lead','Comment','Communication'];
      var keys = Object.keys(by).sort(function(a, b) {
        var ai = order.indexOf(a), bi = order.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      var html = '<div>';
      keys.forEach(function(dt) {
        html += '<h6 style="margin:12px 0 4px;color:#666">' + dt + ' (' + by[dt].length + ')</h6>';
        by[dt].forEach(function(row) {
          var c = (row.content || '').substring(0, 150);
          html += '<div class="gs-item" data-doctype="' + row.doctype + '" data-name="' + (row.name || '').replace(/"/g, '&quot;') + '" style="padding:6px 8px;cursor:pointer;border-radius:4px">'
            + '<div style="font-weight:600;font-size:14px">' + (row.name || '') + '</div>'
            + '<div style="font-size:11px;color:#888">' + c + '</div></div>';
        });
      });
      html += '</div>';
      $r.html(html);
      $r.find('.gs-item').hover(
        function() { $(this).css('background', '#f5f5f5'); },
        function() { $(this).css('background', 'transparent'); }
      ).on('click', function() {
        frappe.set_route('Form', $(this).data('doctype'), $(this).data('name'));
      });
    }
  });
}

// Init
$(function() {
  injectSearchBtn();
  var mo = new MutationObserver(function() { if (!document.getElementById('gs-fbtn')) injectSearchBtn(); });
  mo.observe(document.body, { childList: true, subtree: true });
  $(window).on('hashchange', function() { setTimeout(injectSearchBtn, 800); });
  setInterval(function() { if (!document.getElementById('gs-fbtn')) injectSearchBtn(); }, 10000);
  try { frappe.ui.keys.on('ctrl+shift+f', openSearchDialog); } catch(e) {}
});

})();


// ===== Translate Comment on Customer =====

frappe.ui.form.on('Customer', {
  refresh: function(frm) {
    var tryInject = function() {
      var cb = frm.comment_box;
      if (!cb || !cb.button) return false;
      var $btn = $(cb.button);
      if (!$btn.length || $btn.closest('.comment-box').find('.btn-trc').length) return true;
      var langs = { en: 'English', uk: 'Ukrainian', ru: 'Russian' };
      var $row = $('<div class="btn-trc" style="display:flex;align-items:center;gap:6px;margin:6px 0 8px 48px">');
      var $sel = $('<select class="form-control" style="width:auto;height:26px;font-size:12px;padding:0 4px">');
      $sel.append('<option value="">Auto</option>');
      for (var k in langs) $sel.append('<option value="' + k + '">' + langs[k] + '</option>');
      $row.append($sel);
      $('<button class="btn btn-xs btn-default" type="button">Translate</button>')
        .appendTo($row).on('click', function() {
          var text = cb.get_value();
          if (!text || !text.trim()) { frappe.msgprint(__('Write a comment first')); return; }
          var c = $(this);
          c.prop('disabled', true).text('Translating...');
          frappe.call({
            method: 'translate_comment',
            args: { text: text, target_lang: $sel.val(), country: frm.doc.custom_country || '' },
            callback: function(r) {
              c.prop('disabled', false).text('Translate');
              if (r.message && r.message.translated) { cb.set_value(r.message.translated); frappe.show_alert({message: 'Translated', indicator: 'green'}); }
              else if (r.message && r.message.error) { frappe.msgprint('Error: ' + r.message.error); }
            }
          });
        });
      $row.insertBefore($btn);
      return true;
    };
    if (tryInject()) return;
    var r2 = 0;
    var t2 = setInterval(function() { r2++; if (tryInject() || r2 > 30) clearInterval(t2); }, 500);
  }
});


// ===== Translate Comment on Contact =====

frappe.ui.form.on('Contact', {
  refresh: function(frm) {
    var tryInject = function() {
      var cb = frm.comment_box;
      if (!cb || !cb.button) return false;
      var $btn = $(cb.button);
      if (!$btn.length || $btn.closest('.comment-box').find('.btn-trc').length) return true;
      var langs = { en: 'English', uk: 'Ukrainian', ru: 'Russian' };
      var $row = $('<div class="btn-trc" style="display:flex;align-items:center;gap:6px;margin:6px 0 8px 48px">');
      var $sel = $('<select class="form-control" style="width:auto;height:26px;font-size:12px;padding:0 4px">');
      $sel.append('<option value="">Auto</option>');
      for (var k in langs) $sel.append('<option value="' + k + '">' + langs[k] + '</option>');
      $row.append($sel);
      $('<button class="btn btn-xs btn-default" type="button">Translate</button>')
        .appendTo($row).on('click', function() {
          var text = cb.get_value();
          if (!text || !text.trim()) { frappe.msgprint(__('Write a comment first')); return; }
          var c = $(this);
          c.prop('disabled', true).text('Translating...');
          frappe.call({
            method: 'translate_comment',
            args: { text: text, target_lang: $sel.val(), country: frm.doc.custom_country || '' },
            callback: function(r) {
              c.prop('disabled', false).text('Translate');
              if (r.message && r.message.translated) { cb.set_value(r.message.translated); frappe.show_alert({message: 'Translated', indicator: 'green'}); }
              else if (r.message && r.message.error) { frappe.msgprint('Error: ' + r.message.error); }
            }
          });
        });
      $row.insertBefore($btn);
      return true;
    };
    if (tryInject()) return;
    var r2 = 0;
    var t2 = setInterval(function() { r2++; if (tryInject() || r2 > 30) clearInterval(t2); }, 500);
  }
});
