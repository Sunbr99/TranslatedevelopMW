# 🏗 วิธี Build APK — MW Translate v2.0.0

## ⚡ ข้อกำหนดก่อน Build

| สิ่งที่ต้องมี | เวอร์ชัน |
|---|---|
| Node.js | 16+ |
| Java JDK | 11+ (แนะนำ 17) |
| Android Studio | 2022+ |
| Android SDK | API 22+ |

---

## 📋 ขั้นตอน Build APK ทีละขั้น

### 1️⃣ ติดตั้ง Dependencies
```bash
cd mw-translate
npm install
```

### 2️⃣ Init Capacitor (ครั้งแรกเท่านั้น)
```bash
npx cap init "MW Translate" com.mwtranslate.app --web-dir .
```

### 3️⃣ เพิ่ม Android Platform (ครั้งแรกเท่านั้น)
```bash
npx cap add android
```

### 4️⃣ Sync ไฟล์เข้า Android Project
```bash
npx cap sync
```

### 5️⃣ Build APK

**Debug APK (สำหรับทดสอบ):**
```bash
cd android && ./gradlew assembleDebug
```

**Release APK (สำหรับแจกจ่าย):**
```bash
cd android && ./gradlew assembleRelease
```

**หรือใช้ npm script:**
```bash
npm run apk:debug    # Debug
npm run apk:release  # Release
```

### 6️⃣ หา APK ที่ build แล้ว
```bash
npm run apk:find
# หรือดูที่:
# android/app/build/outputs/apk/debug/app-debug.apk
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🔑 Sign APK (Release)

```bash
# สร้าง keystore (ครั้งแรก)
keytool -genkey -v -keystore mw-translate.keystore \
  -alias mwtranslate -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore mw-translate.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  mwtranslate

# Align APK
zipalign -v 4 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  app-release-signed.apk
```

---

## 🔧 Config API Key

**⚠️ สำคัญ:** app ใช้ Anthropic API — ต้องมี API key

### Option A: Env Variable (แนะนำ)
ใน `android/app/src/main/assets/public/index.html`:
```javascript
// เพิ่ม ANTHROPIC_API_KEY ใน header
headers: {
  'Content-Type': 'application/json',
  'x-api-key': window.ENV_API_KEY || ''
}
```

### Option B: Backend Proxy (ปลอดภัยที่สุด)
แทนที่ `https://api.anthropic.com/v1/messages` ด้วย URL ของ proxy server ตัวเอง

---

## 🐛 Troubleshooting

| ปัญหา | วิธีแก้ |
|---|---|
| `./gradlew: Permission denied` | `chmod +x android/gradlew` |
| Java version error | ตรวจสอบ `JAVA_HOME`, ใช้ JDK 11-17 |
| SDK not found | ตั้งค่า `ANDROID_HOME` หรือ `ANDROID_SDK_ROOT` |
| Build failed | `cd android && ./gradlew clean` แล้ว build ใหม่ |
| API calls fail | ตรวจสอบ `allowMixedContent` ใน `capacitor.config.json` |

---

## 📱 ทดสอบบนมือถือ

```bash
# ติดตั้ง debug APK บนมือถือที่เชื่อมต่อผ่าน USB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# ดู log
adb logcat -s "Capacitor/Console"
```

---

## 📂 โครงสร้างไฟล์
```
mw-translate/
├── index.html           ← แอปหลัก (fixed v2)
├── manifest.json        ← PWA manifest
├── service-worker.js    ← Offline cache (fixed v2)
├── capacitor.config.json← Capacitor config
├── package.json         ← Scripts & deps
├── icons/
│   ├── icon-192.png    ← App icon
│   └── icon-512.png    ← App icon (large)
├── BUILD_APK.md         ← ไฟล์นี้
└── android/             ← (generated หลัง cap add android)
    └── app/build/outputs/apk/
```
