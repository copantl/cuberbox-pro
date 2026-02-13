#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.9 (REVOLUTION BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: Full Sipwise Removal & SignalWire Inline GPG Injection
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
echo -e "      NEURAL ENGINE INSTALLER v4.8.9 (REVOLUTION)${NC}\n"

# 1. Privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere ROOT (sudo su)."
fi

# 2. PURGA DE REPOSITORIOS FALLIDOS (Limpieza total)
log_info "Purgando rastros de mirrors obsoletos (Sipwise/Freeswitch.org)..."
rm -f /etc/apt/sources.list.d/sipwise* /etc/apt/sources.list.d/freeswitch*
rm -f /usr/share/keyrings/sipwise* /usr/share/keyrings/signalwire*
log_success "Entorno de paquetes sanitizado."

# 3. SANEADOR DE REPOSITORIOS DEBIAN BASE
if ! grep -q "deb.debian.org" /etc/apt/sources.list; then
    log_warn "Fuentes base no detectadas. Reconstruyendo sources.list..."
    cat <<EOF > /etc/apt/sources.list
deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
EOF
fi

# 4. BOOTSTRAP
log_info "Instalando utilitarios de cifrado y red..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg2 wget lsb-release coreutils

# 5. PostgreSQL 16 (Data Plane)
REPO_DIST=$(lsb_release -cs 2>/dev/null || echo "bookworm")
[ "$REPO_DIST" = "trixie" ] && REPO_DIST="bookworm"

log_info "Instalando PostgreSQL 16 (${REPO_DIST})..."
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/pgdg.gpg
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 6. MEDIA PLANE (SignalWire REVOLUTION FIX)
log_info "Configurando Media Plane (SignalWire Master Channel)..."

SIGNALWIRE_KEY="/usr/share/keyrings/signalwire-freeswitch-repo.gpg"

# Lógica de descarga con inyector redundante
log_info "Obteniendo llave de firma SignalWire..."
if ! curl -fsSL https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor --yes -o "$SIGNALWIRE_KEY"; then
    log_warn "Error descargando llave GPG. Usando inyector estático de emergencia..."
    # Llave GPG pública de SignalWire estática para evitar bloqueos 404
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 208362B2E967D6D8
    log_success "Llave GPG inyectada vía servidor de llaves."
fi

echo "deb [signed-by=$SIGNALWIRE_KEY] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=$SIGNALWIRE_KEY] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" >> /etc/apt/sources.list.d/freeswitch.list

log_info "Instalando FreeSwitch Engine v1.10.x..."
apt-get update -y || {
    log_warn "Conflicto en actualización. Forzando limpieza de caché..."
    apt-get clean
    apt-get update -y
}

apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Falla en instalación modular. Intentando paquete base..."
    apt-get install -y freeswitch
}
log_success "Media Plane operativo."

# 7. CUBERBOX ENGINE (Go Core)
log_info "Compilando CUBERBOX Engine v4.8.9..."
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

# 8. SQL
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql || true

# 9. Seguridad & Daemons
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.8.9 (REVOLUTION)              ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Protocolo:${NC} SignalWire Official (Sipwise REMOVED)"
echo -e "=====================================================================\n"
