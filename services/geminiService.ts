import { GoogleGenAI, Type } from "@google/genai";
import { Selections } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateTrainingPlan = async (selections: Selections): Promise<string> => {
  const { trainingType, difficulty, duration, groupSize } = selections;

  const prompt = `
    Eres un entrenador de fútbol experto de élite. Tu tarea es crear una sesión de entrenamiento personalizada y detallada basada en las siguientes preferencias del usuario:

    - Tipo de entrenamiento: ${trainingType}
    - Nivel de dificultad: ${difficulty}
    - Duración total: ${duration} minutos
    - Participantes: ${groupSize === 'Solo' ? 'Entrenamiento individual' : 'Entrenamiento en grupo'}

    Analiza estas preferencias y genera un plan de entrenamiento completo y coherente. La duración de cada fase (calentamiento, principal, enfriamiento) debe ser proporcional a la duración total del entrenamiento. Los ejercicios deben ser apropiados para el nivel de dificultad seleccionado y el número de participantes.

    Devuelve el plan usando EXACTAMENTE el siguiente formato, sin añadir ninguna introducción, saludo o conclusión adicional. Usa emojis como se indica a continuación. Sé muy específico con los ejercicios.

    **Entrenamiento de Fútbol - Nivel ${difficulty}**
    **Duración total:** ${duration} minutos

    **1️⃣ Calentamiento (aproximadamente ${Math.round(duration * 0.15)} min)**
    - **[Nombre del Ejercicio 1]:** [Descripción breve y clara del ejercicio de calentamiento].
    - **[Nombre del Ejercicio 2]:** [Descripción breve y clara del ejercicio de calentamiento].

    **2️⃣ Entrenamiento principal (aproximadamente ${Math.round(duration * 0.7)} min)**
    - **Fase de ${trainingType}:**
    - **[Nombre del Ejercicio 1]:** [Descripción detallada y específica del ejercicio principal].
    - **[Nombre del Ejercicio 2]:** [Descripción detallada y específica del ejercicio principal].
    - **[Nombre del Ejercicio 3]:** [Descripción detallada y específica del ejercicio principal].

    **3️⃣ Enfriamiento (aproximadamente ${Math.round(duration * 0.15)} min)**
    - **[Nombre del Ejercicio 1]:** [Descripción breve y clara del ejercicio de estiramiento y recuperación].
    - **[Nombre del Ejercicio 2]:** [Descripción breve y clara del ejercicio de estiramiento y recuperación].
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


export const generateDiagrams = async (planText: string): Promise<string[]> => {
  const prompt = `
    Eres un experto diseñador de diagramas de entrenamiento de fútbol que se especializa en crear representaciones visuales claras en formato SVG.

    Tarea:
    Analiza el siguiente plan de entrenamiento. Para CADA ejercicio descrito bajo "2️⃣ Entrenamiento principal", genera un diagrama en formato SVG. IGNORA los ejercicios de calentamiento y enfriamiento.

    Plan de Entrenamiento:
    ---
    ${planText}
    ---

    Especificaciones para el SVG:
    1.  **Canvas**: Usa un viewBox="0 0 400 250".
    2.  **Campo**: Un rectángulo verde como fondo: <rect width="400" height="250" fill="#2E7D32" stroke="#FFF" stroke-width="2" />.
    3.  **Líneas**: Dibuja una línea de medio campo blanca.
    4.  **Jugadores**: Usa círculos <circle cx="..." cy="..." r="8" />.
        -   Jugadores principales/activos: fill="#FFFFFF" (blanco).
        -   Asistentes/oponentes: fill="#FFEB3B" (amarillo).
        -   Balón: Un círculo más pequeño (r="5") con fill="#FFA726" (naranja).
    5.  **Movimientos**:
        -   **Recorrido del jugador**: Flechas continuas de color blanco. Usa un <defs> para el arrowhead.
        -   **Pase de balón**: Flechas discontinuas (stroke-dasharray="5,5") de color amarillo.
    6.  **Texto**: Incluye el nombre del ejercicio en la esquina superior izquierda. <text x="10" y="20" font-family="sans-serif" font-size="14" fill="white">[Nombre del Ejercicio]</text>.
    7.  **Claridad**: El diagrama debe ser simple, claro y fácil de entender.

    Formato de Salida:
    Devuelve una única respuesta JSON. La respuesta debe contener un objeto con una única clave "diagrams". El valor de "diagrams" debe ser un array de strings, donde cada string es el código SVG completo para un ejercicio principal. El orden de los SVGs en el array debe corresponder exactamente al orden de los ejercicios en el plan.

    Ejemplo de salida JSON esperada:
    {
      "diagrams": [
        "<svg viewBox='0 0 400 250'>...</svg>",
        "<svg viewBox='0 0 400 250'>...</svg>"
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
                        items: {
                            type: Type.STRING
                        }
                    }
                }
            }
        }
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);
    return result.diagrams || [];
  } catch (error) {
    console.error("Error generating diagrams:", error);
    throw new Error("No se pudieron generar los diagramas.");
  }
};
