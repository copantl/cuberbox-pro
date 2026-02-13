#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN CLUSTER INSTALLER V5.2.1 (SIGNALWIRE AUTH SPEC)
# Target: Debian 12 (Bookworm) 
# Authentication: SignalWire PAT Integrated
# =============================================================================

set -e

# Credenciales de Infraestructura
SW_TOKEN="PT5b9edec3ca49c15002eae76b499aa87e112d376db148e9ed"

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
echo -e "          TITAN CLUSTER ENGINE - v5.2.1 (DEBIAN 12)${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere privilegios ROOT para ejecutar el despliegue."
fi

# 2. Configuración de Autenticación de Repositorio (Solución Error 401)
log_info "Configurando credenciales seguras para SignalWire..."
mkdir -p /etc/apt/auth.conf.d/
echo "machine freeswitch.signalwire.com login signalwire password $SW_TOKEN" > /etc/apt/auth.conf.d/freeswitch.conf
chmod 600 /etc/apt/auth.conf.d/freeswitch.conf

# 3. Actualización de Base y Dependencias Iniciales
log_info "Sincronizando sistema base Debian 12..."
apt-get update && apt-get upgrade -y
apt-get install -y wget curl gnupg2 software-properties-common apt-transport-https lsb-release

# 4. Sincronización de Llaves GPG (Método de-armored)
log_info "Descargando firma digital del Media Plane..."
wget -qO - https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor > /usr/share/keyrings/signalwire-freeswitch-repo.gpg

log_info "Inyectando fuentes de SignalWire autenticadas..."
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ `lsb_release -sc` main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ `lsb_release -sc` main" >> /etc/apt/sources.list.d/freeswitch.list

# 5. Instalación de PostgreSQL y Herramientas Core
log_info "Instalando base de datos y orquestador..."
apt-get update
apt-get install -y postgresql ufw git build-essential golang-go

# 6. Instalación de FreeSwitch (Vía Token)
log_info "Desplegando FreeSwitch 1.10 (Secure Access)..."
apt-get install -y freeswitch-all || log_error "Falla al instalar freeswitch-all. Revise la validez del Token proporcionado."

# 7. Compilación del Motor Titan
log_info "Compilando núcleo binario CUBERBOX..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod tidy || true
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Binario compilado."

# 8. Firewall Hardening
log_info "Blindando perímetros..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw allow 16384:32768/udp
ufw --force enable

log_success "DESPLIEGUE FINALIZADO EXITOSAMENTE CON TOKEN SW."
echo -e "\n${BOLD}Estado de Red:${NC} Autenticado (SignalWire PAT)"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')\n"
