# Control de productividad — Team Lumina / Altamira

Miniaplicación para que cada asesor registre los **6 indicadores** y los envíe a una misma hoja de Google Sheets. Permite incrementar/disminuir contadores, ver cuatro metas (30 llamadas, 10 seguimientos, 6 prospectos y 4 visitas), añadir observaciones y copiar el reporte para WhatsApp.

## 1. Abrir en Visual Studio Code

Descomprime la carpeta, ábrela en VS Code y usa la extensión **Live Server** para probar `index.html`, o abre directamente el HTML. La configuración de Sheets será necesaria para enviar reportes.

## 2. Crear Google Sheet y conectar Apps Script

1. Crea una hoja de cálculo nueva en Google Sheets llamada, por ejemplo, `Productividad Team Lumina`.
2. Copia el ID de su URL: `https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`.
3. Ve a **Extensiones → Apps Script** y reemplaza el contenido del archivo `Code.gs` por el archivo `Code.gs` que se incluye en este proyecto.
4. Sustituye `PEGA_AQUI_ID_DE_TU_GOOGLE_SHEET` por el ID real de tu hoja.
5. En Apps Script, selecciona **Implementar → Nueva implementación → Aplicación web**. Configura **Ejecutar como: Yo** y el acceso según tus necesidades. Para usarlo desde GitHub Pages sin autenticación, suele ser necesario permitir acceso a **Cualquier usuario**, si tu cuenta/organización lo permite. **Importante: esto deja la URL receptora públicamente accesible**; úsala solo para información no sensible y considera la opción segura indicada abajo.
6. Autoriza los permisos requeridos por Google y copia la URL terminada en `/exec` de la aplicación web.
7. En `config.js`, reemplaza `PEGAR_AQUI_URL_DE_APPS_SCRIPT` por esa URL, conservando las comillas.
8. Abre la web, escribe un reporte de prueba y pulsa **Enviar a Google Sheets**. **Abre la hoja y confirma la fila**, porque la respuesta de Apps Script no se puede leer de forma fiable desde GitHub Pages debido a las restricciones CORS. Si falla, comprueba que tengas la última implementación publicada y revisa **Ejecuciones** en Apps Script.
9. Si modificas `Code.gs`, publica una **nueva versión de implementación** para que los cambios lleguen a la URL `/exec`.

## 3. Subir a GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `lumina-productividad`.
2. Sube `index.html`, `styles.css`, `app.js`, `config.js` y `README.md` (el archivo `Code.gs` se usa en Apps Script, no ejecuta en GitHub).
3. En el repositorio abre **Settings → Pages → Build and deployment** y selecciona **Deploy from a branch**, rama `main`, carpeta `/(root)`.
4. Abre la URL que GitHub te proporcione, normalmente `https://TU_USUARIO.github.io/lumina-productividad/`.
5. Comparte esa URL con el equipo por WhatsApp. Cada asesor rellena su reporte desde su celular.

## Seguridad y limitaciones importantes

- **GitHub Pages es público.** El archivo `config.js`, incluida la URL de Apps Script, será visible a quien abra la página; no guardes contraseñas, tokens secretos ni datos sensibles en este repositorio.
- La implementación de Apps Script que permite escribir sin inicio de sesión **puede recibir envíos no autorizados** si alguien descubre su URL; la validación del servidor reduce errores, **no es autenticación**. Para uso empresarial real con control de acceso, lo recomendado es una solución autenticada (por ejemplo Google Workspace / Firebase Authentication + backend privado) o servir el formulario directamente desde Apps Script con acceso restringido.
- El botón de envío desde GitHub Pages usa `fetch(..., mode:'no-cors')`: que la solicitud se haya enviado **no prueba** que la fila se guardó. Revisa la hoja y las ejecuciones de Apps Script.
- El botón WhatsApp **copia texto** al portapapeles; el asesor lo pega en su chat o grupo.
- Los datos de los contadores no se guardan localmente por privacidad y para evitar reutilizar cifras; solo se recuerda el nombre del asesor en el navegador.
- Para reportes repetidos del mismo día, cada envío se registra como una fila nueva. La protección por ID solo evita duplicados del mismo envío.
