# Contábol

Página de Contábol: https://contabol.github.io/

- `index.html`: página para instalar la app (APK para Android y versión para PC).
- `app/`: la versión para PC (se abre en el navegador y se puede instalar).
- `version.json` y `contabol-X.Y.Z.zip`: actualizaciones en vivo de la app instalada.

Aquí no hay datos personales: los movimientos de cada persona se guardan en su cuenta, no en este sitio.

Se publica desde `contabol/app` con:

```bash
npm run publicar -- "Qué cambió"
```
