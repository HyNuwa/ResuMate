# ResuMate Schema Package (@resumate/schema)

## Descripcion del Proyecto

Paquete npm compartido que provee los schemas de validacion y tipos TypeScript para la estructura de curriculums Vitae (CVs). Es la **unica fuente de verdad** para la estructura de datos de un CV, consumido tanto por el frontend como por el backend.

**Stack Tecnologico:**
- TypeScript (tipos estaticos)
- JSON Schema (validacion)
- AJV (validator runtime)
- Paquete npm workspace

## Archivos Importantes

```
packages/schema/
├── src/
│   ├── index.ts               # Exportaciones publicas
│   ├── types.ts               # Tipos TypeScript (fuente unica de verdad)
│   ├── defaults.ts            # Valores por defecto para cada seccion
│   ├── validate.ts            # Funciones de validacion AJV
│   ├── resume.schema.json      # Schema JSON principal (importable via exports map)
│   └── sections/
│       ├── basics.schema.json
│       ├── experience.schema.json
│       ├── education.schema.json
│       ├── skills.schema.json
│       └── metadata.schema.json
├── dist/                      # Build de produccion (generado)
├── package.json
└── tsconfig.json
```

## Reglas para el Agente Schema

### Herramientas Disponibles
- **Leer/Escribir archivos**: Puede modificar archivos en `packages/schema/src/`
- **Glob/Buscar**: Para encontrar archivos y patrones
- **Bash**: Para ejecutar scripts npm (build, typecheck)

### Scripts Disponibles
```bash
pnpm build              # Compilar para produccion (genera dist/)
pnpm typecheck          # Verificar tipos TypeScript
```

### Convenciones de Codigo

#### Tipos TypeScript (`types.ts`)
- Nombres de secciones: `<Name>Section` (ej. `ExperienceSection`)
- Items de seccion: `<Name>Item` (ej. `ExperienceItem`)
- Tipo raiz: `ResumeData`
- Usar **`interface`** para estructuras de datos
- Usar **`type`** solo para unions o aliases
- No usar `any` nunca

#### JSON Schemas (`sections/*.schema.json`)
- Usar `$id` para referencia unica
- Incluir `description` en todas las propiedades
- Usar `ajv:strict` para validacion estricta
- Mantener sincronizado con `types.ts`

#### Valores por Defecto (`defaults.ts`)
- Factory functions para crear objetos con valores por defecto
- Nombrar: `createDefault<Section>()` o `getDefault<Name>()`

---

## Lo que este Agente NO debe hacer

### Restricciones de Scope

1. **NO modificar logica de presentacion**
   - No crear componentes UI
   - No agregar estilos CSS

2. **NO modificar el frontend**
   - No editar `app/src/` ni componentes

3. **NO modificar el backend**
   - No editar `server/src/` ni endpoints

4. **NO modificar el scraper Python**
   - No editar `scraper/` ni sus archivos

5. **NO cambiar la estructura de directorios**
   - Mantener la estructura de `src/` y `sections/`
   - Los schemas van en `sections/`, no en raiz

6. **NO crear nuevos archivos fuera de `packages/schema/src/`**
   - No crear tests aqui (van en sus respectivos proyectos)

### Sincronizacion Obligatoria
Cualquier cambio en `types.ts` **DEBE** reflejarse en el JSON schema correspondiente y viceversa. Si agregas un campo a `ExperienceItem`, debes:
1. Agregar el tipo en `types.ts`
2. Agregar el schema en `sections/experience.schema.json`
3. Opcionalmente agregar un default en `defaults.ts`

---

## Contacto con Otros Agentes

| Agente | Scope | Cuando Contactar |
|--------|-------|------------------|
| **Agente Frontend** | `app/` | Si necesitas que consuman nuevos tipos |
| **Agente Backend** | `server/` | Si necesitas que validen contra nuevos schemas |
| **Agente Scraper** | `scraper/` | Si necesitas un nuevo campo en la extraccion |
| **Agente DevOps** | Docker, CI/CD | Para publicar el paquete a npm (si aplica) |

---

## Notas Importantes

- Este paquete es consumido como `workspace:*` en el monorepo
- El JSON schema es importable via el `exports` map en package.json
- La validacion runtime usa **AJV** en el backend
- En el frontend se usa para **intellisense** y type safety
- Cualquier cambio breaking debe coordinarse con **ambos** equipos (frontend y backend)
