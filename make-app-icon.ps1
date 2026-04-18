$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing

$srcPath='C:\Users\Astitva Infotech\Desktop\Feriwala\WhatsApp Image 2026-03-22 at 2.30.03 AM.jpeg'
$outPath='C:\Users\Astitva Infotech\Desktop\Feriwala\branding\app_icon_source.png'

$src=[System.Drawing.Image]::FromFile($srcPath)
$bmp=New-Object System.Drawing.Bitmap 1024,1024
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(255,245,245,245))

$tileRect=New-Object System.Drawing.Rectangle 96,96,832,832
$tileBrush=New-Object System.Drawing.Drawing2D.LinearGradientBrush($tileRect,[System.Drawing.Color]::FromArgb(255,255,255,255),[System.Drawing.Color]::FromArgb(255,243,243,255),35.0)
$path=New-Object System.Drawing.Drawing2D.GraphicsPath
$radius=180
$path.AddArc($tileRect.X,$tileRect.Y,$radius,$radius,180,90)
$path.AddArc($tileRect.Right-$radius,$tileRect.Y,$radius,$radius,270,90)
$path.AddArc($tileRect.Right-$radius,$tileRect.Bottom-$radius,$radius,$radius,0,90)
$path.AddArc($tileRect.X,$tileRect.Bottom-$radius,$radius,$radius,90,90)
$path.CloseFigure()
$g.FillPath($tileBrush,$path)

$logoRect=New-Object System.Drawing.Rectangle 110,260,804,500
$g.DrawImage($src,$logoRect)

$outDir=[System.IO.Path]::GetDirectoryName($outPath)
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$bmp.Save($outPath,[System.Drawing.Imaging.ImageFormat]::Png)

$destinations=@(
  'C:\Users\Astitva Infotech\Desktop\Feriwala\feriwala_customer\assets\images\app_icon.png',
  'C:\Users\Astitva Infotech\Desktop\Feriwala\feriwala_shop\assets\images\app_icon.png',
  'C:\Users\Astitva Infotech\Desktop\Feriwala\feriwala_delivery\assets\images\app_icon.png'
)

foreach($d in $destinations){
  New-Item -ItemType Directory -Force -Path ([System.IO.Path]::GetDirectoryName($d)) | Out-Null
  Copy-Item -Force $outPath $d
}

$path.Dispose()
$tileBrush.Dispose()
$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Output "ICON_CREATED: $outPath"