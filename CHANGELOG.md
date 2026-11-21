# Changelog

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
