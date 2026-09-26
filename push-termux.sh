#!/bin/bash
# ═══════════════════════════════════
#  MW Translate — Push via Termux
# ═══════════════════════════════════

REPO_URL="https://github.com/Sunbr99/Translatedevelop.git"

echo "⚡ MW Translate — Termux Push"
echo "─────────────────────────────"

# ติดตั้ง git ถ้ายังไม่มี
if ! command -v git &> /dev/null; then
    echo "📦 ติดตั้ง git..."
    pkg install -y git
fi

# ขอ permission storage
if [ ! -d "/sdcard" ]; then
    echo "📱 ขอ storage permission..."
    termux-setup-storage
    sleep 3
fi

# หาโฟลเดอร์ไฟล์
FOLDERS=(
    "/sdcard/mw-translate-fixed"
    "/sdcard/Download/mw-translate-fixed"
    "$HOME/mw-translate-fixed"
)

TARGET=""
for f in "${FOLDERS[@]}"; do
    if [ -f "$f/index.html" ]; then
        TARGET="$f"
        break
    fi
done

if [ -z "$TARGET" ]; then
    echo "❌ หาโฟลเดอร์ไม่เจอ"
    echo "   วางโฟลเดอร์ mw-translate-fixed ไว้ที่ /sdcard/"
    echo "   แล้วรันใหม่"
    exit 1
fi

echo "📁 พบไฟล์ที่: $TARGET"
cd "$TARGET"

# Git config (ต้องมีก่อน commit)
git config --global user.email "mwtranslate@app.com"
git config --global user.name "MW Translate"

# Setup
git init 2>/dev/null
git branch -M main 2>/dev/null

if git remote get-url origin &>/dev/null; then
    git remote set-url origin $REPO_URL
else
    git remote add origin $REPO_URL
fi

# Stage + Commit + Push
git add -A
git commit -m "MW Translate v2.1.0" 2>/dev/null || true

echo ""
echo "🔐 Login GitHub:"
echo "   Username: Sunbr99"
echo "   Password: ใส่ Personal Access Token"
echo "   (github.com → Settings → Developer settings → Tokens)"
echo ""

git push -u origin main --force

echo ""
echo "✅ เสร็จแล้ว! ดู build ที่:"
echo "   https://github.com/Sunbr99/Translatedevelop/actions"
