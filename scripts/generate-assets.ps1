Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$images = Join-Path $public 'images'
$projects = Join-Path $images 'projects'
$placeholders = Join-Path $images 'placeholders'

foreach ($dir in @($public, $images, $projects, $placeholders)) {
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# ---- Palette (mirrors src/styles/globals.css) -------------------------------
$Bg       = [System.Drawing.Color]::FromArgb(8, 9, 13)
$Surface  = [System.Drawing.Color]::FromArgb(16, 17, 23)
$Elevated = [System.Drawing.Color]::FromArgb(25, 26, 34)
$Border   = [System.Drawing.Color]::FromArgb(52, 53, 64)
$BorderSoft = [System.Drawing.Color]::FromArgb(33, 34, 43)
$Text     = [System.Drawing.Color]::FromArgb(246, 247, 249)
$Muted    = [System.Drawing.Color]::FromArgb(112, 114, 126)
$Accent   = [System.Drawing.Color]::FromArgb(214, 242, 106)

function New-Brush([System.Drawing.Color]$c) {
    return New-Object System.Drawing.SolidBrush($c)
}

function New-Pen([System.Drawing.Color]$c, [float]$w) {
    return New-Object System.Drawing.Pen($c, $w)
}

# Fonts: prefer a grotesque if present, fall back to the system sans.
function Get-Font([string]$family, [float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
    try {
        $f = New-Object System.Drawing.Font($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
        if ($f.Name -eq $family) { return $f }
        $f.Dispose()
    } catch { }
    return New-Object System.Drawing.Font('Segoe UI', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

# ---------------------------------------------------------------------------
# Helper: draw the faint technical grid used across every image.
# ---------------------------------------------------------------------------
function Draw-Grid($g, [int]$w, [int]$h, [int]$step, [int]$alpha) {
    $gridColor = [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255)
    $pen = New-Pen $gridColor 1
    for ($x = 0; $x -le $w; $x += $step) { $g.DrawLine($pen, $x, 0, $x, $h) }
    for ($y = 0; $y -le $h; $y += $step) { $g.DrawLine($pen, 0, $y, $w, $y) }
    $pen.Dispose()
}

# ---------------------------------------------------------------------------
# Placeholder: shown whenever a project has no thumbnail.
# ---------------------------------------------------------------------------
function Write-Placeholder {
    $w = 1600; $h = 900
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.Clear($Surface)
    Draw-Grid $g $w $h 72 26

    # Diagonal accent rule.
    $pen = New-Pen $Accent 3
    $g.DrawLine($pen, ($w * 0.5 - 90), ($h * 0.5), ($w * 0.5 + 90), ($h * 0.5))
    $g.DrawLine($pen, ($w * 0.5), ($h * 0.5 - 90), ($w * 0.5), ($h * 0.5 + 90))
    $pen.Dispose()

    $font = Get-Font 'Consolas' 40
    $brush = New-Brush $Muted
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'
    $fmt.LineAlignment = 'Center'
    $g.DrawString('NO IMAGE', $font, $brush, (New-Object System.Drawing.RectangleF(0, ($h * 0.5 + 130), $w, 60)), $fmt)
    $fmt.Dispose(); $font.Dispose(); $brush.Dispose()

    $g.Dispose()
    $bmp.Save((Join-Path $placeholders 'project.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host 'placeholder written'
}

# ---------------------------------------------------------------------------
# OG image (1200x630) — used for social cards.
# ---------------------------------------------------------------------------
function Write-OgImage {
    $w = 1200; $h = 630
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear($Bg)
    Draw-Grid $g $w $h 72 30

    # Accent bar down the left edge.
    $bar = New-Brush $Accent
    $g.FillRectangle($bar, 0, 0, 12, $h)
    $bar.Dispose()

    $eyebrowFont = Get-Font 'Consolas' 22
    $eyebrowBrush = New-Brush $Accent
    $g.DrawString('PORTFOLIO', $eyebrowFont, $eyebrowBrush, 88, 132)
    $eyebrowFont.Dispose(); $eyebrowBrush.Dispose()

    $titleFont = Get-Font 'Segoe UI' 88 ([System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Brush $Text
    $g.DrawString('Building things.', $titleFont, $titleBrush, 84, 200)
    $mutedBrush = New-Brush $Muted
    $g.DrawString('Exploring ideas.', $titleFont, $mutedBrush, 84, 302)
    $titleFont.Dispose(); $mutedBrush.Dispose()

    $rulePen = New-Pen $Border 2
    $g.DrawLine($rulePen, 88, 430, 1112, 430)
    $rulePen.Dispose()

    $subFont = Get-Font 'Segoe UI' 30
    $subBrush = New-Brush ([System.Drawing.Color]::FromArgb(160, 162, 173))
    $g.DrawString('Web  ·  Software  ·  Networking  ·  Design  ·  Experiments', $subFont, $subBrush, 86, 464)
    $subFont.Dispose(); $subBrush.Dispose()

    $g.Dispose()
    $bmp.Save((Join-Path $images 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host 'og-image written'
}

# ---------------------------------------------------------------------------
# Demo project thumbnails: abstract, editorial, deterministic per seed.
# Each varies hue/brightness within the single-accent palette so the portfolio
# grid looks designed rather than random.
# ---------------------------------------------------------------------------
function Write-ProjectImage([string]$file, [int]$seed, [string]$label) {
    $w = 1600; $h = 900
    $rand = New-Object System.Random($seed)

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear($Bg)
    Draw-Grid $g $w $h 72 24

    # A family of geometric compositions, picked by seed.
    $mode = $seed % 5
    $accentPen = New-Pen $Accent 4
    $softPen = New-Pen $Border 2

    if ($mode -eq 0) {
        # Concentric arcs.
        for ($i = 0; $i -lt 7; $i++) {
            $r = 140 + ($i * 105)
            $pen = if ($i % 2 -eq 0) { $accentPen } else { $softPen }
            $g.DrawEllipse($pen, ($w * 0.5 - $r), ($h * 0.5 - $r), ($r * 2), ($r * 2))
        }
    } elseif ($mode -eq 1) {
        # Vertical bar rhythm.
        $count = 22
        for ($i = 0; $i -lt $count; $i++) {
            $x = 120 + ($i * 62)
            $barH = 140 + $rand.Next(0, 380)
            $brush = if ($i % 5 -eq 0) { New-Brush $Accent } else { New-Brush $Elevated }
            $g.FillRectangle($brush, $x, ($h - 140 - $barH), 34, $barH)
            $brush.Dispose()
        }
        $g.DrawLine($softPen, 120, ($h - 140), ($w - 120), ($h - 140))
    } elseif ($mode -eq 2) {
        # Isometric-ish stepped grid.
        $cols = 9; $rows = 6
        for ($c = 0; $c -lt $cols; $c++) {
            for ($r = 0; $r -lt $rows; $r++) {
                $x = 150 + ($c * 145) + ($r * 40)
                $y = 200 + ($r * 78)
                if (($c + $r) % 6 -eq 0) {
                    $brush = New-Brush $Accent
                    $g.FillRectangle($brush, $x, $y, 96, 48)
                    $brush.Dispose()
                } else {
                    $g.DrawRectangle($softPen, $x, $y, 96, 48)
                }
            }
        }
    } elseif ($mode -eq 3) {
        # Node graph.
        $nodes = @()
        for ($i = 0; $i -lt 14; $i++) {
            $nodes += ,@((120 + $rand.Next(0, 1360)), (150 + $rand.Next(0, 620)))
        }
        for ($i = 0; $i -lt $nodes.Count; $i++) {
            for ($j = $i + 1; $j -lt $nodes.Count; $j++) {
                $dx = $nodes[$i][0] - $nodes[$j][0]
                $dy = $nodes[$i][1] - $nodes[$j][1]
                if ([Math]::Sqrt($dx * $dx + $dy * $dy) -lt 300) {
                    $g.DrawLine($softPen, $nodes[$i][0], $nodes[$i][1], $nodes[$j][0], $nodes[$j][1])
                }
            }
        }
        for ($i = 0; $i -lt $nodes.Count; $i++) {
            $size = if ($i % 4 -eq 0) { 18 } else { 9 }
            $brush = if ($i % 4 -eq 0) { New-Brush $Accent } else { New-Brush $Muted }
            $g.FillEllipse($brush, ($nodes[$i][0] - ($size / 2)), ($nodes[$i][1] - ($size / 2)), $size, $size)
            $brush.Dispose()
        }
    } else {
        # Diagonal rule field.
        for ($i = -10; $i -lt 26; $i++) {
            $pen = if ($i % 4 -eq 0) { $accentPen } else { $softPen }
            $x = ($i * 90)
            $g.DrawLine($pen, $x, $h, ($x + $h), 0)
        }
    }

    $accentPen.Dispose(); $softPen.Dispose()

    # Label plate, bottom left.
    $plate = New-Brush ([System.Drawing.Color]::FromArgb(214, 8, 9, 13))
    $g.FillRectangle($plate, 0, ($h - 96), ($w), 96)
    $plate.Dispose()
    $plateLine = New-Pen $Border 2
    $g.DrawLine($plateLine, 0, ($h - 96), $w, ($h - 96))
    $plateLine.Dispose()

    $labelFont = Get-Font 'Consolas' 26
    $labelBrush = New-Brush $Muted
    $g.DrawString($label, $labelFont, $labelBrush, 64, ($h - 68))
    $labelFont.Dispose(); $labelBrush.Dispose()

    $g.Dispose()
    $bmp.Save((Join-Path $projects $file), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "project image written: $file"
}

Write-Placeholder
Write-OgImage

Write-ProjectImage 'field-notes.png' 3 'MULTIPLAYER EXPERIMENT'
Write-ProjectImage 'lan-tracer.png'   7 'NETWORKING TOOL'
Write-ProjectImage 'atlas-ui.png'     11 'CREATIVE WEBSITE'
Write-ProjectImage 'relay-api.png'    17 'API EXPERIMENT'
Write-ProjectImage 'shader-study.png' 23 'GENERATIVE SKETCH'
Write-ProjectImage 'campus-dash.png'  29 'COURSEWORK PROJECT'

# ---------------------------------------------------------------------------
# Favicon: a 64px PNG embedded in an ICO container (supported since Vista).
# ---------------------------------------------------------------------------
function Write-Favicon {
    $size = 64
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear($Bg)

    $accent = New-Brush $Accent
    $g.FillRectangle($accent, 0, 0, $size, 10)
    $g.FillRectangle($accent, 0, ($size - 10), $size, 10)
    $g.FillRectangle($accent, 0, 0, 10, $size)
    $g.FillRectangle($accent, ($size - 10), 0, 10, $size)
    $accent.Dispose()

    $font = Get-Font 'Segoe UI' 38 ([System.Drawing.FontStyle]::Bold)
    $brush = New-Brush $Text
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
    $g.DrawString('K', $font, $brush, (New-Object System.Drawing.RectangleF(6, 4, ($size - 12), ($size - 8))), $fmt)
    $fmt.Dispose(); $font.Dispose(); $brush.Dispose()
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytes = $ms.ToArray()
    $bmp.Dispose()
    $ms.Dispose()

    $fs = [System.IO.File]::Create((Join-Path $public 'favicon.ico'))
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICONDIR
    $bw.Write([UInt16]0)                 # reserved
    $bw.Write([UInt16]1)                 # type: icon
    $bw.Write([UInt16]1)                 # count
    # ICONDIRENTRY
    $bw.Write([Byte]$size)               # width
    $bw.Write([Byte]$size)               # height
    $bw.Write([Byte]0)                   # colour count
    $bw.Write([Byte]0)                   # reserved
    $bw.Write([UInt16]1)                 # colour planes
    $bw.Write([UInt16]32)                # bits per pixel
    $bw.Write([UInt32]$pngBytes.Length)  # bytes in resource
    $bw.Write([UInt32]22)                # offset

    $bw.Write($pngBytes)
    $bw.Flush(); $bw.Close(); $fs.Close()
    Write-Host 'favicon written'
}

Write-Favicon
Write-Host 'asset generation complete'
