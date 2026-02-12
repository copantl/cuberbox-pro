
package main

import (
	"fmt"
	"log"
	"time"

	"github.com/0x19/go-freeswitch-esl/esl"
)

type ClusterNode struct {
	ID     string
	Host   string
	Port   int
	Active bool
}

func main() {
	fmt.Println("CUBERBOX NEURAL ENGINE - CLUSTER MANAGER BOOTING...")

	nodes := []ClusterNode{
		{"fs-node-01", "127.0.0.1", 8021, true},
	}

	for _, node := range nodes {
		go connectToNode(node)
	}

	select {}
}

func connectToNode(node ClusterNode) {
	client, err := esl.NewClient(node.Host, node.Port, "ClueCon")
	if err != nil {
		log.Printf("Error: %v", err)
		return
	}

	// Escuchar eventos personalizados de Lua y eventos del sistema
	client.Subscribe("CUSTOM cuberbox::telemetry")
	client.Subscribe("HEARTBEAT")
	client.Subscribe("RELOADXML") // Captura cuando se hace 'reloadxml' desde la app

	log.Printf("Node %s: Sincronización ESL establecida.", node.ID)

	client.HandleEvent("CUSTOM", func(event *esl.Event) {
		action := event.GetHeader("Cuberbox-Action")
		trace := event.GetHeader("Cuberbox-Trace-ID")
		fmt.Printf("[TELEMETRY] Action: %s | Trace: %s | Source: LuaBridge\n", action, trace)
	})

	client.HandleEvent("RELOADXML", func(event *esl.Event) {
		log.Printf("Node %s: Configuración telefónica actualizada desde la UI.", node.ID)
		// Aquí notificaríamos al Frontend via WebSockets
	})

	client.Loop()
}
