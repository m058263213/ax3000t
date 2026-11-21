# Changelog

## v1.0.1 — 2026-11-22

Resource fix: the L2TP daemon no longer runs when it is not needed.

- `xl2tpd` is disabled on first boot (unless an L2TP connection is already configured). In v1.0.0 it ran on every router, even with DHCP/PPPoE/static WAN, and took about 1 MB of RAM.
- Setup wizard: choosing **L2TP** sets `xl2tpd` to autostart; choosing DHCP, PPPoE or static IP stops it and disables autostart.
- Tested on the router: with autostart disabled, OpenWrt's L2TP protocol handler (`l2tp.sh`) starts `xl2tpd` by itself within ~2 s when an L2TP interface comes up, so L2TP keeps working after a reboot either way.
- Upgrading from v1.0.0 with "Keep settings" keeps the current service state (OpenWrt restores disabled services after sysupgrade). To turn the daemon off on an existing router: LuCI → System → Startup → `xl2tpd` → Disable, Stop (only if you do not use L2TP).
- No other changes: same packages, Xray 26.11.9, same default site list.

Русский: служба L2TP (`xl2tpd`) больше не работает без необходимости. На новой установке она выключена; мастер включает её автозапуск только при выборе L2TP, а при DHCP/PPPoE/статическом IP останавливает. При обновлении с v1.0.0 с сохранением настроек состояние службы не меняется — выключить вручную: LuCI → Система → Загрузка → `xl2tpd` → «Отключить», «Остановить» (если L2TP не используется).

## v1.0.0 — 2026-11-21

First public release.

- OpenWrt 25.12.6, profile `xiaomi_mi-router-ax3000t` (stock layout).
- Selective VPN through Xray 26.11.9 (official XTLS release; VLESS + Reality, TCP/Vision and XHTTP) on a TUN interface.
- LuCI pages "VPN" (status, links, site lists) and "Setup wizard" (language, admin password, DHCP/PPPoE/L2TP/static, Wi-Fi, VPN link).
- Footstrap theme with the GMN cube logo.
- Hardened defaults: web/SSH closed from WAN, SSH keys only, IPv6 off, forced DNS, DoT blocked, no UPnP.

Fixed during the clean-install test (before release):
- LAN address is written in OpenWrt 25.12 CIDR form (`192.168.31.1/24`); without the mask the LAN became a /32 and DHCP did not work.
- The wizard now enables the Wi-Fi interfaces as well as the radios (25.12 keeps `wifi-iface` disabled by default).
- LuCI listens on all addresses (WAN is blocked by the firewall), so it stays reachable if the LAN address is changed.
