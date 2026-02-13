#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.6.8 (STABLE)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Repo: https://github.com/copantl/cuberbox-pro
# =============================================================================

set -e

# Colores para UX de Terminal
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
echo -e "      NEURAL ENGINE INSTALLER v4.6.8${NC}\n"

# 1. Verificación de Privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Actualización de Repositorios y Utilidades Base
log_info "Actualizando índices de paquetes..."
apt-get update

log_info "Instalando utilidades de gestión de repositorios..."
# REPARACIÓN: Instalación resiliente de utilidades de software
apt-get install -y curl wget git gnupg2 lsb-release build-essential ufw certbot nginx golang-go python3-software-properties || log_warn "Algunas utilidades menores fallaron, intentando continuar..."
apt-get install -y software-properties-common || log_warn "software-properties-common no encontrado, usando comandos nativos..."

# 3. Determinación de Versión para Repositorios Externos
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME

# Fallback para Debian 13 (Trixie) ya que muchos repos usan bookworm como base estable
if [ "$OS_CODENAME" = "trixie" ]; then
    log_warn "Debian 13 detectado. Usando 'bookworm' como base de compatibilidad para repositorios externos."
    REPO_DIST="bookworm"
fi

# 4. Configuración de PostgreSQL 16
log_info "Configurando repositorio de PostgreSQL 16..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update
apt-get install -y postgresql-16
log_success "PostgreSQL 16 desplegado."

# 5. Sincronización del Código Fuente
log_info "Clonando núcleo CUBERBOX Pro desde GitHub..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
log_success "Código fuente en /opt/cuberbox"

# 6. Compilación del Backend (Go Engine)
log_info "Iniciando compilación del motor de orquestación..."
cd /opt/cuberbox/backend

# Inicialización de módulo Go
if [ ! -f go.mod ]; then
    log_info "Inicializando módulo Go..."
    go mod init github.com/copantl/cuberbox-pro/backend
fi

log_info "Descargando dependencias de Go..."
go mod tidy
log_info "Compilando binario..."
go build -o /usr/local/bin/cuberbox-engine main.go
log_success "Binario de sistema compilado en /usr/local/bin/cuberbox-engine"

# 7. Instalación de FreeSwitch (Media Plane)
log_info "Instalando motor de telefonía FreeSwitch..."
# Usamos el repo oficial de FreeSwitch para Debian
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | gpg --dearmor > /usr/share/keyrings/freeswitch-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/freeswitch-archive-keyring.gpg] http://files.freeswitch.org/repo/deb/debian-release/ ${REPO_DIST} main" > /etc/apt/sources.list.d/freeswitch.list
apt-get update
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc
log_success "FreeSwitch instalado."

# 8. Firewall y Seguridad
log_info "Aplicando reglas de blindaje (UFW)..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp
ufw allow 7443/tcp
ufw --force enable
log_success "Firewall activo."

# 9. Inicialización de Datos
log_info "Inyectando esquema de base de datos..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql
log_success "Datos sincronizados."

# 10. Persistencia de Servicios (SystemD)
log_info "Registrando servicios de sistema..."
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
    log_success "Daemon activo."
else
    log_warn "Archivo de servicio no encontrado en /opt/cuberbox/setup/"
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      INSTALACIÓN COMPLETADA CON ÉXITO (BUILD 4.6.8)                 ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Acceso Web:${NC} ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "${BOLD}Repositorio:${NC} https://github.com/copantl/cuberbox-pro"
echo -e "=====================================================================\n"
