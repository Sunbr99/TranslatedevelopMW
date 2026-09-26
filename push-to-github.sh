#!/bin/bash
# ═══════════════════════════════════
#  MW Translate — Push to GitHub
#  รันครั้งเดียวจบ
# ═══════════════════════════════════

REPO_URL="https://github.com/Sunbr99/Translatedevelop.git"
BRANCH="main"

echo "⚡ MW Translate — Push to GitHub"
echo "─────────────────────────────────"

# ตรวจว่ามี git ไหม
if ! command -v git &> /dev/null; then
    echo "❌ ไม่มี git — ติดตั้งก่อน:"
    echo "   Termux: pkg install git"
    echo "   Mac:    brew install git"
    exit 1
fi

# ตรวจว่าอยู่ในโฟลเดอร์ถูกไหม
if [ ! -f "index.html" ]; then
    echo "❌ ไม่พบ index.html"
    echo "   กรุณา cd เข้าโฟลเดอร์ mw-translate-fixed ก่อน"
    exit 1
fi

echo "📁 โฟลเดอร์: $(pwd)"
echo "🌐 repo: $REPO_URL"
echo ""

# ── Git setup ──
if [ ! -d ".git" ]; then
    echo "📦 git init..."
    git init
    git branch -M $BRANCH
else
    echo "📦 git repo มีอยู่แล้ว"
fi

# ── Remote ──
if git remote get-url origin &>/dev/null; then
    git remote set-url origin $REPO_URL
    echo "🔗 remote updated"
else
    git remote add origin $REPO_URL
    echo "🔗 remote added"
fi

# ── Stage ทุกไฟล์ ──
echo ""
echo "📋 staging files..."
git add -A
echo "   $(git status --short | wc -l) files"

# ── Commit ──
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
git commit -m "MW Translate v2.1.0 — $TIMESTAMP" 2>/dev/null || \
git commit --allow-empty -m "MW Translate v2.1.0 — $TIMESTAMP"

# ── Push ──
echo ""
echo "🚀 pushing to GitHub..."
git push -u origin $BRANCH --force

echo ""
echo "═══════════════════════════════════"
echo "✅ Push สำเร็จ!"
echo "   GitHub จะ build APK ให้อัตโนมัติ"
echo ""
echo "   ดู build ที่:"
echo "   https://github.com/Sunbr99/Translatedevelop/actions"
echo "═══════════════════════════════════"
