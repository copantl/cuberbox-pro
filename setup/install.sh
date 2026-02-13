#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.4 (AETHER BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: Missing software-properties-common & CA-Certificates Bootstrap
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
echo -e "      NEURAL ENGINE INSTALLER v4.8.4 (AETHER)${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. PRE-IGNICIÓN: Certificados y Herramientas Base
log_info "Preparando bootstrap de certificados y seguridad..."
apt-get update -y
apt-get install -y ca-certificates gpg gnupg2 wget curl coreutils || log_warn "Falla parcial en bootstrap."

# 3. PURGA TOTAL DE REPOSITORIOS (Limpieza 401 y GPG corruptos)
log_info "Purgando rastros de repositorios bloqueados..."
rm -f /etc/apt/sources.list.d/freeswitch*
rm -f /etc/apt/sources.list.d/sipwise*
rm -f /etc/apt/sources.list.d/pgdg*
rm -f /usr/share/keyrings/freeswitch*
rm -f /usr/share/keyrings/sipwise*
rm -f /usr/share/keyrings/pgdg*
rm -f /etc/apt/trusted.gpg.d/freeswitch*
apt-get clean
log_success "Entorno de paquetes saneado."

# 4. INSTALACIÓN DE DEPENDENCIAS (Método Resiliente)
log_info "Instalando herramientas de sistema..."
# Intentar instalar software-properties-common, pero no morir si falla
apt-get install -y software-properties-common || log_warn "software-properties-common no disponible, usando método manual para repositorios."
apt-get install -y lsb-release git build-essential ufw certbot nginx golang-go || log_error "Falla crítica en dependencias base."

# 5. PostgreSQL 16 (Data Plane)
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
[ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "" ] && REPO_DIST="bookworm"

log_info "Configurando PostgreSQL 16 (${REPO_DIST})..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16
log_success "PostgreSQL listo."

# 6. INSTALACIÓN DE FREESWITCH (Sipwise Mirror - Sin dependencia de software-properties)
log_info "Configurando Media Plane (Sipwise Gateway)..."

TEMP_KEY="/tmp/sipwise.key"
wget -qO $TEMP_KEY https://deb.sipwise.com/spce/keyring.gpg || log_error "No se pudo descargar la llave SIP."

if grep -q "BEGIN PGP" "$TEMP_KEY"; then
    cat $TEMP_KEY | gpg --dearmor --yes -o /usr/share/keyrings/sipwise-keyring.gpg
else
    cp $TEMP_KEY /usr/share/keyrings/sipwise-keyring.gpg
fi

echo "deb [signed-by=/usr/share/keyrings/sipwise-keyring.gpg] https://deb.sipwise.com/spce/mr11.1.1/ bookworm main" > /etc/apt/sources.list.d/sipwise.list

log_info "Actualizando índices e instalando FreeSwitch..."
apt-get update -y
apt-get install -y freeswitch freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Sipwise falló, intentando repositorio nativo de Debian..."
    apt-get install -y freeswitch
}
log_success "FreeSwitch Engine activo."

# 7. Sincronización de CUBERBOX Engine (Go Core)
log_info "Desplegando CUBERBOX Pro Engine v4.8.4..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod init github.com/copantl/cuberbox-pro/backend || true
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Orquestador Go compilado."

# 8. Base de Datos e Integridad
log_info "Provisionando esquemas SQL..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql || log_warn "Esquema ya existente."

# 9. Seguridad y Daemons
log_info "Configurando blindaje UFW..."
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.8.4 (AETHER)                  ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Plataforma:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Estado SIP:${NC} systemctl status freeswitch"
echo -e "=====================================================================\n"
