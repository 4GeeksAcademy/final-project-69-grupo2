# Estructura del Proyecto

Este repositorio es una aplicación fullstack con backend en Python y frontend en React/Vite, preparada para despliegue en plataformas como Render.

- Backend: código Python localizado en `src/`, con una API Flask y migraciones Alembic.
- Frontend: aplicación React en `src/front/`, con rutas, componentes y estilos.
- Deploy / configuración: archivos para Render, Docker, entornos y dependencias.

## Estructura principal

```
final-project-69-grupo2/
├── .devcontainer/               # Configuración del contenedor de desarrollo
├── .env.example                 # Ejemplo de variables de entorno
├── .eslintrc                    # Configuración de ESLint
├── .gitignore
├── .gitpod.Dockerfile
├── .gitpod.yml
├── .vscode/                     # Configuración de VS Code
├── 4geeks.ico
├── Dockerfile.render            # Dockerfile para Render
├── Pipfile
├── Pipfile.lock
├── Procfile
├── README.es.md
├── README.md
├── database.sh
├── dist/                        # Distribución generada (build output)
├── docs/
│   ├── CHANGE_LOG.md
│   ├── HELP.md
│   └── assets/
│       ├── greeting.py
│       └── reset_migrations.bash
├── index.html
├── learn.json
├── migrations/                  # Migraciones de base de datos principales
│   ├── alembic.ini
│   ├── env.py
│   ├── README
│   ├── script.py.mako
│   └── versions/
│       ├── 1e71641c60a5_.py
│       ├── 2c00e9ec2208_.py
│       ├── 6a96d3fa85b5_update_existing_hora_cierre_to_23_00.py
│       ├── 8da7ee630f8a_.py
│       └── ab5f44d6e473_update_existing_hora_cierre_to_24_00.py
├── node_modules/                # Dependencias Node (no versionadas)
├── package-lock.json
├── package.json
├── public/
│   ├── bundle.js
│   ├── bundle.js.LICENSE.txt
│   └── index.html
├── pycodestyle.cfg
├── render.yaml
├── render_build.sh
├── requirements.txt
├── structure.md
├── vite.config.js
└── src/
    ├── app.py
    ├── wsgi.py
    ├── api/                    # Backend API y lógica
    │   ├── __init__.py
    │   ├── admin.py
    │   ├── commands.py
    │   ├── models.py
    │   ├── routes.py
    │   └── utils.py
    ├── front/                  # Frontend React/Vite
    │   ├── assets/
    │   │   └── img/
    │   ├── components/
    │   │   ├── BackendURL.jsx
    │   │   ├── ContactComplejoDeportivo.jsx
    │   │   ├── Footer.jsx
    │   │   ├── HorariosAdministrador.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ScrollToTop.jsx
    │   ├── hooks/
    │   │   └── useGlobalReducer.jsx
    │   ├── pages/
    │   │   ├── ActivationAccount.jsx
    │   │   ├── AddCancha.jsx
    │   │   ├── AddComplejoDeportivo.jsx
    │   │   ├── Canchas.jsx
    │   │   ├── Complejos.jsx
    │   │   ├── Demo.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── GestionHorarios.jsx
    │   │   ├── Home.jsx
    │   │   ├── Landing.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Login.jsx
    │   │   ├── RecoveryPassword.jsx
    │   │   ├── Register.jsx
    │   │   ├── Reservas.jsx
    │   │   ├── Single.jsx
    │   │   ├── UserReservas.jsx
    │   │   └── css/
    │   │       └── global.css
    │   ├── index.css
    │   ├── main.jsx
    │   ├── routes.jsx
    │   ├── services/
    │   │   └── user.services.js
    │   └── store.js
    └── migrations/              # Migraciones específicas del backend dentro de src
        ├── alembic.ini
        ├── env.py
        ├── README
        └── script.py.mako
```
