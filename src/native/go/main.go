package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"
)

// TelemetryData holds instantaneous high-performance system metrics
type TelemetryData struct {
	Timestamp      string                 `json:"timestamp"`
	OS             string                 `json:"os"`
	Architecture   string                 `json:"arch"`
	NumCPU         int                    `json:"num_cpu"`
	NumGoroutine   int                    `json:"goroutines"`
	MemoryAllocMB  float64                `json:"memory_alloc_mb"`
	MemoryTotalMB  float64                `json:"memory_total_mb"`
	MemorySysMB    float64                `json:"memory_sys_mb"`
	NumGC          uint32                 `json:"num_gc"`
	SystemUptime   string                 `json:"system_uptime"`
	ProcessSummary map[string]interface{} `json:"process_summary"`
	Status         string                 `json:"status"`
}

// PortScanResult holds port radar findings
type PortScanResult struct {
	Host     string        `json:"host"`
	Open     []int         `json:"open_ports"`
	Duration time.Duration `json:"duration_ms"`
}

// ProcessAuditReport holds malware / suspicious process findings
type ProcessAuditReport struct {
	TotalProcesses int      `json:"total_processes"`
	FlaggedThreats []string `json:"flagged_threats"`
	Status         string   `json:"status"`
	AuditTimeMs    int64    `json:"audit_time_ms"`
}

func getMemoryMetrics() (float64, float64, float64, uint32) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	toMB := func(b uint64) float64 {
		return float64(b) / 1024.0 / 1024.0
	}
	return toMB(m.Alloc), toMB(m.TotalAlloc), toMB(m.Sys), m.NumGC
}

func getInstantTelemetry() TelemetryData {
	alloc, total, sys, numGC := getMemoryMetrics()
	return TelemetryData{
		Timestamp:     time.Now().UTC().Format(time.RFC3339Nano),
		OS:            runtime.GOOS,
		Architecture:  runtime.GOARCH,
		NumCPU:        runtime.NumCPU(),
		NumGoroutine:  runtime.NumGoroutine(),
		MemoryAllocMB: alloc,
		MemoryTotalMB: total,
		MemorySysMB:   sys,
		NumGC:         numGC,
		SystemUptime:  time.Since(startTime).String(),
		ProcessSummary: map[string]interface{}{
			"pid":     os.Getpid(),
			"ppid":    os.Getppid(),
			"threads": runtime.GOMAXPROCS(0),
		},
		Status: "FORTIFIED_ONLINE",
	}
}

// RapidScanPort scans a single port with a short timeout
func RapidScanPort(host string, port int, timeout time.Duration) bool {
	target := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", target, timeout)
	if err != nil {
		return false
	}
	_ = conn.Close()
	return true
}

// ConcurrentPortRadar scans a range of ports using goroutine worker pool
func ConcurrentPortRadar(host string, startPort, endPort int, workers int, timeoutMs int) PortScanResult {
	start := time.Now()
	ports := make(chan int, workers)
	results := make(chan int, workers)
	var wg sync.WaitGroup

	timeout := time.Duration(timeoutMs) * time.Millisecond

	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for p := range ports {
				if RapidScanPort(host, p, timeout) {
					results <- p
				}
			}
		}()
	}

	go func() {
		for p := startPort; p <= endPort; p++ {
			ports <- p
		}
		close(ports)
		wg.Wait()
		close(results)
	}()

	var openPorts []int
	for p := range results {
		openPorts = append(openPorts, p)
	}

	return PortScanResult{
		Host:     host,
		Open:     openPorts,
		Duration: time.Since(start) / time.Millisecond,
	}
}

// AuditProcesses inspects running tasks for suspicious signatures
func AuditProcesses() ProcessAuditReport {
	start := time.Now()
	threats := make([]string, 0)
	total := 0

	if runtime.GOOS == "windows" {
		out, err := exec.Command("tasklist", "/FO", "CSV", "/NH").Output()
		if err == nil {
			lines := strings.Split(string(out), "\r\n")
			total = len(lines)
			knownMalwareKeywords := []string{
				"mimikatz", "keylogger", "xmrig", "cryptominer",
				"netcat", "nc.exe", "pwdump", "procdump",
			}
			for _, line := range lines {
				lower := strings.ToLower(line)
				for _, kw := range knownMalwareKeywords {
					if strings.Contains(lower, kw) {
						threats = append(threats, fmt.Sprintf("SUSPICIOUS_SIGNATURE_DETECTED: %s", line))
					}
				}
			}
		}
	}

	status := "CLEAN"
	if len(threats) > 0 {
		status = "THREATS_DETECTED"
	}

	return ProcessAuditReport{
		TotalProcesses: total,
		FlaggedThreats: threats,
		Status:         status,
		AuditTimeMs:    time.Since(start).Milliseconds(),
	}
}

var startTime = time.Now()

func main() {
	cmd := flag.String("cmd", "telemetry", "Command: telemetry | radar | audit | daemon")
	port := flag.Int("port", 4243, "HTTP Daemon port")
	host := flag.String("host", "127.0.0.1", "Radar host target")
	startPort := flag.Int("start-port", 1, "Radar start port")
	endPort := flag.Int("end-port", 1024, "Radar end port")
	workers := flag.Int("workers", 64, "Concurrent worker routines")
	timeout := flag.Int("timeout", 150, "Timeout in ms")
	flag.Parse()

	// If positional arg exists, use it as cmd
	if len(flag.Args()) > 0 {
		*cmd = flag.Args()[0]
	}

	switch *cmd {
	case "telemetry":
		data := getInstantTelemetry()
		out, _ := json.MarshalIndent(data, "", "  ")
		fmt.Println(string(out))

	case "radar":
		radar := ConcurrentPortRadar(*host, *startPort, *endPort, *workers, *timeout)
		out, _ := json.MarshalIndent(radar, "", "  ")
		fmt.Println(string(out))

	case "audit":
		audit := AuditProcesses()
		out, _ := json.MarshalIndent(audit, "", "  ")
		fmt.Println(string(out))

	case "daemon":
		addr := "127.0.0.1:" + strconv.Itoa(*port)
		http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status":"STARK_SENTINEL_ONLINE","uptime":"` + time.Since(startTime).String() + `"}`))
		})
		http.HandleFunc("/telemetry", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(getInstantTelemetry())
		})
		http.HandleFunc("/audit", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(AuditProcesses())
		})
		http.HandleFunc("/radar", func(w http.ResponseWriter, r *http.Request) {
			targetHost := r.URL.Query().Get("host")
			if targetHost == "" {
				targetHost = "127.0.0.1"
			}
			res := ConcurrentPortRadar(targetHost, 1, 1024, 64, 150)
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(res)
		})

		fmt.Printf("[STARK SENTINEL] Go high-speed daemon listening on http://127.0.0.1:%d\n", *port)
		if err := http.ListenAndServe(addr, nil); err != nil {
			fmt.Fprintf(os.Stderr, "Daemon failed: %v\n", err)
			os.Exit(1)
		}

	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s. Use telemetry, radar, audit, or daemon\n", *cmd)
		os.Exit(1)
	}
}
