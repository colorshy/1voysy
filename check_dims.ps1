Add-Type -AssemblyName System.Drawing

$files = @(
  "public/assets/hero-textile-landscape.jpg",
  "public/assets/hero-textile-landscape-2k.jpg",
  "public/assets/about-knitted-portrait.png",
  "public/assets/contact-knitted-cityscape-bw.jpg",
  "public/assets/3d-black-object.png",
  "public/assets/knitted-checkerboard.jpg"
)

$base = "c:\Users\User\Desktop\AI WOR\порфолио1\WORK [SITES] practice\my site my $"

foreach ($f in $files) {
    $full = Join-Path $base $f
    if (Test-Path $full) {
        $img = [System.Drawing.Image]::FromFile($full)
        $len = (Get-Item $full).Length
        Write-Output ("{0} -> {1}x{2} ({3:N0} bytes)" -f $f, $img.Width, $img.Height, $len)
        $img.Dispose()
    }
}
