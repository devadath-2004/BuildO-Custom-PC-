$ErrorActionPreference = 'Stop'

$backendDirectory = $PSScriptRoot
$originalLocation = Get-Location
$existingListener = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($existingListener) {
    throw 'Port 8080 is already in use. Stop the currently running BuildO backend with Ctrl+C, then run this script again.'
}

$mailHost = Read-Host 'SMTP host [smtp.gmail.com]'
if ([string]::IsNullOrWhiteSpace($mailHost)) {
    $mailHost = 'smtp.gmail.com'
}

$mailPortInput = Read-Host 'SMTP port [587]'
if ([string]::IsNullOrWhiteSpace($mailPortInput)) {
    $mailPortInput = '587'
}

$mailPort = 0
if (-not [int]::TryParse($mailPortInput, [ref]$mailPort) -or $mailPort -lt 1 -or $mailPort -gt 65535) {
    throw 'SMTP port must be a number between 1 and 65535.'
}

$mailUsername = Read-Host 'Sender email address (SMTP username)'
if ([string]::IsNullOrWhiteSpace($mailUsername)) {
    throw 'A sender email address is required.'
}

$secureMailPassword = Read-Host 'SMTP app password (input is hidden)' -AsSecureString
if ($secureMailPassword.Length -eq 0) {
    throw 'An SMTP app password is required.'
}

$passwordPointer = [IntPtr]::Zero
$mailPassword = $null
$locationChanged = $false
$originalJwtSecret = $env:BUILDO_JWT_SECRET
$generatedJwtSecret = $false

try {
    if ([string]::IsNullOrWhiteSpace($env:BUILDO_JWT_SECRET)) {
        $jwtBytes = New-Object byte[] 32
        $jwtGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        try {
            $jwtGenerator.GetBytes($jwtBytes)
            $env:BUILDO_JWT_SECRET = [Convert]::ToBase64String($jwtBytes)
            $generatedJwtSecret = $true
        } finally {
            $jwtGenerator.Dispose()
            [Array]::Clear($jwtBytes, 0, $jwtBytes.Length)
        }
    }

    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureMailPassword)
    $mailPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    # Gmail displays app passwords in groups separated by spaces; SMTP expects the passcode without them.
    if ($mailHost -ieq 'smtp.gmail.com') {
        $mailPassword = $mailPassword -replace '\s', ''
    }

    $env:SPRING_MAIL_HOST = $mailHost
    $env:SPRING_MAIL_PORT = [string]$mailPort
    $env:SPRING_MAIL_USERNAME = $mailUsername.Trim()
    $env:SPRING_MAIL_PASSWORD = $mailPassword
    $env:SPRING_MAIL_FROM = $mailUsername.Trim()
    $env:BUILDO_OTP_DEVELOPMENT_FALLBACK = 'false'

    $mavenCommand = Get-Command 'mvn.cmd' -ErrorAction SilentlyContinue
    if ($mavenCommand) {
        $mavenPath = $mavenCommand.Source
    } else {
        $mavenPath = Join-Path $env:USERPROFILE 'maven\apache-maven-3.9.6\bin\mvn.cmd'
    }

    if (-not (Test-Path -LiteralPath $mavenPath)) {
        throw "Maven was not found at '$mavenPath'. Add Maven to PATH or update the fallback path in this script."
    }

    Set-Location -LiteralPath $backendDirectory
    $locationChanged = $true
    Write-Host 'Starting BuildO with email OTP enabled. The mail password is not saved in the project.'
    & $mavenPath -f (Join-Path $backendDirectory 'pom.xml') spring-boot:run
    if ($LASTEXITCODE -ne 0) {
        throw "The backend stopped with exit code $LASTEXITCODE. Check the Maven output above."
    }
} finally {
    $env:SPRING_MAIL_HOST = $null
    $env:SPRING_MAIL_PORT = $null
    $env:SPRING_MAIL_USERNAME = $null
    $env:SPRING_MAIL_PASSWORD = $null
    $env:SPRING_MAIL_FROM = $null
    $env:BUILDO_OTP_DEVELOPMENT_FALLBACK = $null
    if ($generatedJwtSecret) {
        $env:BUILDO_JWT_SECRET = $originalJwtSecret
    }
    $mailPassword = $null
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    if ($secureMailPassword) {
        $secureMailPassword.Dispose()
    }
    if ($locationChanged) {
        Set-Location -LiteralPath $originalLocation.Path
    }
}
