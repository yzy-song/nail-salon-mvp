# =============================
# PowerShell 脚本：将 CRLF 转 LF，排除 node_modules，适用于 Monorepo
# =============================

# 定义要处理的文件扩展名（可根据项目需要增减）
$extensions = @("*.js", "*.ts", "*.json", "*.md", "*.py", "*.sh", "*.html", "*.css", "*.vue", "*.txt")

# 获取所有文件（递归子目录），但排除 node_modules 下的任何文件
Get-ChildItem -Recurse -Include $extensions | 
Where-Object { $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object {
    $file = $_.FullName
    Write-Host "🔧 正在处理文件: $file"

    try {
        # 读取文件内容（可能包含 CRLF）
        $content = Get-Content -Path $file -Raw

        # 关键：将所有 CRLF（\r\n）替换为 LF（\n）
        $content = $content -replace "\r\n", "`n"

        # 以 UTF-8 无 BOM 格式写入文件（确保不添加 CR 或 BOM）
        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)

        Write-Host "✅ 已转换为 LF-only: $file"
    }
    catch {
        Write-Host "❌ 处理失败: $file - $_" -ForegroundColor Red
    }
}

Write-Host "`n🎉 全部处理完成！按 Enter 键退出..."
Read-Host