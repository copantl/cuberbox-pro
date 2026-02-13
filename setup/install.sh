#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.7.5 (FIXED BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Repo: https://github.com/copantl/cuberbox-pro
# =============================================================================

set -e

# Configuración de Terminal (Estética Pro)
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
echo -e "      NEURAL ENGINE INSTALLER v4.7.5${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Reparación de Git y Proxy de Go (CRÍTICO PARA EL ERROR DE USERNAME)
log_info "Configurando entorno de compilación resiliente..."
# Eliminar redirecciones de Git que fuerzan SSH
git config --global --unset-all url."git@github.com:".insteadOf || true
git config --global --unset-all url."https://github.com/".insteadOf || true
export GIT_TERMINAL_PROMPT=1
export GO111MODULE=on
export GOPROXY=https://proxy.golang.org,direct
export GOSUMDB=sum.golang.org

# 3. Instalación de Dependencias Base
log_info "Actualizando repositorios y utilidades..."
apt-get update -y
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go \
    software-properties-common python3-software-properties || log_warn "Ciertas dependencias de Debian 13 podrían requerir instalación manual posterior."

# 4. Determinación de Versión para Repositorios Externos
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
if [ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "n/a" ]; then
    log_warn "Debian 13 (o versión no estándar) detectado. Usando 'bookworm' como base de compatibilidad."
    REPO_DIST="bookworm"
fi

# 5. PostgreSQL 16 (Data Plane)
log_info "Sincronizando PostgreSQL 16..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 6. Sincronización del Código Fuente
log_info "Clonando repositorio maestro..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
log_success "Repositorio clonado en /opt/cuberbox"

# 7. Compilación del Backend (Go Engine - FIX PARA EL ERROR DE MODULO)
log_info "Compilando motor orquestador (Go)..."
cd /opt/cuberbox/backend

# Limpiar posibles estados corruptos
go clean -modcache || true

# Inicializar si no existe
if [ ! -f go.mod ]; then
    log_info "Generando go.mod estructurado..."
    go mod init github.com/copantl/cuberbox-pro/backend
fi

log_info "Descargando dependencias públicas via Proxy..."
go mod tidy -v
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Backend compilado en /usr/local/bin/cuberbox-engine"

# 8. Instalación de FreeSwitch (Media Plane)
log_info "Configurando motor SIP FreeSwitch..."
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | gpg --dearmor > /usr/share/keyrings/freeswitch-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/freeswitch-archive-keyring.gpg] http://files.freeswitch.org/repo/deb/debian-release/ ${REPO_DIST} main" > /etc/apt/sources.list.d/freeswitch.list
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc

# 9. Seguridad y Firewall
log_info "Aplicando blindaje UFW..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp
ufw allow 7443/tcp
ufw --force enable

# 10. Base de Datos e Inyección
log_info "Provisionando Esquema SQL V4..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 11. Activación de Daemons
log_info "Registrando servicios en SystemD..."
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
    log_success "Daemon orquestador iniciado."
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      INSTALACIÓN COMPLETADA EXITOSAMENTE (V4.7.5)                   ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "${BOLD}Source:${NC} https://github.com/copantl/cuberbox-pro"
echo -e "=====================================================================\n"
