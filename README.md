# ⚽ FutbolAI

**FutbolAI** es una aplicación web desarrollada por **Raúl Pérez Hinojal**, creada con **React + TypeScript**, que utiliza **Google AI Studio** para generar sesiones de entrenamiento de fútbol personalizadas.  
El usuario puede escribir o hablar sobre lo que necesita entrenar, y la IA genera **planes completos con ejercicios, tiempos y diagramas visuales** del campo.

---

## 🧠 Características principales

- Generación de entrenamientos personalizados con inteligencia artificial.  
- Sesiones adaptadas a diferentes objetivos: técnica, táctica, resistencia, definición, defensa, etc.  
- Diagramas automáticos de los ejercicios en el campo.  
- Exportación de sesiones a **PDF** o **imagen PNG**.  
- Interfaz moderna y limpia desarrollada con **React + TypeScript**.  
- Integración directa con **Google AI Studio** mediante API Key segura.  

---

## 🧩 Tecnologías utilizadas

| Tipo | Tecnología |
|------|-------------|
| Frontend | React + TypeScript |
| IA | Google AI Studio |
| Despliegue | Vercel / Netlify / GitHub Pages |
| Estilos | TailwindCSS (opcional) |
| Control de versiones | Git + GitHub |

---

## 🚀 Instalación y ejecución local

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/perezhinojal/futbolai.git
Entra en el proyecto:

cd futbolai


Instala las dependencias:

npm install


Crea un archivo .env en la raíz del proyecto:

VITE_GOOGLE_API_KEY=tu_clave_de_google_ai


Ejecuta la app en modo desarrollo:

npm run dev


Abre en tu navegador:
👉 http://localhost:5173

🌐 Despliegue

Puedes desplegar esta app fácilmente con Vercel:

Ve a https://vercel.com

Conecta tu repositorio de GitHub

Pulsa Deploy

Obtendrás una URL como:
👉 https://futbolai.vercel.app

🏗️ Estructura del proyecto
futbolai/
│
├── public/              # Archivos públicos
├── src/
│   ├── components/      # Componentes de interfaz
│   ├── pages/           # Páginas principales
│   ├── services/        # Conexión con la API de Google AI
│   ├── assets/          # Imágenes y recursos
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
│
├── .env                 # Clave API de Google AI (no subir a GitHub)
├── package.json
└── vite.config.ts

💬 Cómo funciona

El usuario escribe o dice qué quiere entrenar (por ejemplo: “quiero mejorar los pases y la defensa”).

La IA analiza la petición y genera un plan completo:

Calentamiento

Ejercicios principales

Enfriamiento

Se pueden generar diagramas visuales de cada ejercicio en el campo.

El usuario puede exportar el plan en PDF o PNG para imprimirlo o compartirlo.

🧾 Licencia

Este proyecto está bajo la licencia MIT, por lo que puedes usarlo, modificarlo y compartirlo libremente.

👨‍💻 Autor

Desarrollado por: Raúl Pérez Hinojal
📧 Correo: perezhinojal@gmail.com

📸 Instagram: @perezhinojal

🌐 GitHub: https://github.com/perezhinojal
