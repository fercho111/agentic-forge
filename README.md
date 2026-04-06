# Agentic Forge AI
test
Agentic Forge AI es una aplicación web que transforma ideas iniciales de software en una **primera especificación técnica estructurada** mediante un pipeline de **agentes especializados**.

El sistema toma una descripción informal de un proyecto y genera automáticamente:

- resumen del problema
- usuarios objetivo
- requerimientos funcionales
- historias de usuario
- propuesta técnica inicial
- entidades de datos
- preguntas abiertas de implementación

El objetivo es facilitar la transición entre **idea → especificación técnica**, especialmente para fundadores, freelancers y pequeños equipos que necesitan estructurar rápidamente un proyecto antes de iniciar desarrollo.

---

# Demo

**Aplicación desplegada:**  


**Repositorio:**  


---

# Problema que resuelve

En etapas tempranas de desarrollo es común que los requerimientos se expresen como ideas vagas o incompletas. Esto suele provocar:

- mala estimación técnica
- retrabajo en desarrollo
- comunicación deficiente entre stakeholders
- pérdida de tiempo refinando requisitos

Agentic Forge AI aborda este problema utilizando un **pipeline multi-agente** que convierte una idea inicial en un documento estructurado que puede servir como base para diseño o planificación técnica.

---

# Arquitectura general

La aplicación sigue una arquitectura simple pero modular:

```
Usuario
   │
   ▼
Frontend (Next.js)
   │
   ▼
API Route (/api/analyze)
   │
   ▼
Orchestrator
   │
   ▼
Pipeline de agentes especializados
   │
   ▼
Tool layer (persistencia / export)
   │
   ▼
Neon Postgres
```

Tecnologías principales:

- **Next.js (App Router)** – frontend y backend
- **TypeScript**
- **Neon Postgres**
- **DeepSeek API**
- **LangSmith**
- **Vercel**
- **GitHub Actions**

---

# Arquitectura de Agentes

El sistema implementa un **pipeline multi-agente basado en roles**, cumpliendo con la categoría:

**“Ecosistema de agentes, roles y protocolo agent-to-agent”.**

Cada agente tiene una responsabilidad clara dentro del flujo.

### Intake Agent
Interpreta la idea inicial del usuario y extrae:

- título del proyecto
- resumen del problema
- usuarios objetivo

### Product Agent
Genera elementos de producto:

- requerimientos funcionales
- historias de usuario

### Technical Agent
Propone una base técnica:

- stack sugerido
- módulos principales
- entidades de datos

### Reviewer Agent
Analiza el resultado final e identifica:

- ambigüedades
- preguntas abiertas
- posibles riesgos de implementación

---

# Protocolo Agent-to-Agent

Los agentes se coordinan mediante un **contrato de estado tipado (`SpecState`)**.

Cada agente:

1. recibe el estado actual
2. lo enriquece con nueva información
3. devuelve el estado actualizado

Este modelo crea un **pipeline determinista y trazable**, evitando interacciones caóticas entre agentes y facilitando debugging y observabilidad.

---

# Tool Layer (Inspirada en MCP)

El sistema incluye una capa de herramientas reutilizables inspirada en patrones MCP.

Las herramientas actuales incluyen:

- **Persistence Tool**  
  Registro de proyectos y ejecuciones del pipeline.

- **Export Tool**  
  Generación del documento final en formato Markdown.

Esta capa desacopla a los agentes de la infraestructura y permite extender el sistema con nuevas herramientas fácilmente.

---

# Observabilidad de agentes

El sistema implementa **dos niveles de observabilidad**.

### Observabilidad interna (Postgres)

La tabla `agent_runs` registra:

- agente ejecutado
- estado (success / failed)
- timestamps
- duración
- error si ocurre

La página `/runs` permite visualizar el historial de ejecuciones del pipeline.

---

### Observabilidad de LLM y agentes (LangSmith)

Se integró **LangSmith** para tracing del sistema agentic.

Cada ejecución genera un trace con:

- ejecución completa del pipeline
- pasos por agente
- llamadas al modelo
- latencias y errores

Esto permite depurar el comportamiento del pipeline y analizar el desempeño de cada agente.

---

# DevOps / AgenticOps

El proyecto implementa prácticas básicas de operaciones:

### CI/CD

Pipeline en **GitHub Actions** que ejecuta:

- instalación de dependencias
- lint
- build

Esto asegura que el proyecto sea compilable antes de despliegues.

### Despliegue

La aplicación se despliega en **Vercel**, con variables de entorno para:

- DeepSeek API
- Neon Postgres
- LangSmith

### Protección de uso de modelo

Se implementó un **password gate con middleware** para evitar uso público no autorizado del endpoint `/api/analyze`.

---

# Experiencia de usuario

El flujo de uso es simple:

1. El usuario introduce una idea de proyecto
2. El pipeline multi-agente genera una especificación
3. El resultado se presenta estructurado
4. Se puede consultar el historial de ejecuciones en `/runs`

---

# Estructura del proyecto

```
app/
  api/
    analyze/
    unlock/
  runs/
  unlock/

lib/
  agents/
  tools/
  llm/
  db.ts

.github/
  workflows/
    ci.yml
```

La estructura separa claramente:

- agentes
- herramientas
- integración LLM
- persistencia
- interfaz

---

# Próximos pasos

Debido al tiempo limitado del reto, algunas mejoras naturales quedarían como extensiones futuras:

### Persistencia completa de resultados de agentes
Actualmente el pipeline guarda el proyecto final y los logs de ejecución.  
Un siguiente paso sería almacenar **las respuestas intermedias de cada agente** para permitir:

- debugging detallado
- comparación de ejecuciones
- evaluación de agentes

### Evaluación automática de agentes
Integrar datasets de evaluación con LangSmith para medir calidad de outputs.

### Extensión del Tool Layer
Convertir las herramientas actuales en un **MCP server completo** para permitir uso directo por agentes.

### Mejora de UX
Agregar:

- exportación directa a documento
- historial de proyectos
- edición manual de especificaciones

---

# Instalación local

```
git clone <repo>
npm install
```

Variables de entorno necesarias:

```
DATABASE_URL=
DEEPSEEK_API_KEY=
LANGSMITH_API_KEY=
APP_GATE_PASSWORD=
APP_GATE_COOKIE=
```

Ejecutar:

```
npm run dev
```

---

# Conclusión

Agentic Forge AI demuestra una implementación funcional de:

- **arquitectura multi-agente basada en roles**
- **protocolo agent-to-agent estructurado**
- **observabilidad con LangSmith**
- **pipeline de CI/CD**
- **aplicación web desplegable**

El proyecto prioriza **claridad arquitectónica, trazabilidad y despliegue funcional**, manteniendo el alcance adecuado para un sistema agentic evaluable en un entorno real.
