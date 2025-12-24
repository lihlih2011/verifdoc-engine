
$mdbPath = Resolve-Path "DATASET\data.mdb"
Write-Host "Target: $mdbPath"

# Providers to try
$providers = @(
    "Microsoft.Jet.OLEDB.4.0",
    "Microsoft.ACE.OLEDB.12.0",
    "Microsoft.ACE.OLEDB.16.0"
)

foreach ($prov in $providers) {
    Write-Host "Attempting Provider: $prov"
    $connStr = "Provider=$prov;Data Source=$mdbPath;"
    try {
        $conn = New-Object System.Data.OleDb.OleDbConnection($connStr)
        $conn.Open()
        Write-Host "SUCCESS! Connected with $prov"
        
        # List Tables
        $schema = $conn.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Tables, $null)
        foreach ($row in $schema.Rows) {
            if ($row["TABLE_TYPE"] -eq "TABLE") {
                Write-Host " - Found Table: $($row["TABLE_NAME"])"
            }
        }
        $conn.Close()
        exit 0 # Success
    } catch {
        Write-Host " - Failed: $($_.Exception.Message)"
    }
}

Write-Host "ALL ATTEMPTS FAILED. No suitable OLEDB driver found."
exit 1
