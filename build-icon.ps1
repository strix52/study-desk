Add-Type -AssemblyName System.Drawing

$size = 128
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::Transparent)

$purple = [System.Drawing.Color]::FromArgb(124, 92, 252)
$pen = New-Object System.Drawing.Pen($purple, 7)
$pen.StartCap = 'Round'
$pen.EndCap = 'Round'
$pen.LineJoin = 'Round'
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, $purple))

# Left book (rect): x=16, y=16, w=43, h=96
$g.FillRectangle($brush, 16, 16, 43, 96)
$g.DrawRectangle($pen, 16, 16, 43, 96)

# Spine line down the middle of left book
$g.DrawLine($pen, 37, 16, 37, 112)

# Right book (angled parallelogram)
$points = @(
    (New-Object System.Drawing.PointF(70, 27)),
    (New-Object System.Drawing.PointF(108, 16)),
    (New-Object System.Drawing.PointF(108, 103)),
    (New-Object System.Drawing.PointF(70, 112))
)
$g.FillPolygon($brush, $points)
$g.DrawPolygon($pen, $points)

# Angled spine
$g.DrawLine($pen, 89, 21, 89, 108)

$g.Dispose()

$icoPath = Join-Path $PSScriptRoot 'study-desk\public\study-desk.ico'
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$fs = [System.IO.FileStream]::new($icoPath, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()

Write-Host "Icon saved to: $icoPath"
