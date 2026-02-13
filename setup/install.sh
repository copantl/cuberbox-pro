#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.7.8 (ULTRA-RESILIENT)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: Public Go Modules & Software Properties Recovery
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
echo -e "      NEURAL ENGINE INSTALLER v4.7.8${NC}\n"

# 1. Verificación de Privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Configuración de Entorno de Compilación (CRÍTICO)
log_info "Preparando entorno de red para descarga de módulos públicos..."
export GO111MODULE=on
export GOPROXY=https://proxy.golang.org,direct
export GOSUMDB=sum.golang.org
# Limpiar configuraciones previas de Git que puedan interferir
git config --global --unset-all url."git@github.com:".insteadOf || true
git config --global --unset-all url."https://github.com/".insteadOf || true

# 3. Reparación de software-properties-common y dependencias base
log_info "Actualizando índices de paquetes Debian..."
apt-get update -y

log_info "Instalando dependencias de gestión de sistema..."
# Fallback agresivo para Debian 13
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go python3-launchpadlib || log_warn "Falla menor en utilidades base."
apt-get install -y software-properties-common python3-software-properties || log_warn "software-properties-common no disponible, procediendo con comandos nativos."

# 4. Compatibilidad de Repositorios (PostgreSQL 16)
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
if [ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "" ]; then
    log_warn "Versión experimental detectada. Usando base estable 'bookworm' para repositorios externos."
    REPO_DIST="bookworm"
fi

log_info "Configurando repositorio oficial de PostgreSQL..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list

apt-get update -y
apt-get install -y postgresql-16
log_success "PostgreSQL 16 listo."

# 5. Clonación del Repositorio Maestro
log_info "Sincronizando código fuente CUBERBOX Pro..."
rm -rf /opt/cuberbox
if ! git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox; then
    log_error "Error crítico al clonar el repositorio. Verifique conexión a internet."
fi

# 6. Compilación del Backend (FIX DE DEPENDENCIAS ROTAS)
log_info "Iniciando orquestación de módulos Go..."
cd /opt/cuberbox/backend

# Limpiar restos de intentos anteriores
rm -f go.mod go.sum
go clean -modcache

log_info "Inicializando nuevo manifiesto de módulos..."
go mod init github.com/copantl/cuberbox-pro/backend

log_info "Inyectando dependencia fiorix/go-eventsocket (Public)..."
go get github.com/fiorix/go-eventsocket/eventsocket

log_info "Resolviendo árbol de dependencias..."
go mod tidy -v

log_info "Compilando binario de alto rendimiento..."
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Orquestador compilado en /usr/local/bin/cuberbox-engine"

# 7. Instalación de FreeSwitch (Media Plane)
log_info "Configurando FreeSwitch v1.10..."
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | gpg --dearmor > /usr/share/keyrings/freeswitch-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/freeswitch-archive-keyring.gpg] http://files.freeswitch.org/repo/deb/debian-release/ ${REPO_DIST} main" > /etc/apt/sources.list.d/freeswitch.list
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc
log_success "FreeSwitch desplegado."

# 8. Firewall y Seguridad
log_info "Blidando puertos de red (UFW)..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp
ufw allow 7443/tcp
ufw --force enable

# 9. Inicialización de Datos
log_info "Cargando esquema relacional..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 10. Persistencia de Servicios
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
    log_success "Servicio SystemD activo."
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      INSTALACIÓN COMPLETADA EXITOSAMENTE (BUILD 4.7.8)              ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "=====================================================================\n"
