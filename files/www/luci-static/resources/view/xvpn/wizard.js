'use strict';
'require view';
'require rpc';
'require ui';
'require dom';

var callGet    = rpc.declare({ object: 'xvpn', method: 'wizard_get' });
var callApply  = rpc.declare({ object: 'xvpn', method: 'wizard_apply', params: [ 'data' ] });
var callStatus = rpc.declare({ object: 'xvpn', method: 'status' });

var TXT = {
	ru: {
		title: 'Мастер настройки', step: 'Шаг', of: 'из', next: 'Далее', back: 'Назад', skip: 'Пропустить', finish: 'Применить',
		s_lang: 'Язык', s_admin: 'Администратор', s_inet: 'Интернет', s_wifi: 'Wi-Fi', s_vpn: 'VPN', s_done: 'Готово',
		lang_hint: 'Язык веб-интерфейса роутера.',
		admin_hint: 'Пароль для входа в настройки роутера. Логин всегда: root.',
		admin_has: 'Пароль уже задан — оставьте поля пустыми, чтобы не менять.',
		pw: 'Пароль', pw2: 'Повторите пароль', pw_short: 'Пароль — минимум 6 символов', pw_diff: 'Пароли не совпадают', pw_need: 'Задайте пароль администратора',
		inet_hint: 'Как роутер подключается к провайдеру. Если не знаете — выберите «Автоматически (DHCP)».',
		dhcp: 'Автоматически (DHCP)', pppoe: 'PPPoE (логин и пароль от провайдера)', l2tp: 'L2TP (например, Билайн)', static: 'Статический IP',
		login: 'Логин', wpw: 'Пароль провайдера', server: 'Сервер L2TP', ip: 'IP-адрес', mask: 'Маска', gw: 'Шлюз', dns: 'DNS (через запятую)',
		need: 'Заполните поле', 
		wifi_hint: 'Одно имя сети для 2,4 и 5 ГГц.',
		enc: 'Защита', enc_mixed: 'WPA2/WPA3 — рекомендуется, подходит почти всем', enc_sae: 'WPA3 — максимальная защита, только новые устройства', enc_psk2: 'WPA2 — для старых устройств (принтеры, ТВ)', enc_none: 'Без пароля (открытая сеть)', open_warn: 'Внимание: к открытой сети сможет подключиться любой, кто рядом, и пользоваться вашим интернетом и VPN.',
		ssid: 'Имя сети (SSID)', wkey: 'Пароль Wi-Fi', wkey_short: 'Пароль Wi-Fi — минимум 8 символов', wkey_has: 'Пароль уже задан — оставьте пустым, чтобы не менять.',
		vpn_hint: 'Вставьте ссылку vless:// из подписки Hiddify (можно несколько, по одной в строке). Можно пропустить и добавить позже на странице «VPN».',
		vpn_has: 'Ссылка уже задана — оставьте поле пустым, чтобы не менять.',
		vpn_bad: 'Нужна ссылка, начинающаяся с vless://',
		review: 'Проверьте и нажмите «Применить». Сеть роутера перезапустится — связь пропадёт на 20–30 секунд.',
		applying: 'Применяю настройки и перезапускаю сеть…', checking: 'Проверяю подключение…',
		ok_inet: 'Интернет работает', no_inet: 'Нет интернета — проверьте кабель провайдера и тип подключения',
		ok_vpn: 'VPN работает', no_vpn: 'VPN пока не работает', skip_vpn: 'VPN не настроен',
		to_vpn: 'Открыть страницу VPN', again: 'Пройти мастер ещё раз',
		wifi_note: 'Если вы подключены по Wi-Fi и поменяли имя или пароль — переподключитесь к новой сети.'
	},
	en: {
		title: 'Setup wizard', step: 'Step', of: 'of', next: 'Next', back: 'Back', skip: 'Skip', finish: 'Apply',
		s_lang: 'Language', s_admin: 'Administrator', s_inet: 'Internet', s_wifi: 'Wi-Fi', s_vpn: 'VPN', s_done: 'Done',
		lang_hint: 'Language of the router web interface.',
		admin_hint: 'Password for the router settings. Login is always: root.',
		admin_has: 'A password is already set — leave empty to keep it.',
		pw: 'Password', pw2: 'Repeat password', pw_short: 'Password: at least 6 characters', pw_diff: 'Passwords do not match', pw_need: 'Set an administrator password',
		inet_hint: 'How the router connects to your provider. If unsure, choose “Automatic (DHCP)”.',
		dhcp: 'Automatic (DHCP)', pppoe: 'PPPoE (login and password from provider)', l2tp: 'L2TP', static: 'Static IP',
		login: 'Login', wpw: 'Provider password', server: 'L2TP server', ip: 'IP address', mask: 'Netmask', gw: 'Gateway', dns: 'DNS (comma separated)',
		need: 'Fill in this field',
		wifi_hint: 'One network name for 2.4 and 5 GHz.',
		enc: 'Security', enc_mixed: 'WPA2/WPA3 — recommended, works with almost everything', enc_sae: 'WPA3 — strongest, new devices only', enc_psk2: 'WPA2 — for old devices (printers, TVs)', enc_none: 'No password (open network)', open_warn: 'Warning: anyone nearby can join an open network and use your internet and VPN.',
		ssid: 'Network name (SSID)', wkey: 'Wi-Fi password', wkey_short: 'Wi-Fi password: at least 8 characters', wkey_has: 'A password is already set — leave empty to keep it.',
		vpn_hint: 'Paste the vless:// link from your Hiddify subscription (several allowed, one per line). You can skip this and add it later on the VPN page.',
		vpn_has: 'A link is already set — leave empty to keep it.',
		vpn_bad: 'The link must start with vless://',
		review: 'Check and press “Apply”. The router network restarts — connection drops for 20–30 seconds.',
		applying: 'Applying settings and restarting the network…', checking: 'Checking the connection…',
		ok_inet: 'Internet works', no_inet: 'No internet — check the provider cable and connection type',
		ok_vpn: 'VPN works', no_vpn: 'VPN is not working yet', skip_vpn: 'VPN not configured',
		to_vpn: 'Open the VPN page', again: 'Run the wizard again',
		wifi_note: 'If you are on Wi-Fi and changed its name or password, reconnect to the new network.'
	}
};

var CSS = [
	'.wz{max-width:720px;margin:0 auto}',
	'.wz-steps{display:flex;gap:6px;margin:6px 0 18px 0;flex-wrap:wrap}',
	'.wz-steps span{flex:1 1 80px;text-align:center;font-size:12px;padding:6px 4px;border-radius:20px;background:rgba(128,128,128,.12);opacity:.7}',
	'.wz-steps span.on{background:#1a73e8;color:#fff;opacity:1}',
	'.wz-steps span.done{background:rgba(30,158,74,.18);opacity:1}',
	'.wz-card{border:1px solid rgba(128,128,128,.25);border-radius:14px;padding:22px 24px;background:rgba(128,128,128,.04)}',
	'.wz-card h3{margin:0 0 6px 0;font-size:20px}',
	'.wz-hint{opacity:.75;margin:0 0 16px 0}',
	'.wz-f{margin:0 0 14px 0}.wz-f label{display:block;font-size:13px;margin-bottom:4px;opacity:.85}',
	'.wz-f input,.wz-f select,.wz-f textarea{width:100%;box-sizing:border-box;font-size:15px;padding:8px 10px;border-radius:8px}',
	'.wz-f textarea{font-family:monospace;font-size:13px}',
	'.wz-opt{display:block;border:1px solid rgba(128,128,128,.3);border-radius:10px;padding:10px 12px;margin:0 0 8px 0;cursor:pointer}',
	'.wz-opt input{margin-right:8px}',
	'.wz-err{color:#c62828;font-size:13px;min-height:18px;margin:4px 0 0 0}',
	'.wz-nav{display:flex;justify-content:space-between;gap:10px;margin-top:18px}',
	'.wz-res{font-size:16px;margin:8px 0}.wz-res b{font-size:20px;margin-right:6px}',
	'.wz-sum{font-size:14px;line-height:1.7}'
].join('\n');

return view.extend({
	load: function() { return callGet(); },

	render: function(cur) {
		var self = this;
		cur = cur || {};
		var st = {
			lang: (cur.lang === 'en') ? 'en' : 'ru',
			proto: cur.proto || 'dhcp', username: cur.username || '', server: cur.server || '',
			ipaddr: cur.ipaddr || '', netmask: cur.netmask || '255.255.255.0', gateway: cur.gateway || '', dns: cur.dns || '',
			ssid: cur.ssid || 'mogikanin', encryption: 'none', password: '', password2: '', wan_password: '', wifi_key: '', links: ''
		};
		var steps = [ 's_lang', 's_admin', 's_inet', 's_wifi', 's_vpn', 's_done' ];
		var idx = 0;
		var root = E('div', { 'class': 'wz' });
		var T = function(k) { return TXT[st.lang][k] || k; };

		var field = function(label, key, type, extra) {
			var inp = E('input', Object.assign({ type: type || 'text', value: st[key] || '', autocomplete: 'off',
				input: function(ev) { st[key] = ev.target.value; } }, extra || {}));
			return E('div', { 'class': 'wz-f' }, [ E('label', {}, label), inp ]);
		};
		var radio = function(name, val, label, onpick) {
			return E('label', { 'class': 'wz-opt' }, [
				E('input', { type: 'radio', name: name, value: val, checked: st[name] === val ? '' : null,
					change: function() { st[name] = val; if (onpick) onpick(); } }), label ]);
		};
		var errBox = E('div', { 'class': 'wz-err' });

		var validate = function() {
			var e = '';
			if (steps[idx] === 's_admin') {
				if (!st.password) e = T('pw_need');
				else if (st.password.length < 6) e = T('pw_short');
				else if (st.password !== st.password2) e = T('pw_diff');
			} else if (steps[idx] === 's_inet') {
				var req = { pppoe: [ 'username', 'wan_password' ], l2tp: [ 'server', 'username', 'wan_password' ], static: [ 'ipaddr', 'netmask', 'gateway' ] }[st.proto] || [];
				req.forEach(function(k) { if (!st[k]) e = T('need'); });
			} else if (steps[idx] === 's_wifi') {
				if (!st.ssid) e = T('need');
				else if (st.encryption !== 'none' && (!st.wifi_key || st.wifi_key.length < 8)) e = T('wkey_short');
			} else if (steps[idx] === 's_vpn') {
				if (st.links && !/vless:\/\//.test(st.links)) e = T('vpn_bad');
			}
			errBox.textContent = e;
			return !e;
		};

		var body = function() {
			var s = steps[idx], c = [];
			if (s === 's_lang') {
				c.push(E('p', { 'class': 'wz-hint' }, T('lang_hint')));
				c.push(radio('lang', 'ru', 'Русский', draw));
				c.push(radio('lang', 'en', 'English', draw));
			} else if (s === 's_admin') {
				c.push(E('p', { 'class': 'wz-hint' }, T('admin_hint')));
				c.push(field(T('pw'), 'password', 'password'));
				c.push(field(T('pw2'), 'password2', 'password'));
			} else if (s === 's_inet') {
				c.push(E('p', { 'class': 'wz-hint' }, T('inet_hint')));
				[ 'dhcp', 'pppoe', 'l2tp', 'static' ].forEach(function(p) { c.push(radio('proto', p, T(p), draw)); });
				if (st.proto === 'l2tp') c.push(field(T('server'), 'server'));
				if (st.proto === 'pppoe' || st.proto === 'l2tp') { c.push(field(T('login'), 'username')); c.push(field(T('wpw'), 'wan_password', 'password')); }
				if (st.proto === 'static') { c.push(field(T('ip'), 'ipaddr')); c.push(field(T('mask'), 'netmask')); c.push(field(T('gw'), 'gateway')); c.push(field(T('dns'), 'dns')); }
			} else if (s === 's_wifi') {
				c.push(E('p', { 'class': 'wz-hint' }, T('wifi_hint')));
				c.push(field(T('ssid'), 'ssid'));
				c.push(E('div', { 'class': 'wz-f' }, E('label', {}, T('enc'))));
				c.push(radio('encryption', 'sae-mixed', T('enc_mixed'), draw));
				c.push(radio('encryption', 'sae', T('enc_sae'), draw));
				c.push(radio('encryption', 'psk2', T('enc_psk2'), draw));
				c.push(radio('encryption', 'none', T('enc_none'), draw));
				if (st.encryption === 'none') c.push(E('p', { 'class': 'wz-err', 'style': 'font-size:14px' }, T('open_warn')));
				else c.push(field(T('wkey'), 'wifi_key', 'password'));
			} else if (s === 's_vpn') {
				c.push(E('p', { 'class': 'wz-hint' }, T('vpn_hint') + (cur.has_links ? ' ' + T('vpn_has') : '')));
				c.push(E('div', { 'class': 'wz-f' }, E('textarea', { rows: 5, placeholder: 'vless://...',
					input: function(ev) { st.links = ev.target.value; } }, [ st.links ])));
			} else if (s === 's_done') {
				c.push(E('p', { 'class': 'wz-hint' }, T('review')));
				c.push(E('div', { 'class': 'wz-sum' }, [
					E('div', {}, T('s_lang') + ': ' + (st.lang === 'en' ? 'English' : 'Русский')),
					E('div', {}, T('s_admin') + ': root' + (st.password ? ' — ' + T('pw') + ' ✓' : '')),
					E('div', {}, T('s_inet') + ': ' + T(st.proto) + (st.username ? ' — ' + st.username : '')),
					E('div', {}, T('s_wifi') + ': ' + st.ssid + ', ' + ({ 'sae-mixed': 'WPA2/WPA3', 'sae': 'WPA3', 'psk2': 'WPA2', 'none': T('enc_none') })[st.encryption] + (st.wifi_key ? ' — ' + T('wkey') + ' ✓' : '')),
					st.encryption === 'none' ? E('div', { 'class': 'wz-err', 'style': 'font-size:14px' }, T('open_warn')) : E('span'),
					E('div', {}, T('s_vpn') + ': ' + (st.links ? (st.links.match(/vless:\/\//g) || []).length + ' vless' : (cur.has_links ? '✓' : T('skip_vpn'))))
				]));
			}
			return c;
		};

		var apply = function() {
			var data = {
				lang: st.lang, password: st.password, proto: st.proto, username: st.username, wan_password: st.wan_password,
				server: st.server, ipaddr: st.ipaddr, netmask: st.netmask, gateway: st.gateway, dns: st.dns,
				ssid: st.ssid, wifi_key: (st.encryption === 'none' ? '' : st.wifi_key), encryption: st.encryption, links: st.links
			};
			dom.content(root, [ E('div', { 'class': 'wz-card' }, [ E('h3', {}, T('title')), E('p', { 'class': 'spinning' }, T('applying')) ]) ]);
			return callApply(data).then(function(res) {
				return new Promise(function(r) { setTimeout(r, 25000); }).then(function() {
					dom.content(root, [ E('div', { 'class': 'wz-card' }, [ E('h3', {}, T('title')), E('p', { 'class': 'spinning' }, T('checking')) ]) ]);
					return callStatus().catch(function() { return {}; });
				}).then(function(s) {
					var inet = s.internet, vpn = (s.state === 'ok');
					var lines = [
						E('div', { 'class': 'wz-res' }, [ E('b', { style: 'color:' + (inet ? '#1e9e4a' : '#c62828') }, inet ? '✓' : '✗'), inet ? T('ok_inet') : T('no_inet') ]),
						E('div', { 'class': 'wz-res' }, [ E('b', { style: 'color:' + (vpn ? '#1e9e4a' : (s.state === 'no_link' ? '#7a7a7a' : '#d9822b')) }, vpn ? '✓' : '•'),
							vpn ? T('ok_vpn') : (s.state === 'no_link' ? T('skip_vpn') : T('no_vpn') + (s.message ? ': ' + s.message : '')) ])
					];
					if (res && res.message) lines.push(E('p', { 'class': 'wz-hint', style: 'white-space:pre-wrap;margin-top:12px' }, res.message));
					if (res && res.errors) lines.push(E('p', { 'class': 'wz-err', style: 'white-space:pre-wrap' }, res.errors));
					lines.push(E('p', { 'class': 'wz-hint' }, T('wifi_note')));
					lines.push(E('div', { 'class': 'wz-nav' }, [
						E('button', { 'class': 'cbi-button cbi-button-neutral', click: function() { location.reload(); } }, T('again')),
						E('button', { 'class': 'cbi-button cbi-button-apply', click: function() { location.href = L.url('admin/xvpn'); } }, T('to_vpn'))
					]));
					dom.content(root, [ E('div', { 'class': 'wz-card' }, [ E('h3', {}, T('s_done')) ].concat(lines)) ]);
				});
			});
		};

		var draw = function() {
			var nav = [];
			nav.push(idx > 0 ? E('button', { 'class': 'cbi-button cbi-button-neutral', click: function() { idx--; draw(); } }, T('back')) : E('span'));
			var right = [];
			if (steps[idx] === 's_vpn') right.push(E('button', { 'class': 'cbi-button cbi-button-neutral', style: 'margin-right:8px',
				click: function() { st.links = ''; idx++; draw(); } }, T('skip')));
			if (steps[idx] === 's_done') right.push(E('button', { 'class': 'cbi-button cbi-button-apply', click: ui.createHandlerFn(self, apply) }, T('finish')));
			else right.push(E('button', { 'class': 'cbi-button cbi-button-action', click: function() { if (validate()) { idx++; draw(); } } }, T('next')));
			nav.push(E('span', {}, right));
			errBox.textContent = '';
			dom.content(root, [
				E('div', { 'class': 'wz-steps' }, steps.map(function(k, i) {
					return E('span', { 'class': i === idx ? 'on' : (i < idx ? 'done' : '') }, (i + 1) + '. ' + T(k));
				})),
				E('div', { 'class': 'wz-card' }, [ E('h3', {}, T(steps[idx])) ].concat(body()).concat([ errBox, E('div', { 'class': 'wz-nav' }, nav) ]))
			]);
		};

		draw();
		return E([], [ E('style', {}, CSS), root ]);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
