#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN CLUSTER INSTALLER V5.2.0 (DEV4TELCO SPEC)
# Target: Debian 12 (Bookworm) 
# Logic: Based on https://blog.dev4telco.mx/instalacion-freeswitch-en-debian12/
# =============================================================================

set -e

# Estética Titan
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

clear
echo -e "${BOLD}${CYAN}"
echo "   ________________  _   __  ________   __  _____  ____ "
echo "  /_  __/_  __/ __ \/ | / / / ____/ /  / / / / __ \/ __ \\"
echo "   / /   / / / /_/ /  |/ / / /   / /  / / / / /_/ / /_/ /"
echo "  / /   / / / _, _/ /|  / / /___/ /__/ /_/ / _, _/ _, _/ "
echo " /_/   /_/ /_/ |_/_/ |_/  \____/_____/\____/_/ |_/_/ |_|  "
echo -e "          TITAN CLUSTER ENGINE - v5.2.0 (DEBIAN 12)${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere privilegios ROOT para ejecutar el despliegue."
fi

# 2. Actualización de Base y Dependencias Iniciales
log_info "Actualizando sistema y desplegando herramientas de transporte..."
apt-get update && apt-get upgrade -y
apt-get install -y wget curl gnupg2 software-properties-common apt-transport-https lsb-release

# 3. Configuración de Repositorio SignalWire (Según Guía Dev4Telco)
log_info "Sincronizando llave GPG de SignalWire para Debian 12..."
# Descargamos y procesamos la llave al nuevo estándar de Debian 12
wget -qO - https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor > /usr/share/keyrings/signalwire-freeswitch-repo.gpg

log_info "Inyectando repositorios de SignalWire en sources.list.d..."
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ `lsb_release -sc` main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ `lsb_release -sc` main" >> /etc/apt/sources.list.d/freeswitch.list

# 4. Instalación de PostgreSQL y Herramientas Core (Nativo Debian)
log_info "Instalando base de datos PostgreSQL y herramientas de red..."
apt-get update
apt-get install -y postgresql ufw git build-essential golang-go

# 5. Instalación de FreeSwitch (Versión Completa)
log_info "Desplegando FreeSwitch 1.10 Full Stack..."
apt-get install -y freeswitch-all || log_error "Falla al instalar freeswitch-all. Verifique conexión a SignalWire."

# 6. Compilación del Orquestador Titan (Go)
log_info "Sincronizando código fuente del Orquestador..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
log_info "Compilando binario del motor..."
export GOPROXY=https://proxy.golang.org,direct
go mod tidy || true
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor CUBERBOX compilado."

# 7. Configuración de Firewall (Habilitación de Puertos SIP/RTP)
log_info "Aplicando reglas de seguridad perimetral..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw allow 5061/tcp
ufw allow 8021/tcp
ufw allow 16384:32768/udp
ufw --force enable

# 8. Activación de Servicios
log_info "Habilitando servicios en systemd..."
systemctl enable freeswitch
systemctl start freeswitch
systemctl enable postgresql
systemctl start postgresql

log_success "NODO TITAN v5.2.0 DESPLEGADO EXITOSAMENTE."
echo -e "\n${BOLD}Arquitectura:${NC} Debian 12 + SignalWire Repo"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')\n"
