# Agentic Forge AI

Agentic Forge AI es una aplicación web que transforma ideas iniciales de software en una **primera especificación técnica estructurada** mediante un sistema de **agentes especializados**.

A partir de una descripción informal, la plataforma genera automáticamente:

- resumen del problema
- usuarios objetivo
- requerimientos funcionales
- historias de usuario
- propuesta técnica inicial
- entidades de datos
- preguntas abiertas de implementación

El objetivo es reducir ambigüedad en etapas tempranas y facilitar la transición entre **idea → especificación técnica**, especialmente para founders, freelancers y equipos pequeños.

---

# Demo

**Aplicación desplegada:**  
https://agentic-forge-psi.vercel.app

**Servidor MCP desplegado:**  
https://agentic-forge.onrender.com

**Repositorio:**  
https://github.com/fercho111/agentic-forge

---

# Enfoque del proyecto

La primera versión validó la idea del producto.  
Esta segunda iteración reforzó la arquitectura para acercarla más a un entorno real de agentic engineering.

El proyecto ahora incorpora:

- autenticación real con gestión de sesiones
- orquestación multi-agente con **LangGraph**
- tool layer con **MCP Server** real
- integración de un **SKILL.md** reutilizable
- persistencia intermedia de ejecuciones
- observabilidad con **LangSmith**, Supabase y logs de infraestructura
- testing y CI para el flujo principal

---

# Arquitectura general

La solución se divide en dos servicios principales:

```text
Usuario
   │
   ▼
Next.js App (Vercel)
   │
   ├── Auth / sesiones
   ├── UI
   ├── API / LangGraph
   │
   ▼
MCP Server (Render)
   │
   ▼
Supabase
```

--- 

# Tecnologías principales:

- Next.js (App Router) – frontend y backend
- TypeScript
- Supabase – auth, sesiones y persistencia
- DeepSeek API
- LangGraph
- LangSmith
- MCP Server remoto
- Vercel
- Render
- GitHub Actions
- Docker / Docker Compose

---

# Arquitectura de agentes

El sistema conserva el flujo base de cuatro agentes, pero ahora está orquestado con LangGraph en lugar de un pipeline secuencial custom.

## Intake Agent

Interpreta la idea inicial y extrae:

- título del proyecto
- resumen del problema
- usuarios objetivo

## Product Agent

Genera:

- requerimientos funcionales
- historias de usuario
## Technical Agent

Propone:

- enfoque técnico inicial
- entidades principales de datos
## Reviewer Agent

Revisa el resultado y detecta:

- ambigüedades
- preguntas abiertas
- necesidad de rework cuando aplica

LangGraph aporta manejo explícito de estado, routing condicional, retries y mejor trazabilidad entre pasos.

---

# Tool Layer con MCP

La capa de tools fue migrada a un MCP Server real.

Actualmente el sistema utiliza tools expuestas vía protocolo MCP, en lugar de invocaciones directas, para tareas como:

- exportación de especificaciones en Markdown
- actualización de proyecto final
- registro de pasos intermedios de agentes

El MCP server está desplegado de forma independiente y protegido mediante autenticación interna y validación de origen.

---

# Skill reutilizable

El proyecto incorpora un skill real en:

`skills/spec-review/SKILL.md`

Este skill estandariza la revisión de especificaciones generadas y se integra en el Reviewer Agent para mantener consistencia en criterios de claridad, alcance y necesidad de rework.


---

# Autenticación y sesiones
La aplicación dejó atrás el password gate inicial y ahora usa un flujo de autenticación real con:

-registro e inicio de sesión
-recuperación segura de contraseña por email
-sesiones server-side con cookie opaca
-expiración por inactividad
-invalidación de sesión al cerrar sesión
-protección de rutas basada en sesión autenticada

La validación de inputs se apoya en Zod y el flujo de reset password fue endurecido para evitar accesos directos no válidos a la ruta de cambio de contraseña.

---

# Observabilidad y persistencia

La observabilidad se implementa en varios niveles.

## Supabase

Se persisten:

proyectos
sesiones de aplicación
agent runs
agent steps

La tabla agent_steps guarda información intermedia por agente, incluyendo snapshots de input/output, retries, errores y duración.

## LangSmith

Cada ejecución del grafo genera trazas de agentes y llamadas al modelo, lo que facilita debugging y análisis del comportamiento del sistema.

---

# Infraestructura

El despliegue separa la app principal y el MCP server, con logs disponibles en:

- Vercel para el servicio principal
- Render para el MCP server


---

# Mejoras operativas

Además del rediseño de arquitectura, esta versión incorpora varias mejoras operativas:

- validación de /api/analyze con Zod
- sanitización básica del input y hardening frente a prompt injection
- rate limiting por usuario para proteger consumo de API
- error handling en API routes
- error boundary global en la aplicación
- abstracción de runtime para desacoplar LLM y tools

---

# Testing y CI

Se añadieron pruebas automáticas para partes críticas del flujo, incluyendo validación y routing del sistema.

El pipeline de CI en GitHub Actions ejecuta:

- instalación de dependencias
- lint
- tests
- build del frontend
- build del MCP server

Esto permite validar tanto la app principal como el servicio MCP dentro del mismo repositorio.

---

# Dockerization
El proyecto incluye configuración de contenedores para facilitar ejecución local y reproducibilidad:

- Dockerfile para la app Next.js
- Dockerfile para el MCP server
- docker-compose.yml para levantar ambos servicios juntos

---

# Estructura del proyecto

```text
app/
  (app)/
  (auth)/
  auth/
  api/

lib/
  analyze/
  auth/
  graph/
  llm/
  mcp/
  runtime/
  skills/
  supabase/
  tools/

mcp-server/
  src/

skills/
  spec-review/

.github/
  workflows/
    ci.yml
```

---

# Instalación local

## App principal

```javascript
npm install
npm run dev
```
## MCP Server

```javascriptcd mcp-server
cd mcp-server
npm install
npm run dev
```

## Docker Compose

```javascript
docker compose --env-file .env.docker up --build
```

## Variables de entorno

### App principal

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
LANGSMITH_API_KEY=
LANGSMITH_TRACING=
LANGSMITH_PROJECT=
LANGSMITH_ENDPOINT=
MCP_SERVER_URL=
MCP_SHARED_SECRET=
```

### MCP Server

```bash
PORT=
MCP_SHARED_SECRET=
MCP_ALLOWED_ORIGIN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```
