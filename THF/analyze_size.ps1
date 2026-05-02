Get-ChildItem -Path 'd:\TheFamousHalwai-Partner\THF' -Recurse -File |
  Where-Object { $_.DirectoryName -notlike '*node_modules*' -and $_.DirectoryName -notlike '*.expo*' } |
  Sort-Object Length -Descending |
  Select-Object -First 20 Length, FullName |
  Format-Table -AutoSize
