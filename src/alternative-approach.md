// src/alternative-approach.md
# 대안 방법들

## 방법 1: Tailwind CDN with Custom Config
index.html에 다음과 같이 설정:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        // 기존 설정들 그대로 복사
      }
    }
  }
</script>
```

## 방법 2: Tailwind CLI 사용
```bash
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

## 방법 3: UnoCSS 사용 (Tailwind 대안)
```bash
npm install -D unocss @unocss/vite
```
