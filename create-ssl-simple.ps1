# Generate SSL Certificates for KaiTech Local Development
# Simple version with basic ASCII characters

Write-Host "Creating SSL Certificates for KaiTech Local Development" -ForegroundColor Cyan
Write-Host "========================================================="

# Create ssl directory if it doesn't exist
$sslDir = Join-Path $PSScriptRoot "ssl"
if (!(Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force
    Write-Host "Created SSL directory: $sslDir" -ForegroundColor Green
}

# Certificate details
$certName = "kaitech-local"
$keyFile = Join-Path $sslDir "$certName.key"
$certFile = Join-Path $sslDir "$certName.crt"

Write-Host "Using PowerShell to create self-signed certificate..." -ForegroundColor Yellow

# Use PowerShell to create self-signed certificate
$cert = New-SelfSignedCertificate -DnsName "localhost", "kaitech.local", "*.kaitech.local" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1) -FriendlyName "KaiTech Local Development"

# Export certificate
Export-Certificate -Cert $cert -FilePath $certFile -Type CERT

Write-Host "SSL certificates created successfully!" -ForegroundColor Green
Write-Host "Certificate files:" -ForegroundColor Cyan
Write-Host "   - Certificate: $certFile" -ForegroundColor White

Write-Host ""
Write-Host "SSL setup completed!" -ForegroundColor Green
Write-Host "Your local server will now support HTTPS at:" -ForegroundColor Cyan
Write-Host "   - https://localhost" -ForegroundColor White
Write-Host ""
Write-Host "Note: You may need to accept the self-signed certificate warning in your browser." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
