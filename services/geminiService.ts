import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateTrainingPlan = async (userDescription: string, groupSize: string): Promise<string> => {
  const prompt = `
    Eres un entrenador de fútbol profesional de élite. Tu tarea es generar un plan de entrenamiento personalizado basado en la descripción que el usuario te da y el tamaño del grupo.

    Instrucciones para ti, el AI Coach:
    1.  Analiza la descripción del usuario y el tamaño del grupo para el que se entrena.
    2.  Adapta los ejercicios al tamaño del grupo:
        - Si el tamaño es 'Solo', enfócate en habilidades técnicas individuales, control del balón y condición física.
        - Si es 'Grupo Pequeño' (2-6 jugadores), incluye ejercicios de pases, duelos 1v1 o 2v2 y pequeñas combinaciones.
        - Si es 'Equipo' (7+ jugadores), diseña ejercicios tácticos, juegos de posición y simulaciones de partido.
    3.  Infiere el nivel de dificultad (Básico, Intermedio, Avanzado) y una duración apropiada del entrenamiento basándote en la descripción del usuario.
    4.  Genera un plan de entrenamiento completo y coherente que incluya Calentamiento, Entrenamiento principal y Enfriamiento.
    5.  La duración de cada fase debe ser proporcional a la duración total que estimes.
    6.  Los ejercicios deben ser específicos y alineados con los objetivos del usuario y el tamaño del grupo.

    Datos del Entrenamiento:
    Descripción del usuario: "${userDescription}"
    Tamaño del grupo: ${groupSize}

    Instrucciones de formato para tu respuesta:
    - La salida debe ser texto plano, claro y legible.
    - NO uses NINGÚN caracter de formato como asteriscos, guiones, emojis o markdown.
    - Presenta el plan de manera ordenada con títulos y subtítulos claros, usando solo texto.
    - Sigue EXACTAMENTE la estructura del siguiente ejemplo.

    Ejemplo de formato de salida:

    Entrenamiento de Fútbol Nivel [Nivel inferido]
    Duración total: [Duración inferida en minutos]

    1. Calentamiento ([Duración] minutos)
    [Nombre del Ejercicio 1]: [Descripción breve y clara del ejercicio].
    [Nombre del Ejercicio 2]: [Descripción breve y clara del ejercicio].

    2. Entrenamiento principal ([Duración] minutos)
    [Nombre del Ejercicio 1]: [Descripción detallada y específica del ejercicio].
    [Nombre del Ejercicio 2]: [Descripción detallada y específica del ejercicio].
    [Nombre del Ejercicio 3]: [Descripción detallada y específica del ejercicio].

    3. Enfriamiento ([Duración] minutos)
    [Nombre del Ejercicio 1]: [Descripción breve y clara del ejercicio].
    [Nombre del Ejercicio 2]: [Descripción breve y clara del ejercicio].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating training plan:", error);
    return "Lo siento, ha ocurrido un error al generar tu plan de entrenamiento. Por favor, inténtalo de nuevo.";
  }
};

const extractMainExercises = (planText: string): { name: string, description: string }[] => {
  const exercises: { name: string, description: string }[] = [];
  const lines = planText.split('\n');
  let inMainSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('2. Entrenamiento principal')) {
      inMainSection = true;
      continue;
    }
    if (trimmedLine.startsWith('3. Enfriamiento')) {
      inMainSection = false;
      break;
    }

    if (inMainSection) {
      const separatorIndex = trimmedLine.indexOf(':');
      if (separatorIndex > 0) {
        const name = trimmedLine.substring(0, separatorIndex).trim();
        const description = trimmedLine.substring(separatorIndex + 1).trim();
        if (name && description) {
          exercises.push({ name, description });
        }
      }
    }
  }
  return exercises;
};


export const generateDiagrams = async (planText: string): Promise<Record<string, string>> => {
  const mainExercises = extractMainExercises(planText);

  if (mainExercises.length === 0) {
    console.warn("No exercises found in the main training section to generate diagrams for.");
    return {};
  }
  
  const exercisesForPrompt = mainExercises.map(ex => `${ex.name}: ${ex.description}`).join('\n');

  const prompt = `
    Eres un experto diseñador de diagramas de entrenamiento de fútbol que se especializa en crear representaciones visuales claras y profesionales en formato SVG.

    Tarea:
    Analiza la siguiente lista de ejercicios de fútbol. Para CADA ejercicio en la lista, genera un diagrama en formato SVG.

    Ejercicios para diagramar:
    ---
    ${exercisesForPrompt}
    ---

    Especificaciones para el SVG (estilo profesional y claro, inspirado en diagramas tácticos de élite):
    1.  **Canvas**: Usa un viewBox="0 0 400 250".
    2.  **Campo**: Un rectángulo verde vibrante como fondo: <rect width="400" height="250" fill="#4CAF50" />. Dibuja las líneas esenciales del campo en blanco (stroke="#FFF", stroke-width="2", fill="none"), como el área de penalti en un lado y la línea de medio campo. Por ejemplo: <path d="M 0 50 L 80 50 L 80 200 L 0 200 M 200 0 L 200 250" />.
    3.  **Jugadores**: Representa a los jugadores con círculos <circle cx="..." cy="..." r="9" />.
        -   Equipo 1 (atacantes/principales): fill="#42A5F5" (azul), stroke="#000" stroke-width="1".
        -   Equipo 2 (defensores/asistentes): fill="#EF5350" (rojo), stroke="#000" stroke-width="1".
        -   Comodines/Neutrales: fill="#FFEB3B" (amarillo), stroke="#000" stroke-width="1".
    4.  **Material**:
        -   **Balón**: Un círculo blanco (r="6") con borde negro (stroke="#000" stroke-width="1").
        -   **Conos/Marcadores**: Pequeños triángulos de color naranja: <polygon points="x,y x+5,y-10 x+10,y" fill="#FF9800" />.
    5.  **Movimientos** (usa <defs> para las puntas de flecha para que se vean bien y profesionales):
        -   **Recorrido del jugador (sin balón)**: Flechas continuas, de color blanco o negro para que contrasten bien. stroke-width="2".
        -   **Conducción del jugador (con balón)**: Flechas en zigzag o sinuosas, continuas, de color blanco. stroke-width="2".
        -   **Pase de balón**: Flechas discontinuas, de color amarillo (#FFEB3B). stroke-width="2", stroke-dasharray="5,5".
    6.  **Texto**: Incluye el nombre del ejercicio en la esquina superior izquierda. <text x="10" y="20" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" style="text-shadow: 1px 1px 2px black;">[Nombre del Ejercicio]</text>.
    7.  **Claridad y Profesionalismo**: Asegúrate de que los elementos no se superpongan de manera confusa. El diseño debe ser limpio y visualmente atractivo, como los que usaría un analista táctico profesional.

    Formato de Salida:
    Devuelve una única respuesta JSON. La respuesta debe contener un objeto con una única clave "diagrams". El valor de "diagrams" debe ser un ARRAY de objetos. Cada objeto en el array representará un ejercicio y tendrá dos claves: "name" (el nombre EXACTO del ejercicio que te proporcioné) y "svg" (el código SVG completo). Asegúrate de que el valor de "name" coincida perfectamente con los nombres de la lista de ejercicios.

    Ejemplo de salida JSON esperada:
    {
      "diagrams": [
        {
          "name": "[Nombre del Ejercicio 1]",
          "svg": "<svg viewBox='0 0 400 250'>...</svg>"
        },
        {
          "name": "[Nombre del Ejercicio 2]",
          "svg": "<svg viewBox='0 0 400 250'>...</svg>"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    diagrams: {
                        type: Type.ARRAY,
                        description: "Un array de objetos, donde cada objeto representa un diagrama de ejercicio.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: {
                              type: Type.STRING,
                              description: "El nombre del ejercicio."
                            },
                            svg: {
                              type: Type.STRING,
                              description: "El código SVG del diagrama."
                            }
                          },
                          required: ["name", "svg"]
                        }
                    }
                }
            }
        }
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);
    
    if (result.diagrams && Array.isArray(result.diagrams)) {
      const diagramsRecord: Record<string, string> = result.diagrams.reduce((acc, item) => {
        if (item.name && item.svg) {
          acc[item.name] = item.svg;
        }
        return acc;
      }, {});
      return diagramsRecord;
    }

    return {};
  } catch (error) {
    console.error("Error generating diagrams:", error);
    throw new Error("No se pudieron generar los diagramas.");
  }
};