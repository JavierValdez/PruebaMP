# Script de Pruebas Automatizadas - Sistema de Gestión de Casos

## Descripción

Este script (`caso_test.sh`) realiza pruebas automatizadas completas del sistema de gestión de casos del Ministerio Público. Incluye pruebas de:

- ✅ **Autenticación** - Login de todos los usuarios del sistema
- ✅ **Gestión de Casos** - Lista de casos y funcionalidad "Mis Casos"
- ✅ **Asignación/Reasignación** - Validación de reglas de negocio
- ✅ **Reportes** - Reportes por fiscal, estado y fiscalía
- ✅ **Estadísticas** - Métricas generales del sistema
- ✅ **Permisos** - Autorización y control de acceso
- ✅ **Integridad de Datos** - Consistencia de la información
- ✅ **Rendimiento** - Tiempos de respuesta básicos

## Requisitos Previos

1. **Servidor ejecutándose**: El servidor debe estar corriendo en `http://localhost:3000`
   ```bash
   npm start
   ```

2. **Base de datos configurada**: Con datos iniciales cargados
   ```bash
   # Ejecutar los scripts SQL si es necesario
   npm run init-db
   ```

3. **Herramientas del sistema**: El script requiere `curl` y `bash`

## Uso

### Ejecutar todas las pruebas
```bash
./caso_test.sh
```

### Ejecutar pruebas específicas
```bash
# Solo autenticación
./caso_test.sh --auth-only

# Solo gestión de casos
./caso_test.sh --cases-only

# Solo reportes
./caso_test.sh --reports-only

# Solo permisos
./caso_test.sh --permissions-only

# Solo rendimiento
./caso_test.sh --performance-only
```

### Opciones adicionales
```bash
# Ver ayuda
./caso_test.sh --help

# Usar URL diferente
./caso_test.sh -u http://localhost:4000/api

# Modo verboso (para debugging)
./caso_test.sh --verbose
```

## Ejemplo de Ejecución

```bash
$ ./caso_test.sh

===================================================================
INICIANDO PRUEBAS AUTOMATIZADAS - SISTEMA GESTIÓN DE CASOS
Ministerio Público - Tue Dec 17 15:30:00 2024
===================================================================

Verificando servidor...
✓ Servidor disponible en http://localhost:3000/api

=== PRUEBAS DE AUTENTICACIÓN ===

--- Autenticación de Administrador (admin) ---
✓ PASS: Login exitoso para admin (Token: eyJhbGciOiJIUzI1NiIs...)

--- Autenticación de Fiscal 1 (fiscal1) ---
✓ PASS: Login exitoso para fiscal1 (Token: eyJhbGciOiJIUzI1NiIs...)

[... continúa con todas las pruebas ...]

=== RESUMEN DE PRUEBAS ===

Total de pruebas ejecutadas: 35
Pruebas exitosas: 35
Pruebas fallidas: 0
Tasa de éxito: 100%

🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!

El sistema de gestión de casos está funcionando correctamente.
```

## Usuarios de Prueba

El script utiliza los siguientes usuarios configurados en `datos-iniciales.sql`:

| Usuario | Contraseña | Rol | Fiscalía |
|---------|------------|-----|----------|
| admin | admin123 | Administrador | - |
| fiscal1 | fiscal123 | Fiscal | Fiscalía Penal 1 |
| fiscal2 | fiscal123 | Fiscal | Fiscalía Penal 1 |
| fiscal3 | fiscal123 | Fiscal | Fiscalía Civil |
| supervisor1 | super123 | Supervisor | Fiscalía Penal 1 |

## Casos de Prueba Cubiertos

### 1. Autenticación
- Login exitoso de todos los usuarios
- Extracción correcta de tokens JWT
- Obtención de IDs de usuario

### 2. Gestión de Casos
- Lista completa de casos (admin)
- "Mis Casos" para cada fiscal
- Conteo correcto de casos asignados

### 3. Asignación y Reasignación
- Asignación inicial de casos
- Reasignación válida (mismo fiscalía)
- Reasignación inválida bloqueada (diferente fiscalía)
- Verificación de estados de casos

### 4. Reportes y Estadísticas
- Reporte por fiscal
- Reporte por estado
- Reporte por fiscalía
- Estadísticas generales

### 5. Permisos y Autorización
- Acceso denegado sin token
- Acceso denegado con token inválido
- Permisos correctos para fiscales vs admins

### 6. Integridad de Datos
- Presencia de datos iniciales
- Consistencia de asignaciones

### 7. Rendimiento
- Tiempos de respuesta < 2 segundos
- Medición de latencia de endpoints

## Resultados y Logs

- Los resultados se muestran en pantalla con colores
- Se guarda un log en `/tmp/caso_tests/test_results.log`
- Códigos de salida:
  - `0`: Todas las pruebas pasaron
  - `1`: Algunas pruebas fallaron

## Troubleshooting

### Error: "El servidor no está corriendo"
```bash
# Verificar que el servidor esté ejecutándose
npm start

# Verificar el puerto
netstat -an | grep 3000
```

### Error: "No se encontraron casos"
```bash
# Ejecutar script de datos iniciales
psql -U postgres -d ministerio_publico -f sql/datos-iniciales.sql
```

### Error: "Login fallido"
```bash
# Verificar usuarios en la base de datos
psql -U postgres -d ministerio_publico -c "SELECT username FROM usuarios;"
```

### Timeouts o errores de conexión
```bash
# Verificar conectividad
curl -v http://localhost:3000/api/auth/test

# Aumentar timeout si es necesario (editar script)
```

## Personalización

Puedes modificar el script para:

1. **Cambiar URL base**: Editar variable `BASE_URL`
2. **Agregar más usuarios**: Modificar array `users` en `test_authentication()`
3. **Nuevas pruebas**: Agregar funciones `test_nombre()` y llamarlas en `run_all_tests()`
4. **Umbrales de rendimiento**: Modificar límites en `test_performance()`

## Integración Continua

Para usar en CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run API Tests
  run: |
    npm start &
    sleep 5
    ./caso_test.sh
    kill %1
```

## Contribuciones

Para agregar nuevas pruebas:

1. Crear función `test_nueva_funcionalidad()`
2. Seguir el patrón de `pass_test()` y `fail_test()`
3. Agregar la llamada en `run_all_tests()`
4. Documentar en este README
