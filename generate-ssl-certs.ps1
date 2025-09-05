# Generate SSL Certificates for KaiTech Local Development
# This script creates self-signed SSL certificates for HTTPS local development

Write-Host "🔒 Generating SSL Certificates for KaiTech Local Development" -ForegroundColor Cyan
Write-Host "=" * 60

# Create ssl directory if it doesn't exist
$sslDir = Join-Path $PSScriptRoot "ssl"
if (!(Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force
    Write-Host "📁 Created SSL directory: $sslDir" -ForegroundColor Green
}

# Certificate details
$certName = "kaitech-local"
$keyFile = Join-Path $sslDir "$certName.key"
$certFile = Join-Path $sslDir "$certName.crt"
$csrFile = Join-Path $sslDir "$certName.csr"

# Check if OpenSSL is available
$opensslPath = $null
$possiblePaths = @(
    "openssl",
    "C:\Program Files\Git\usr\bin\openssl.exe",
    "C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
    "C:\OpenSSL-Win64\bin\openssl.exe"
)

foreach ($path in $possiblePaths) {
    try {
        if ($path -eq "openssl") {
            $null = Get-Command openssl -ErrorAction Stop
            $opensslPath = "openssl"
            break
        } elseif (Test-Path $path) {
            $opensslPath = $path
            break
        }
    } catch {
        continue
    }
}

if ($opensslPath) {
    Write-Host "✅ Found OpenSSL at: $opensslPath" -ForegroundColor Green
    
    # Generate private key
    Write-Host "🔑 Generating private key..." -ForegroundColor Yellow
    & $opensslPath genrsa -out $keyFile 2048
    
    # Generate certificate signing request
    Write-Host "📝 Generating certificate signing request..." -ForegroundColor Yellow
    $subject = "/C=RW/ST=Kigali/L=Kigali/O=KaiTech/OU=Voice of Time/CN=localhost/emailAddress=admin@kaitech.local"
    & $opensslPath req -new -key $keyFile -out $csrFile -subj $subject
    
    # Generate self-signed certificate
    Write-Host "🏆 Generating self-signed certificate..." -ForegroundColor Yellow
    & $opensslPath x509 -req -days 365 -in $csrFile -signkey $keyFile -out $certFile
    
    # Clean up CSR file
    Remove-Item $csrFile -Force
    
    Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
    Write-Host "📁 Certificate files:" -ForegroundColor Cyan
    Write-Host "   - Private Key: $keyFile" -ForegroundColor White
    Write-Host "   - Certificate: $certFile" -ForegroundColor White
    
} else {
    Write-Host "⚠️  OpenSSL not found. Using PowerShell alternative method..." -ForegroundColor Yellow
    
    # Use PowerShell to create self-signed certificate
    $cert = New-SelfSignedCertificate -DnsName "localhost", "kaitech.local", "*.kaitech.local" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1) -FriendlyName "KaiTech Local Development"
    
    # Export certificate and private key
    $certPassword = ConvertTo-SecureString -String "kaitech123" -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath (Join-Path $sslDir "$certName.pfx") -Password $certPassword
    
    # Export just the certificate (public key)
    Export-Certificate -Cert $cert -FilePath $certFile -Type CERT
    
    # Note: Windows doesn't easily export private key in PEM format from PowerShell
    # For development purposes, we'll create a note file
    $noteFile = Join-Path $sslDir "certificate-info.txt"
    @"
KaiTech Local Development SSL Certificate
========================================

Certificate created using PowerShell New-SelfSignedCertificate
Certificate Thumbprint: $($cert.Thumbprint)
Certificate Store Location: cert:\LocalMachine\My\$($cert.Thumbprint)

Files created:
- $certFile (Certificate - Public Key)
- $(Join-Path $sslDir "$certName.pfx") (Full certificate with private key)

PFX Password: kaitech123

To trust this certificate in Windows:
1. Double-click the .crt file
2. Click "Install Certificate..."
3. Choose "Local Machine" and "Place all certificates in the following store"
4. Browse and select "Trusted Root Certification Authorities"
5. Click OK and finish the wizard

For Docker/nginx usage, you may need to convert the PFX to PEM format.
"@ | Out-File $noteFile -Encoding UTF8
    
    Write-Host "✅ PowerShell SSL certificate created!" -ForegroundColor Green
    Write-Host "📁 Certificate files:" -ForegroundColor Cyan
    Write-Host "   - Certificate: $certFile" -ForegroundColor White
    Write-Host "   - PFX Bundle: $(Join-Path $sslDir "$certName.pfx")" -ForegroundColor White
    Write-Host "   - Info: $noteFile" -ForegroundColor White
    Write-Host "🔐 PFX Password: kaitech123" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 SSL setup completed!" -ForegroundColor Green
Write-Host "🌐 Your local server will now support HTTPS at:" -ForegroundColor Cyan
Write-Host "   - https://localhost" -ForegroundColor White
Write-Host "   - https://kaitech.local (add to hosts file)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: You may need to accept the self-signed certificate warning in your browser." -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
