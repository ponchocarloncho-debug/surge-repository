# 📁 Meplay Free Videos - Estructura de Carpetas

## ✅ Estructura Recomendada para Surge.sh

```
tu-sitio/
├── index.html              ← Página principal
├── favorites.html          ← Página de favoritos
├── widget.js               ← Widget compartido
├── ads.js                  ← Script de publicidad
├── videos.json             ← Base de datos de videos
└── videos/                 ← CARPETA PARA PÁGINAS INDIVIDUALES
    ├── video-1.html
    ├── video-2.html
    ├── video-3.html
    └── ... (2000+ videos)
```

---

## 🚀 Cómo Subir a Surge.sh

### **Primera vez:**

```bash
# 1. Crea la carpeta principal
mkdir meplay-site
cd meplay-site

# 2. Copia los archivos principales
# (index.html, favorites.html, widget.js, ads.js, videos.json)

# 3. Crea la carpeta videos
mkdir videos

# 4. Mueve las páginas individuales a videos/
mv *.html videos/
# (pero deja index.html y favorites.html en la raíz)

# 5. Sube a Surge
surge
```

### **Actualizaciones:**

```bash
# Cuando generes nuevas páginas:
# 1. Descarga las páginas HTML del Generator
# 2. Muévelas a la carpeta videos/
# 3. Actualiza videos.json
# 4. Sube todo de nuevo

surge
```

---

## 📝 Notas Importantes

### **El Generator ahora genera URLs con `videos/` automáticamente**

Cuando generas páginas, el videos.json contendrá:

```json
{
  "url": "videos/mi-video-1.html",  ← Ya incluye videos/
  "title": "Mi Video 1",
  ...
}
```

### **Las páginas individuales tienen rutas relativas**

Las páginas en `videos/` usan `../` para acceder a archivos raíz:

```html
<script src="../ads.js"></script>
<script src="../widget.js"></script>
<a href="../index.html">HOME</a>
<a href="../favorites.html">My Favorites</a>
```

### **El widget.js es inteligente**

Detecta automáticamente si está en:
- Raíz → carga `videos.json`
- Carpeta videos/ → carga `../videos.json`

---

## 🔄 Flujo de Trabajo Completo

### **1. Generar páginas con Generator.html**

**Manual:**
```
1. Abre generator.html
2. Llena formulario
3. Click "Generate Page & Add to JSON"
4. Descarga: videos/mi-video.html
```

**Blogger:**
```
1. Pega dominio del blog
2. Click "Generate All Pages (Mass)"
3. Descarga: blogger-pages.zip
4. Extrae: todas las páginas tienen videos/ en el nombre
```

### **2. Organizar archivos localmente**

```
meplay-site/
├── index.html
├── favorites.html
├── widget.js
├── ads.js
├── videos.json          ← Descarga el actualizado
└── videos/
    ├── video-1.html     ← Páginas generadas
    ├── video-2.html
    └── ...
```

### **3. Subir a Surge.sh**

```bash
cd meplay-site
surge
```

---

## ✨ Ventajas de Esta Estructura

✅ **Organización:** 2000+ páginas en una carpeta separada
✅ **Fácil mantenimiento:** index, favorites, widget en raíz
✅ **URLs limpias:** `tusite.surge.sh/videos/mi-video.html`
✅ **Escalable:** Puedes tener 10,000+ videos sin problema
✅ **Búsqueda rápida:** Todas las páginas de videos juntas

---

## 🎯 Ejemplo Real

**URL del sitio:** `meplay-videos.surge.sh`

**Acceso:**
- Home: `https://meplay-videos.surge.sh/`
- Favoritos: `https://meplay-videos.surge.sh/favorites.html`
- Video individual: `https://meplay-videos.surge.sh/videos/sexy-latina-2024.html`

---

## ⚠️ IMPORTANTE

1. **SIEMPRE crea la carpeta `videos/` antes de subir**
2. **NO pongas index.html ni favorites.html en videos/**
3. **El Generator YA incluye `videos/` en las URLs del JSON**
4. **Cuando descargues páginas del Generator, muévelas a videos/**

---

## 🆘 Solución de Problemas

**Problema:** "No se cargan las imágenes del widget"
**Solución:** Verifica que videos.json esté en la raíz

**Problema:** "Los links HOME no funcionan desde videos/"
**Solución:** Las páginas usan `../` automáticamente, regenera con el nuevo Generator

**Problema:** "404 en las páginas de videos"
**Solución:** Asegúrate de crear la carpeta `videos/` en Surge

---

¡Listo! Ahora tienes una estructura profesional y escalable. 🎉
