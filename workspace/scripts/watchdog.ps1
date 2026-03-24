# OpenClaw Watchdog Script
# Checks gateway health and auto-restarts if needed

$ErrorActionPreference = "SilentlyContinue"

# Config
$GatewayPort = 8080
$GatewayHost = "localhost"
$HealthEndpoint = "http://$GatewayHost`:$GatewayPort/health"
$MaxRetries = 3
$RetryDelay = 5
$LogFile = "C:\Users\Administrator\.openclaw\workspace\memory\watchdog.log"

# Log function
function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    Write-Host $LogEntry
}

# Check gateway health
function Test-GatewayHealth {
    try {
        $response = Invoke-WebRequest -Uri $HealthEndpoint -TimeoutSec 10 -UseBasicParsing
        return ($response.StatusCode -eq 200)
    } catch {
        return $false
    }
}

# Check gateway process
function Test-GatewayProcess {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object {$_.Path -like "*openclaw*"}
    return ($null -ne $processes -and $processes.Count -gt 0)
}

# Restart gateway
function Restart-Gateway {
    Write-Log "Attempting to restart gateway..." "WARN"
    
    # Stop ALL node processes related to openclaw (more aggressive cleanup)
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object {$_.Path -like "*openclaw*" -or $_.CommandLine -like "*openclaw*"}
    if ($processes) {
        Write-Log "Stopping $($processes.Count) old gateway process(es)..." "INFO"
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 3
        Write-Log "Stopped old gateway process" "INFO"
    }
    
    # Wait for port to be released
    $portCheck = netstat -ano | Select-String ":8080" | Select-String "LISTENING"
    if ($portCheck) {
        Write-Log "Waiting for port 8080 to be released..." "INFO"
        Start-Sleep -Seconds 5
    }
    
    # Start new process
    try {
        $workspacePath = "C:\Users\Administrator\.openclaw\workspace"
        Write-Log "Starting gateway process..." "INFO"
        Start-Process -FilePath "openclaw" -ArgumentList "gateway", "start" -WorkingDirectory $workspacePath -PassThru
        Start-Sleep -Seconds 10
        Write-Log "Started new gateway process" "INFO"
        return $true
    } catch {
        Write-Log "Failed to start gateway: $_" "ERROR"
        return $false
    }
}

# Main logic
Write-Log "=== Watchdog Check Started ==="

# Check 1: Process exists
$processOk = Test-GatewayProcess
$processStatus = if($processOk) {"Running"} else {"Not Running"}
Write-Log "Gateway Process: $processStatus"

if (-not $processOk) {
    Write-Log "Gateway process not running, restarting..." "WARN"
    Restart-Gateway
    exit
}

# Check 2: Port listening
$portCheck = netstat -ano | Select-String ":$GatewayPort" | Select-String "LISTENING"
$portOk = ($null -ne $portCheck)
$portStatus = if($portOk) {"Listening"} else {"Not Listening"}
Write-Log "Port $GatewayPort : $portStatus"

if (-not $portOk) {
    Write-Log "Gateway port not listening, restarting..." "WARN"
    Restart-Gateway
    exit
}

# Check 3: Health endpoint
$healthOk = Test-GatewayHealth
$healthStatus = if($healthOk) {"OK"} else {"No Response"}
Write-Log "Health Endpoint: $healthStatus"

if (-not $healthOk) {
    Write-Log "Health check failed, retrying..." "WARN"
    
    $retryCount = 0
    while ($retryCount -lt $MaxRetries) {
        $retryCount++
        Write-Log "Retry $retryCount/$MaxRetries..." "INFO"
        Start-Sleep -Seconds $RetryDelay
        
        $healthOk = Test-GatewayHealth
        if ($healthOk) {
            Write-Log "Retry successful, gateway recovered" "INFO"
            break
        }
    }
    
    if (-not $healthOk) {
        Write-Log "Retries failed, forcing restart..." "ERROR"
        Restart-Gateway
    }
}

Write-Log "=== Watchdog Check Completed ==="
