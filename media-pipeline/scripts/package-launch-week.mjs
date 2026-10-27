import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, execFileSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaPipelineRoot = path.resolve(__dirname, '..');
const launchWeekDir = path.resolve(mediaPipelineRoot, 'output', 'launch-week-oct26-30');

if (!fs.existsSync(launchWeekDir)) {
  fs.mkdirSync(launchWeekDir, { recursive: true });
}

function ensureCoverBake(videoPath, coverPath) {
  if (!coverPath || !fs.existsSync(coverPath) || !fs.existsSync(videoPath)) {
    return videoPath;
  }
  const markerPath = `${videoPath}.cover-baked`;
  if (fs.existsSync(markerPath)) {
    console.log(`[video] ℹ Portada ya horneada en frame 0 (${path.basename(videoPath)})`);
    return videoPath;
  }

  console.log(`[video] 🎬 Horneando portada en frame 0 (0.15s) de ${path.basename(videoPath)} para YouTube Shorts...`);
  const tempOut = `${videoPath}.tmp-cover.mp4`;

  try {
    const args = [
      '-y',
      '-loop', '1',
      '-framerate', '60',
      '-t', '0.15',
      '-i', coverPath,
      '-f', 'lavfi',
      '-t', '0.15',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-i', videoPath,
      '-filter_complex', '[0:v]scale=1080:1920,setsar=1,fps=60[v0]; [v0][1:a][2:v][2:a]concat=n=2:v=1:a=1[v][a]',
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      tempOut
    ];

    execFileSync(ffmpegPath, args, { stdio: 'ignore' });

    if (fs.existsSync(tempOut) && fs.statSync(tempOut).size > 1000000) {
      fs.copyFileSync(tempOut, videoPath);
      fs.unlinkSync(tempOut);
      fs.writeFileSync(markerPath, new Date().toISOString(), 'utf8');
      console.log(`[video] ✓ Portada horneada exitosamente en frame 0 de ${path.basename(videoPath)}`);
    } else {
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    }
  } catch (err) {
    console.warn(`[video] ⚠️ Error horneando portada en video: ${err.message}`);
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }

  return videoPath;
}

const REELS_METADATA = [
  {
    dayNumber: 1,
    folderName: '01-Lunes-Oct26',
    compositionId: 'Reel01_30PercentMyth',
    sourceVideoCandidates: ['output/reel-01-test.mp4', 'output/reel-01.mp4'],
    videoName: 'reel-01-30-percent-myth.mp4',
    scheduledTime: '07:30 BOT (GMT-4) — Lunes 26 de Octubre',
    ytShortsTitle: '¿Sabías que en clases de inglés sólo hablas un 30%? ⏰❌',
    ttCaption: `¿Por qué estudiaste años de inglés y sigues con miedo al hablar? ❌ En una clase tradicional de 60 minutos, sólo hablas 2 minutos. En teacherivan.com cambiamos las reglas: >75% tiempo de habla activa con Coaching Bicrónico (mentoría 1-a-1 + simulador de voz IA 24/7). 

Probá gratis tu diagnóstico de voz en 90 segundos en el enlace de mi perfil 🚀

#TeacherIvan #AprenderIngles #InglesFluido #ClasesDeIngles #InglesOnline #MetodoBicronico #SpokenEnglish #InglesParaProfesionales #Bolivia #Latam`,
    igCaption: `¿Sabías que en una clase tradicional de 1 hora sólo hablas un 30% del tiempo? ⏰

La anatomía de una clase grupal tradicional es implacable:
👉 40 minutos: el profesor explica reglas y gramática.
👉 18 minutos: hablan tus compañeros.
👉 Tú: con suerte 2 minutos, cargado de miedo al error y al juicio.

Por eso nace el **Coaching Bicrónico de Teacher Ivan**:
✅ Más del 75% de tiempo de habla activa en cada sesión.
✅ Sesiones 1-a-1 en vivo enfocadas en tu meta (trabajo remoto, entrevistas, becas o IELTS).
✅ Simulador de voz con Inteligencia Artificial disponible 24/7 para entrenar entre semana sin vergüenza.
✅ Recasting nativo al instante para corregir errores sin interrumpir tu fluidez.

🔗 Entrá a teacherivan.com (link en bio) y realizá tu diagnóstico hablado gratuito en 90 segundos.

---
#TeacherIvan #AprenderIngles #InglesOnline #ClasesDeIngles #CoachingBicronico #InglesParaAdultos #InglesParaTrabajar #EntrevistasEnIngles #IELTSPrep #FluidezEnIngles #EducacionEdTech #InglesSinMiedo #HablarIngles #EstudiarIngles #Bolivia #Sucre #SantaCruz #LaPaz #Latam`,
    fbCaption: `¿Te pasa que entiendes inglés al leer pero te congelas cuando te toca hablar? 😰

El problema no eres tú: es cómo nos enseñaron. En una clase típica de 60 minutos, un alumno promedio habla apenas 2 minutos.

Con nuestro método de Coaching Bicrónico combinamos clases 1-a-1 en vivo conmigo y entrenamiento de voz con Inteligencia Artificial 24/7 para que hables más del 75% del tiempo.

Probá gratis nuestro test hablado de 90 segundos aquí 👉 https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day1

#TeacherIvan #AprenderIngles #ClasesOnline #InglesParaProfesionales`,
    utmLinks: {
      tiktok: 'https://teacherivan.com?utm_source=tiktok&utm_medium=reel&utm_campaign=launch_week_day1',
      instagram: 'https://teacherivan.com?utm_source=ig&utm_medium=reel&utm_campaign=launch_week_day1',
      youtube: 'https://teacherivan.com?utm_source=yt&utm_medium=shorts&utm_campaign=launch_week_day1',
      facebook: 'https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day1',
    },
  },
  {
    dayNumber: 2,
    folderName: '02-Martes-Oct27',
    compositionId: 'Reel02_MeetTeacherIvan',
    sourceVideoCandidates: ['output/reel-02-intro.mp4', 'output/reel-02.mp4'],
    videoName: 'reel-02-meet-teacher-ivan.mp4',
    scheduledTime: '12:30 BOT (GMT-4) — Martes 27 de Octubre',
    ytShortsTitle: 'Hola, soy Teacher Ivan: Por esto creé el Coaching Bicrónico 🚀',
    ttCaption: `Hola, soy Teacher Ivan 👋 Durante años vi a profesionales brillantes perder becas y empleos remotos por miedo a hablar en inglés. Diseñé el Coaching Bicrónico: mentoría humana 1-a-1 + simulador de voz IA 24/7. 

Hacé tu test de voz gratis en 90s en el link de mi perfil ⚡

#TeacherIvan #CoachingBicronico #InglesOnline #AprenderIngles #InglesParaTrabajo #EdTech #InglesHabla #Bolivia`,
    igCaption: `Hola, soy Teacher Ivan 👋

Durante años vi a estudiantes y profesionales brillantes perder becas internacionales, promociones laborales y empleos remotos en dólares... únicamente por miedo a hablar inglés en vivo.

El problema no es tu capacidad: es el modelo tradicional de memorizar reglas y listas de verbos sin nadie con quien practicar a diario.

Por eso diseñé mi propio ecosistema de **Coaching Bicrónico**:
1️⃣ **Mentoría Humana 1-a-1:** En nuestras clases en vivo hablas más del 75% del tiempo, enfocado en tus metas reales (entrevistas, reuniones, conferencias).
2️⃣ **Simulador de Voz con IA 24/7:** Entre clase y clase entrenas con nuestra coach de voz interactiva sin juicio ni vergüenza.
3️⃣ **Micro-Retos Diarios de 10 Minutos:** Un hábito sostenible que derriba la curva del olvido.

🔗 Entrá a teacherivan.com (link en bio) y probá gratis nuestro diagnóstico de voz en 90 segundos.

---
#TeacherIvan #PresentacionOficial #CoachingBicronico #InglesReal #EdTech #Educador #InglesParaAdultos #InglesTech #TrabajoRemoto #BecasInternacionales #IELTS #HablarIngles #ClasesParticulares #InglesSinFiltros`,
    fbCaption: `Durante años como educador vi la misma frustración: personas que llevan años estudiando inglés pero no pueden sostener una conversación de trabajo de 5 minutos sin trabarse.

Por eso fundé Teacher Ivan: un método bicrónico donde tienes mentoría 1-a-1 personalizada conmigo y simuladores de voz con inteligencia artificial para entrenar todos los días.

Descubre tu nivel exacto de 0 a 100 con nuestro test gratis de 90 segundos 👉 https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day2

#TeacherIvan #CoachingBicronico #InglesProfesional`,
    utmLinks: {
      tiktok: 'https://teacherivan.com?utm_source=tiktok&utm_medium=reel&utm_campaign=launch_week_day2',
      instagram: 'https://teacherivan.com?utm_source=ig&utm_medium=reel&utm_campaign=launch_week_day2',
      youtube: 'https://teacherivan.com?utm_source=yt&utm_medium=shorts&utm_campaign=launch_week_day2',
      facebook: 'https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day2',
    },
  },
  {
    dayNumber: 3,
    folderName: '03-Miercoles-Oct28',
    compositionId: 'Reel03_MeetEmmaRecast',
    sourceVideoCandidates: ['output/reel-03-emma.mp4', 'output/reel-03.mp4'],
    videoName: 'reel-03-meet-emma-recast.mp4',
    scheduledTime: '18:45 BOT (GMT-4) — Miércoles 28 de Octubre',
    ytShortsTitle: 'No digas "I have 25 years" en una entrevista ❌ Conoce a Emma IA ⚡',
    ttCaption: `¿Te quedas en blanco o traduces palabra por palabra en tu cabeza? 🤯 Decir "I have 25 years" o "I am agree" en una entrevista te resta puntos al instante. Conoce a Emma, nuestra Coach de voz con IA en teacherivan.com: habla en tiempo real con recasting nativo sin vergüenza.

Probá gratis tu test de 90 segundos en el link de mi perfil 📲

#EmmaAI #TeacherIvan #ErroresEnIngles #Recasting #InglesFluido #AprenderIngles #EntrevistasEnIngles #InglesReal`,
    igCaption: `¿Te quedas en blanco o traduces mentalmente cada palabra antes de hablar en inglés? 🧠🚫

En una entrevista real o reunión de trabajo, errores fósiles como:
❌ *"I have 25 years..."* (en vez de *"I am 25 years old"*)
❌ *"I am agree with you..."* (en vez de *"I agree"*)
te restan autoridad y fluidez al instante.

En teacherivan.com entrenas en vivo conmigo o con **Emma**, nuestra Coach de voz interactiva con Inteligencia Artificial:
⚡ **Recasting Nativo en Tiempo Real:** Mientras hablas, el sistema detecta tu error y te modela la frase nativa de inmediato, sin vergüenza ni juicios.
📊 **Scorecard Inmediato (0 a 100):** Al terminar recibes tu desglose en Fluidez, Sintaxis, Rango Léxico y Fonética.
🎯 **Audio Nativo de Alta Fidelidad:** Práctica 100% hablada sin latencia.

🔗 Entrá a teacherivan.com (link en bio) y haz tu prueba hablada gratis en 90 segundos.

---
#EmmaAI #TeacherIvan #Recasting #PronunciacionIngles #ErroresComunesEnIngles #InglesParaEntrevistas #FluidezOral #InglesSinMiedo #EdTechIA #AprenderInglesRapido #InglesConversacional`,
    fbCaption: `¿Sabías que traducir palabra por palabra es la razón número 1 por la que la gente se bloquea al hablar inglés?

En teacherivan.com te presentamos a Emma, nuestra Coach de voz con Inteligencia Artificial. Entrena conversaciones reales y recibe recasting nativo al instante para corregir tus errores sin vergüenza.

Haz tu prueba gratis de 90 segundos y conoce tu puntaje 👉 https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day3

#TeacherIvan #EmmaAI #InglesConversacional`,
    utmLinks: {
      tiktok: 'https://teacherivan.com?utm_source=tiktok&utm_medium=reel&utm_campaign=launch_week_day3',
      instagram: 'https://teacherivan.com?utm_source=ig&utm_medium=reel&utm_campaign=launch_week_day3',
      youtube: 'https://teacherivan.com?utm_source=yt&utm_medium=shorts&utm_campaign=launch_week_day3',
      facebook: 'https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day3',
    },
  },
  {
    dayNumber: 4,
    folderName: '04-Jueves-Oct29',
    compositionId: 'Reel04_FiveDaySprint',
    sourceVideoCandidates: ['output/reel-04-sprint.mp4', 'output/reel-04.mp4'],
    videoName: 'reel-04-five-day-sprint.mp4',
    scheduledTime: '12:15 BOT (GMT-4) — Jueves 29 de Octubre',
    ytShortsTitle: 'Por qué una clase a la semana NO funciona (Curva del Olvido) 🧠📉',
    ttCaption: `¿Pasas años en un instituto y sigues sin hablar fluido? Tu cerebro olvida el 80% si sólo practicas 1 vez por semana 📉 En Teacher Ivan reemplazamos las tareas aburridas por un Sprint diario de 5 días de solo 15 min.

Creá tu ruta gratis y evaluá tu nivel en el enlace de mi perfil 🚀

#CurvaDelOlvido #TeacherIvan #MicroLearning #MetodoBicronico #HabitoDeIngles #InglesDiario #AprenderIngles`,
    igCaption: `¿Por qué pasas dos años en un instituto de idiomas y sigues sintiendo que no avanzas al hablar? 📉

La ciencia cognitiva lo explica con **La Curva del Olvido**:
Si sólo tienes contacto con el idioma 1 o 2 horas a la semana, tu cerebro descarta más del 80% de lo aprendido entre una clase y otra.

En **Teacher Ivan** transformamos el aprendizaje con un **Sprint Personalizado de 5 Días** (15 minutos diarios):
🗓️ **Día 1:** Lecturas interactivas + colocaciones en audio nativo.
🗓️ **Día 2:** Mini-juegos de sintaxis y reflejos orales.
🗓️ **Día 3:** Simulación de voz con IA en escenarios de tu profesión.
🗓️ **Día 4 y 5:** WhatsApp Feedback directo con notas de voz de Teacher Ivan.
🎯 **Tu Clase Semanal 1-a-1:** Aplicamos todo en simulaciones reales de trabajo, becas o IELTS.

🔗 Entrá a teacherivan.com (link en bio), creá tu ruta gratis y evaluá tu nivel en 90 segundos.

---
#MicroLearning #CurvaDelOlvido #TeacherIvan #HabitosDeEstudio #InglesIntensivo #CoachingBicronico #InglesParaAdultos #Productividad #RutaPersonalizada #InglesEn15Minutos #InglesPractico`,
    fbCaption: `Estudiar inglés una sola vez por semana es como ir al gimnasio una vez al mes: los resultados son casi imperceptibles.

Nuestro Sprint Diario de 5 Días te toma solo 15 minutos al día con micro-misiones interactivas y feedback por WhatsApp, preparándote para tu clase semanal 1-a-1.

Crea tu ruta personalizada gratis en 90 segundos 👉 https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day4

#TeacherIvan #MetodoBicronico #MicroAprendizaje`,
    utmLinks: {
      tiktok: 'https://teacherivan.com?utm_source=tiktok&utm_medium=reel&utm_campaign=launch_week_day4',
      instagram: 'https://teacherivan.com?utm_source=ig&utm_medium=reel&utm_campaign=launch_week_day4',
      youtube: 'https://teacherivan.com?utm_source=yt&utm_medium=shorts&utm_campaign=launch_week_day4',
      facebook: 'https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day4',
    },
  },
  {
    dayNumber: 5,
    folderName: '05-Viernes-Oct30',
    compositionId: 'Reel05_90sChallenge',
    sourceVideoCandidates: ['output/reel-05-challenge.mp4', 'output/reel-05.mp4'],
    videoName: 'reel-05-90s-challenge.mp4',
    scheduledTime: '17:00 BOT (GMT-4) — Viernes 30 de Octubre',
    ytShortsTitle: 'Reto de 90 segundos: ¿Cuál es tu nivel REAL de inglés al hablar? 🏆',
    ttCaption: `¿Lees en nivel B2 pero cuando hablas caes a nivel A2? ⚠️ Muchos creen tener buen nivel hasta que llega una entrevista real. Te reto a hacer el diagnóstico hablado de 90 segundos en teacherivan.com. IA calcula tu puntaje exacto de 0 a 100 en fluidez, sintaxis y pronunciación.

Hacé el test gratis y mandame tu resultado por WhatsApp 📲

#RetoDeIngles #TeacherIvan #NivelCEFR #TestDeIngles #InglesHablado #EntrevistasLaborales #InglesB2`,
    igCaption: `¿Sabes cuál es tu nivel REAL de inglés hablado hoy según el estándar internacional CEFR? 🏆

Existe una brecha gigante entre lo que comprendemos y lo que producimos:
📖 **Lectura:** Crees estar en B2 porque entiendes textos, series y correos.
🗣️ **Habla real:** Al responder preguntas bajo presión en una entrevista, caes a nivel A2.

Hoy te reto a probar gratis el **Diagnóstico de Voz en 90 Segundos** en teacherivan.com:
1️⃣ Habla sobre tu rutina, tu carrera o una meta profesional.
2️⃣ Nuestra IA procesa tu respuesta y genera tu puntaje exacto de 0 a 100 en:
   - Fluidez & Ritmo
   - Sintaxis & Gramática
   - Vocabulario & Registro
   - Pronunciación & Fonética
3️⃣ El sistema te recomienda tu plan ideal: **Essential, Pro o Executive** con horarios flexibles de lunes a viernes.

🔗 Entrá a teacherivan.com (link en bio), hacé el test gratis y enviame tu puntaje directo por WhatsApp.

---
#RetoDeIngles #TestDeNivel #TeacherIvan #CEFR #NivelIngles #InglesB2 #InglesC1 #DiagnosticoGratis #InglesParaProfesionales #EdTechLatam #ClasesDeInglesOnline #Sucre #Bolivia #Latam`,
    fbCaption: `Muchos estudiantes creen ser nivel B2 porque entienden al leer, pero al hablar bajo presión se bloquean.

Te reto a hacer el test de voz gratuito de 90 segundos en teacherivan.com y descubrir tu puntaje oral real de 0 a 100 según el estándar CEFR.

Empieza gratis aquí y envíame tu puntaje por WhatsApp 👉 https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day5

#TeacherIvan #RetoCEFR #InglesHablado`,
    utmLinks: {
      tiktok: 'https://teacherivan.com?utm_source=tiktok&utm_medium=reel&utm_campaign=launch_week_day5',
      instagram: 'https://teacherivan.com?utm_source=ig&utm_medium=reel&utm_campaign=launch_week_day5',
      youtube: 'https://teacherivan.com?utm_source=yt&utm_medium=shorts&utm_campaign=launch_week_day5',
      facebook: 'https://teacherivan.com?utm_source=fb&utm_medium=reel&utm_campaign=launch_week_day5',
    },
  },
];

async function packageLaunchWeek() {
  console.log('[packager] Initializing Launch Week packaging...');

  for (const reel of REELS_METADATA) {
    const dayFolder = path.join(launchWeekDir, reel.folderName);
    if (!fs.existsSync(dayFolder)) {
      fs.mkdirSync(dayFolder, { recursive: true });
    }

    console.log(`\n========================================`);
    console.log(`Processing Day ${reel.dayNumber}: ${reel.folderName}`);
    console.log(`========================================`);

    // 1. Generate crisp 1080x1920 cover-thumbnail.png at frame 90
    const coverDest = path.join(dayFolder, 'cover-thumbnail.png');
    console.log(`[thumbnail] Rendering frame 90 for ${reel.compositionId}...`);
    try {
      execSync(
        `npx remotion still remotion/index.ts ${reel.compositionId} "${coverDest}" --frame=90 --gl=angle`,
        {
          cwd: mediaPipelineRoot,
          stdio: 'inherit',
        }
      );
      console.log(`[thumbnail] ✓ Generated: ${coverDest}`);
    } catch (err) {
      console.error(`[thumbnail] ❌ Error rendering cover for ${reel.compositionId}:`, err.message);
    }

    // 2. Locate and package .mp4 video file
    const targetVideoPath = path.join(dayFolder, reel.videoName);
    let foundVideo = false;

    for (const candidate of reel.sourceVideoCandidates) {
      const candidatePath = path.resolve(mediaPipelineRoot, candidate);
      if (fs.existsSync(candidatePath)) {
        console.log(`[video] Copying video from ${candidate} -> ${targetVideoPath}...`);
        fs.copyFileSync(candidatePath, targetVideoPath);
        foundVideo = true;
        break;
      }
    }

    if (!foundVideo) {
      console.log(`[video] ℹ Note: Pre-rendered video not found in candidate paths. To render:`);
      console.log(`        npx remotion render remotion/index.ts ${reel.compositionId} "${targetVideoPath}" --concurrency=2`);
    } else {
      console.log(`[video] ✓ Video packaged: ${targetVideoPath}`);
      ensureCoverBake(targetVideoPath, coverDest);
    }

    // 3. Write copy-paste-captions.md
    const captionsContent = `# 🚀 Launch Week — Día ${reel.dayNumber}: ${reel.folderName}
**Composición Remotion:** \`${reel.compositionId}\`  
**Archivo de Video:** \`${reel.videoName}\`  
**Portada / Cover:** \`cover-thumbnail.png\` (Frame 90, 1080x1920)  
**Horario Recomendado de Publicación:** \`${reel.scheduledTime}\`  

---

## 📺 1. YouTube Shorts

### Título (Title)
\`\`\`text
${reel.ytShortsTitle}
\`\`\`

### Descripción & Enlace UTM
\`\`\`text
${reel.ttCaption}

🔗 Test de Voz Gratuito en 90s:
${reel.utmLinks.youtube}
\`\`\`

---

## 🎵 2. TikTok

### Caption & Hashtags
\`\`\`text
${reel.ttCaption}
\`\`\`

### Enlace de Perfil / Bio (UTM)
\`\`\`text
${reel.utmLinks.tiktok}
\`\`\`

---

## 📸 3. Instagram Reels

### Caption & Hashtags
\`\`\`text
${reel.igCaption}
\`\`\`

### Enlace de Bio / Historias (UTM)
\`\`\`text
${reel.utmLinks.instagram}
\`\`\`

---

## 📘 4. Facebook Reels

### Caption
\`\`\`text
${reel.fbCaption}
\`\`\`

### Enlace Directo (UTM)
\`\`\`text
${reel.utmLinks.facebook}
\`\`\`
`;

    const captionsDest = path.join(dayFolder, 'copy-paste-captions.md');
    fs.writeFileSync(captionsDest, captionsContent, 'utf8');
    console.log(`[captions] ✓ Saved captions: ${captionsDest}`);
  }

  console.log('\n[packager] Launch Week packaging complete!');
}

packageLaunchWeek().catch((err) => {
  console.error('[packager] Fatal error:', err);
  process.exit(1);
});
