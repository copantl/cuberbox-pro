
-- cuberbox_router.lua
-- CUBERBOX Pro - Telemetry Bridge

local uuid = session:getVariable("uuid")
local dest = session:getVariable("destination_number")
local caller = session:getVariable("caller_id_number")
local trace_id = session:getVariable("cuberbox_trace_id")

freeswitch.consoleLog("info", "[CUBERBOX LUA] Processing call: " .. uuid .. " -> " .. dest .. "\n")

-- Disparar evento personalizado para el Backend en Go
local event = freeswitch.Event("CUSTOM", "cuberbox::telemetry")
event:addHeader("Cuberbox-Action", "CALL_ROUTING")
event:addHeader("Cuberbox-Trace-ID", trace_id)
event:addHeader("Caller", caller)
event:addHeader("Destination", dest)
event:fire()

-- Lógica de enrutamiento basada en base de datos (Ejemplo conceptual)
-- Aquí se podría consultar Redis o una API para decidir la ruta real
session:setVariable("cuberbox_status", "ROUTED")
