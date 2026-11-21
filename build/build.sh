#!/bin/bash
# Build the MOGIKANIN firmware for Xiaomi AX3000T (MT7981) with the official OpenWrt ImageBuilder.
# Requirements: Linux x86_64, ~2 GB free disk, packages: make gawk gcc perl python3 rsync unzip zstd curl file
# Usage: ./build/build.sh            (from the repository root)
set -euo pipefail

OWRT_VER=25.12.6
IB_SHA256=8ce0da1e2fb3d0454ebeb1e3df5705f2145e09ffe6f00d5077c18369719daf83
XRAY_VER=26.11.9
XRAY_ZIP_SHA256=64ed6858982a7f5eb85d88b811089063bd4f17561f4c8f44e0f1dc8e6f6430be
PROFILE=xiaomi_mi-router-ax3000t
PACKAGES="luci luci-i18n-base-ru luci-i18n-firewall-ru luci-theme-footstrap -dnsmasq dnsmasq-full xray-core kmod-tun xl2tpd"

ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=${WORK:-$ROOT/.build}
mkdir -p "$WORK" && cd "$WORK"

IB=openwrt-imagebuilder-$OWRT_VER-mediatek-filogic.Linux-x86_64.tar.zst
[ -f "$IB" ] || curl -fL -o "$IB" "https://downloads.openwrt.org/releases/$OWRT_VER/targets/mediatek/filogic/$IB"
echo "$IB_SHA256  $IB" | sha256sum -c -
[ -d ib ] || { mkdir ib && tar --zstd -xf "$IB" -C ib --strip-components=1; }

[ -f xray.zip ] || curl -fL -o xray.zip "https://github.com/XTLS/Xray-core/releases/download/v$XRAY_VER/Xray-linux-arm64-v8a.zip"
echo "$XRAY_ZIP_SHA256  xray.zip" | sha256sum -c -

rm -rf files && cp -a "$ROOT/files" files
mkdir -p files/usr/bin && unzip -o -q xray.zip xray -d files/usr/bin/
chmod 755 files/usr/bin/xray files/usr/bin/xvpn files/usr/bin/xvpn-wizard files/usr/libexec/rpcd/xvpn files/etc/uci-defaults/99-mogikanin

cd ib && rm -rf bin/targets
make image PROFILE=$PROFILE PACKAGES="$PACKAGES" FILES="$WORK/files" EXTRA_IMAGE_NAME=mogikanin
OUT=bin/targets/mediatek/filogic
ls -l $OUT/*mogikanin*sysupgrade.bin
sha256sum $OUT/*mogikanin*sysupgrade.bin
