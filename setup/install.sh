#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.5 (STALWART BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie) / Ubuntu 22.04+
# Fix: Package Not Found (APT Sanitizer) & Non-Interactive GPG
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
echo -e "      NEURAL ENGINE INSTALLER v4.8.5 (STALWART)${NC}\n"

# 1. Privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere ROOT (sudo su)."
fi

# 2. SANEADOR DE REPOSITORIOS (Solución a software-properties-common not found)
log_info "Analizando integridad de fuentes APT..."
if ! grep -q "deb.debian.org" /etc/apt/sources.list; then
    log_warn "Fuentes oficiales no detectadas. Reconstruyendo sources.list para Debian 12..."
    cat <<EOF > /etc/apt/sources.list
deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
EOF
    apt-get clean
fi

# 3. PRE-BOOTSTRAP
log_info "Actualizando certificados y herramientas críticas..."
apt-get update -y || log_warn "Caché APT inconsistente, intentando reparar..."
apt-get install -y ca-certificates curl gnupg gnupg2 wget coreutils lsb-release

# 4. LIMPIEZA ABSOLUTA (Eliminar rastros de errores 401 previos)
log_info "Purgando configuración de repositorios antiguos..."
rm -f /etc/apt/sources.list.d/freeswitch* /etc/apt/sources.list.d/sipwise* /etc/apt/sources.list.d/pgdg*
rm -f /usr/share/keyrings/freeswitch* /usr/share/keyrings/sipwise* /usr/share/keyrings/pgdg*
apt-get clean

# 5. PostgreSQL 16 (Data Plane)
REPO_DIST=$(lsb_release -cs 2>/dev/null || echo "bookworm")
[ "$REPO_DIST" = "trixie" ] && REPO_DIST="bookworm"

log_info "Configurando PostgreSQL 16 (${REPO_DIST})..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 6. FREESWITCH (Sipwise Mirror - Método Sin software-properties-common)
log_info "Configurando Media Plane (Sipwise Binary Key)..."
TEMP_KEY="/tmp/sipwise.key"
wget -qO $TEMP_KEY https://deb.sipwise.com/spce/keyring.gpg
if grep -q "BEGIN PGP" "$TEMP_KEY"; then
    cat $TEMP_KEY | gpg --dearmor --yes -o /usr/share/keyrings/sipwise-keyring.gpg
else
    cp $TEMP_KEY /usr/share/keyrings/sipwise-keyring.gpg
fi

echo "deb [signed-by=/usr/share/keyrings/sipwise-keyring.gpg] https://deb.sipwise.com/spce/mr11.1.1/ bookworm main" > /etc/apt/sources.list.d/sipwise.list

log_info "Instalando FreeSwitch Engine..."
apt-get update -y
apt-get install -y freeswitch freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Error en Sipwise Mirror, recurriendo a repositorio base..."
    apt-get install -y freeswitch
}
log_success "FreeSwitch está activo."

# 7. CUBERBOX ENGINE (Go Core)
log_info "Compilando CUBERBOX Engine v4.8.5..."
apt-get install -y git build-essential ufw certbot nginx golang-go
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod init github.com/copantl/cuberbox-pro/backend || true
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor Go compilado."

# 8. SQL Injection
log_info "Provisionando base de datos..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql || log_warn "Esquema ya existía."

# 9. Seguridad
log_info "Configurando Firewall..."
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.8.5 (STALWART)                ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Versión:${NC} 4.8.5"
echo -e "=====================================================================\n"
