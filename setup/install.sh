#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.8 (PHOENIX BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: Sipwise 404 Mirror -> SignalWire Official Repo Migration
# =============================================================================

set -e

# Estética de Terminal
BOLD='\033[1m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
function log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

clear
echo -e "${BOLD}${CYAN}"
echo "   ____________   __________  ____  _  __"
echo "  / ____/ / / / __ ) / ____/ __ \/ __ )| |/ /"
echo " / /   / / / / __  |/ __/ / /_/ / __  ||   / "
echo "/ /___/ /_/ / /_/ / /___/ _, _/ /_/ / /   |  "
echo "\____/\____/_____/_____/_/ |_/_____/_/|_|  "
echo -e "      NEURAL ENGINE INSTALLER v4.8.8 (PHOENIX)${NC}\n"

# 1. Privilegios y Desbloqueo de APT
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere ROOT (sudo su)."
fi

log_info "Liberando locks y purgando espejos obsoletos..."
rm -f /var/lib/dpkg/lock* /var/lib/apt/lists/lock
rm -f /etc/apt/sources.list.d/sipwise* /etc/apt/sources.list.d/freeswitch*
rm -f /usr/share/keyrings/sipwise* /usr/share/keyrings/signalwire*

# 2. SANEADOR DE REPOSITORIOS
log_info "Sanitizando fuentes base..."
if ! grep -q "deb.debian.org" /etc/apt/sources.list; then
    cat <<EOF > /etc/apt/sources.list
deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
EOF
fi

# 3. BOOTSTRAP DE HERRAMIENTAS
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg2 wget lsb-release

# 4. PostgreSQL 16 (Data Plane)
REPO_DIST=$(lsb_release -cs 2>/dev/null || echo "bookworm")
[ "$REPO_DIST" = "trixie" ] && REPO_DIST="bookworm"

log_info "Instalando PostgreSQL 16 (${REPO_DIST})..."
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/pgdg.gpg
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 5. MEDIA PLANE (SignalWire Official - Solución 404)
log_info "Configurando Media Plane (SignalWire Official)..."

# Obtener llave de SignalWire
SIGNALWIRE_KEY="/usr/share/keyrings/signalwire-freeswitch-repo.gpg"
if ! curl -fsSL https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor --yes -o "$SIGNALWIRE_KEY"; then
    log_warn "Falla en descarga directa de llave. Intentando servidor de llaves alternativo..."
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 208362B2E967D6D8 || log_error "No se pudo validar la firma de SignalWire."
fi

echo "deb [signed-by=$SIGNALWIRE_KEY] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=$SIGNALWIRE_KEY] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" >> /etc/apt/sources.list.d/freeswitch.list

log_info "Instalando FreeSwitch Engine desde SignalWire..."
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Error en SignalWire, intentando instalación forzada de dependencias..."
    apt-get install -f -y
    apt-get install -y freeswitch
}
log_success "Media Plane operativo via SignalWire."

# 6. CUBERBOX ENGINE (Go Core)
log_info "Compilando CUBERBOX Engine v4.8.8..."
apt-get install -y git build-essential ufw golang-go
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod init github.com/copantl/cuberbox-pro/backend || true
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor Go compilado."

# 7. SQL
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql || true

# 8. Daemons
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.8.8 (PHOENIX)                 ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Repo SIP:${NC} SignalWire Official"
echo -e "=====================================================================\n"
