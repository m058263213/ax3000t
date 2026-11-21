'use strict';
'require view';
'require rpc';
'require ui';
'require dom';
'require poll';

var callStatus   = rpc.declare({ object: 'xvpn', method: 'status' });
var callGet      = rpc.declare({ object: 'xvpn', method: 'get' });
var callSetLinks = rpc.declare({ object: 'xvpn', method: 'set_links', params: [ 'links' ] });
var callSetLists = rpc.declare({ object: 'xvpn', method: 'set_lists', params: [ 'domains', 'subnets' ] });
var callRestart  = rpc.declare({ object: 'xvpn', method: 'restart' });

var STATES = {
	ok:        { color: '#1e9e4a', icon: '●', title: 'Работает' },
	no_server: { color: '#d9822b', icon: '●', title: 'Нет связи с сервером' },
	stopped:   { color: '#c62828', icon: '●', title: 'Не запущен' },
	no_tun:    { color: '#c62828', icon: '●', title: 'Ошибка запуска' },
	no_route:  { color: '#c62828', icon: '●', title: 'Ошибка маршрута' },
	no_link:   { color: '#7a7a7a', icon: '●', title: 'Не настроен' }
};

var CSS = [
	'.xv-card{border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:18px 20px;margin:0 0 18px 0;background:rgba(128,128,128,.04)}',
	'.xv-head{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
	'.xv-dot{font-size:28px;line-height:1}',
	'.xv-title{font-size:20px;font-weight:600}',
	'.xv-msg{margin:10px 0 0 0;font-size:15px}',
	'.xv-facts{display:flex;gap:22px;flex-wrap:wrap;margin-top:12px;font-size:13px;opacity:.8}',
	'.xv-err{margin-top:12px;font-family:monospace;font-size:12px;white-space:pre-wrap;background:rgba(198,40,40,.08);border-radius:8px;padding:8px 10px}',
	'.xv-card h3{margin:0 0 6px 0;font-size:17px}',
	'.xv-hint{font-size:13px;opacity:.75;margin:0 0 10px 0}',
	'.xv-card textarea{width:100%;box-sizing:border-box;font-family:monospace;font-size:13px;border-radius:8px}',
	'.xv-btns{margin-top:10px;display:flex;gap:10px;flex-wrap:wrap}',
	'.xv-cols{display:flex;gap:18px;flex-wrap:wrap}.xv-cols>div{flex:1 1 280px}'
].join('\n');

function notify(res) {
	var ok = res && (res.ok === true || res.ok === 1);
	ui.addNotification(null, E('p', {}, (res && res.message) || (ok ? 'Готово' : 'Ошибка')), ok ? 'info' : 'danger');
	return ok;
}

return view.extend({
	load: function() {
		return Promise.all([ callStatus(), callGet() ]);
	},

	renderStatus: function(s) {
		s = s || {};
		var st = STATES[s.state] || { color: '#7a7a7a', icon: '●', title: s.state || '…' };
		var facts = [
			'Xray ' + (s.version || '—'),
			'Сервер: ' + (s.server || '—'),
			'Ссылок: ' + (s.links || 0),
			'Доменов в списке: ' + (s.domains || 0),
			'Подсетей: ' + (s.subnets || 0),
			'Адресов сайтов сейчас: ' + (s.ips || 0)
		];
		var body = [
			E('div', { 'class': 'xv-head' }, [
				E('span', { 'class': 'xv-dot', 'style': 'color:' + st.color }, st.icon),
				E('span', { 'class': 'xv-title' }, 'VPN: ' + st.title)
			]),
			E('p', { 'class': 'xv-msg' }, s.message || ''),
			E('div', { 'class': 'xv-facts' }, facts.map(function(f) { return E('span', {}, f); }))
		];
		if (s.state !== 'ok' && s.errors)
			body.push(E('div', { 'class': 'xv-err' }, 'Последние ошибки:\n' + s.errors));
		return E('div', { 'class': 'xv-card', 'style': 'border-left:6px solid ' + st.color }, body);
	},

	render: function(data) {
		var self = this, st = data[0] || {}, cfg = data[1] || {};
		if (st.setup_done === '0') { location.href = L.url('admin/wizard'); return E('p', { 'class': 'spinning' }, 'Мастер настройки…'); }
		var statusBox = E('div', {}, this.renderStatus(st));

		var links = E('textarea', { rows: 5, placeholder: 'vless://...' }, [ cfg.links || '' ]);
		var doms  = E('textarea', { rows: 14, placeholder: 'instagram.com\nyoutube.com' }, [ cfg.domains || '' ]);
		var nets  = E('textarea', { rows: 14, placeholder: '149.154.160.0/20' }, [ cfg.subnets || '' ]);

		var refresh = function() {
			return callStatus().then(function(s) { dom.content(statusBox, self.renderStatus(s)); });
		};

		var btn = function(label, cls, fn) {
			return E('button', { 'class': 'cbi-button ' + cls, 'click': ui.createHandlerFn(self, fn) }, label);
		};

		poll.add(refresh, 10);

		return E([], [
			E('style', {}, CSS),
			E('h2', {}, 'VPN'),
			E('p', { 'style': 'margin:-4px 0 14px 0' }, E('a', { 'href': L.url('admin/wizard') }, '⚙ Мастер настройки (язык, пароль, интернет, Wi-Fi, VPN)')),
			statusBox,
			E('div', { 'class': 'xv-btns', 'style': 'margin:-6px 0 18px 0' }, [
				btn('Обновить статус', 'cbi-button-neutral', refresh),
				btn('Перезапустить VPN', 'cbi-button-action', function() {
					return callRestart().then(notify).then(refresh);
				})
			]),

			E('div', { 'class': 'xv-card' }, [
				E('h3', {}, 'VPN-ссылка'),
				E('p', { 'class': 'xv-hint' }, 'Вставьте ссылку vless:// из подписки Hiddify (можно несколько — по одной в строке, лучше Reality). ' +
					'Перед применением настройки проверяются; при ошибке старая рабочая конфигурация сохраняется.'),
				links,
				E('div', { 'class': 'xv-btns' }, [
					btn('Сохранить и применить', 'cbi-button-apply', function() {
						return callSetLinks(links.value).then(notify).then(function() {
							return new Promise(function(r) { setTimeout(r, 4000); });
						}).then(refresh);
					})
				])
			]),

			E('div', { 'class': 'xv-card' }, [
				E('h3', {}, 'Сайты через VPN'),
				E('p', { 'class': 'xv-hint' }, 'Только эти сайты открываются через VPN, всё остальное — напрямую. ' +
					'Домены — по одному в строке, поддомены включаются автоматически (youtube.com → www.youtube.com, m.youtube.com…). ' +
					'После изменения на устройствах иногда нужно переоткрыть сайт.'),
				E('div', { 'class': 'xv-cols' }, [
					E('div', {}, [ E('b', {}, 'Домены'), doms ]),
					E('div', {}, [ E('b', {}, 'IP-адреса и подсети (необязательно)'), nets ])
				]),
				E('div', { 'class': 'xv-btns' }, [
					btn('Сохранить список', 'cbi-button-apply', function() {
						return callSetLists(doms.value, nets.value).then(notify).then(refresh);
					})
				])
			])
		]);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
