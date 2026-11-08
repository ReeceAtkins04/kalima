# Generates the one-time Kalima release keystore.
# The generated files live in .signing/ which is gitignored. Back them up.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$signing = Join-Path $root ".signing"
$keystore = Join-Path $signing "kalima-release.jks"

if (Test-Path $keystore) {
    throw "Refusing to overwrite the existing keystore at $keystore"
}

$keytool = (Get-Command keytool -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $keytool) {
    $keytool = Get-ChildItem "C:\Program Files*" -Recurse -Filter keytool.exe -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
}
if (-not $keytool) {
    throw "keytool was not found. Install a JDK first."
}

New-Item -ItemType Directory -Force -Path $signing | Out-Null

$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 24
$rng.GetBytes($bytes)
$password = -join ($bytes | ForEach-Object { $_.ToString("x2") })

& $keytool -genkeypair -v `
    -keystore $keystore `
    -storetype JKS `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -alias kalima `
    -dname "CN=Kalima, OU=Mobile, O=Kalima, L=London, ST=London, C=GB" `
    -storepass $password `
    -keypass $password
if ($LASTEXITCODE -ne 0) { throw "keytool failed with exit code $LASTEXITCODE" }

$properties = @(
    "storeFile=kalima-release.jks"
    "keyAlias=kalima"
    "password=$password"
)
$properties | Set-Content -Encoding ascii (Join-Path $signing "keystore.properties")

@"
Kalima release signing - KEEP THIS SAFE AND PRIVATE

Keystore: $(Join-Path $signing "kalima-release.jks")
Alias:    kalima
Password: $password

Back this file up. Android only accepts future updates signed with this
same keystore. Losing it means a new package identity.
"@ | Set-Content -Encoding utf8 (Join-Path $signing "README.txt")

$app = Join-Path $root "src-tauri/gen/android/app"
$android = Join-Path $root "src-tauri/gen/android"
Copy-Item $keystore (Join-Path $app "kalima-release.jks") -Force
Copy-Item (Join-Path $signing "keystore.properties") (Join-Path $android "keystore.properties") -Force

[Convert]::ToBase64String([IO.File]::ReadAllBytes($keystore)) |
    Set-Content -Encoding ascii (Join-Path $signing "kalima-release.jks.b64")

Write-Output "Keystore generated at $keystore"
& $keytool -list -keystore $keystore -storepass $password -alias kalima
