#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.6 (IRONCLAD BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: GPG Integrity Validation & Download Retry Logic
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
echo -e "      NEURAL ENGINE INSTALLER v4.8.6 (IRONCLAD)${NC}\n"

# 1. Privilegios y Desbloqueo de APT
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere ROOT (sudo su)."
fi

log_info "Liberando locks de procesos anteriores..."
rm -f /var/lib/dpkg/lock*
rm -f /var/lib/apt/lists/lock
rm -f /var/cache/apt/archives/lock

# 2. SANEADOR DE REPOSITORIOS
log_info "Sanitizando fuentes APT..."
if ! grep -q "deb.debian.org" /etc/apt/sources.list; then
    cat <<EOF > /etc/apt/sources.list
deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian/ bookworm-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
EOF
fi

# 3. BOOTSTRAP
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg2 wget coreutils lsb-release

# 4. LIMPIEZA DE LLAVES OBSOLETAS
rm -f /etc/apt/sources.list.d/freeswitch* /etc/apt/sources.list.d/sipwise*
rm -f /usr/share/keyrings/sipwise-keyring.gpg

# 5. PostgreSQL 16
REPO_DIST=$(lsb_release -cs 2>/dev/null || echo "bookworm")
[ "$REPO_DIST" = "trixie" ] && REPO_DIST="bookworm"

log_info "Configurando PostgreSQL 16 (${REPO_DIST})..."
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/pgdg.gpg
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 6. MEDIA PLANE (Sipwise Ironclad Fix)
log_info "Configurando Media Plane (Sipwise Gateway)..."

TEMP_KEY="/tmp/sipwise.key"
# Descarga con timeout y reintentos para evitar cuelgues
wget --timeout=15 --tries=3 -qO $TEMP_KEY https://deb.sipwise.com/spce/keyring.gpg || {
    log_warn "Sipwise Keyring indisponible. Intentando via curl..."
    curl -m 20 --retry 3 -fsSL https://deb.sipwise.com/spce/keyring.gpg -o $TEMP_KEY
}

# Validación de integridad: Comprobar que no sea HTML o archivo vacío
if [ ! -s "$TEMP_KEY" ] || grep -qi "<html>" "$TEMP_KEY"; then
    log_error "La llave descargada no es válida (Error de Mirror). Verifique su conexión a internet."
fi

log_info "Importando credenciales SIP..."
if grep -q "BEGIN PGP" "$TEMP_KEY"; then
    cat $TEMP_KEY | gpg --dearmor --yes -o /usr/share/keyrings/sipwise-keyring.gpg
else
    cp $TEMP_KEY /usr/share/keyrings/sipwise-keyring.gpg
fi

# Usando rama mr11.3.1 (Más estable)
echo "deb [signed-by=/usr/share/keyrings/sipwise-keyring.gpg] https://deb.sipwise.com/spce/mr11.3.1/ bookworm main" > /etc/apt/sources.list.d/sipwise.list

log_info "Instalando FreeSwitch Engine..."
apt-get update -y
apt-get install -y freeswitch freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_error "Falla crítica instalando FreeSwitch. El mirror SIP no respondió correctamente."
}
log_success "Media Plane operativo."

# 7. CUBERBOX ENGINE (Go Core)
log_info "Compilando CUBERBOX Engine v4.8.6..."
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

# 8. SQL
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql || true

# 9. Seguridad
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.8.6 (IRONCLAD)                ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Versión:${NC} 4.8.6"
echo -e "=====================================================================\n"
