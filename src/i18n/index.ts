import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = createInstance();

export const ui = {
  en: { translation: {
    home: 'Home', progress: 'Progress', settings: 'Settings', appName: 'Sleep Education', back: 'Back', backToModules: 'Back to Modules', backToModule: 'Back to Module', you: 'You', askLesson: 'Ask about this lesson',
    welcome: 'Learn at your pace. Your progress stays on this device.',
    start: 'Start', continue: 'Continue', review: 'Review module', allModulesComplete: 'All modules complete', reviewModules: 'Review any module below.',
    notStarted: 'Not started', inProgress: 'In progress', completed: 'Completed',
    overallProgress: 'Overall progress', steps: 'steps', previous: 'Previous', next: 'Next',
    submit: 'Submit answer', retry: 'Try again', selected: 'selected', about: 'About & disclaimer', changeAnswers: 'Change answers', submitAnswers: 'Submit {{count}} answers',
    language: 'Language', narration: 'Narration', narrationRate: 'Narration speed',
    reset: 'Reset progress', resetTitle: 'Reset all progress?', resetBody: 'This removes lesson progress and saved answers from this device. Language and narration preferences will remain.',
    cancel: 'Cancel', confirmReset: 'Reset', play: 'Play', stop: 'Stop', replay: 'Replay',
    educationalDisclaimer: 'This app provides general educational information and does not replace advice from your healthcare professional. Talk with your healthcare team about questions related to your symptoms, diagnosis, pregnancy, or treatment.',
    aboutPrivacyBody: 'Content, progress, and preferences stay on this device. No personal health information is collected. Written content works offline. Narration depends on installed system voices. The optional AI companion sends only text you choose to share, and only after you consent.',
    loading: 'Loading your learning plan…', answerSaved: 'Answer submitted. You can continue.',
    correct: 'Correct.', notQuite: 'Not quite.', changeAnswer: 'Change answer',
    reflectionSaved: 'Response saved.', personalReflection: 'PERSONAL REFLECTION', reflectionMultiInstruction: 'Select any that apply. This response is never graded.', reflectionSingleInstruction: 'Select one response. This response is never graded.', saveResponse: 'Save response', saveResponses: 'Save {{count}} responses', correctChoice: 'Correct choice',
    incorrectChoice: 'Selected, but not correct', missedCorrectChoice: 'Correct choice not selected',
    aiTools: 'AI learning tools', aiOptionalFeedback: 'AI feedback is optional. Lessons work without it.', revokeAiConsent: 'Revoke AI consent',
    chatPrivacyNotice: 'Do not enter names, emails, phone numbers, dates, addresses, record numbers, clinician names, or appointment dates. Automated checks cannot guarantee removal of identifying information.',
    close: 'Close', closeLessonChat: 'Close lesson chat', reflectTutor: 'Reflect with tutor', openAiActivity: 'Open AI activity', openOptionalAiActivity: 'Open optional AI activity', askVela: 'Ask Vela', velaActivityPlaceholder: 'Write what you want to share with Vela.', velaActivitySendNotice: 'Your response is sent only when you choose to send it.', velaActivityConsentNotice: 'Consent is required before anything is sent. You can continue without using Vela.', yourResponse: 'Your response', pitch: 'Pitch', decrease: 'Decrease', increase: 'Increase', aiFeatures: 'AI features', imageSource: 'Image source',
    chatPrivacyWarning: 'Please remove identifying details before sending. This check is supplementary and cannot guarantee removal of health information.',
    openVela: 'Open Vela', closeVela: 'Close Vela', velaSheetTitle: 'Vela learning companion', velaEmpty: 'Ask a question about this lesson or share what you understand.', velaThinking: 'Vela is thinking…', velaStop: 'Stop response', velaRetry: 'Try again', velaOffline: 'You appear to be offline. Your lesson and saved progress are still available.', velaSafety: 'Vela can offer educational context, but cannot diagnose, recommend treatment, or change PAP settings.', velaConsentTitle: 'Use Vela for optional learning support?', velaConsentBody: 'Vela provides educational context about sleep and this lesson. It is not a clinician and cannot diagnose, prescribe, or create a personalized treatment plan.', velaConsentData: 'Your message and recent lesson context are sent to the configured service only after you consent. Do not include names, dates, contact details, or medical record information. You can withdraw consent in Settings.', velaConsentEnable: 'Continue to Vela', velaConsentDisabled: 'Vela is disabled in Settings.', velaNudge: 'Feel free to ask me questions.', clearTranscript: 'Clear conversation', transcriptCleared: 'Conversation cleared.', reflectionLabel: 'REFLECTION', reflectionPlaceholder: 'Write a private reflection (optional).', reflectionPrivacy: 'This stays on your device.', reflectionDiscussBody: 'Vela sharing is always explicit and never automatic.', saveReflection: 'Save reflection', savedLocally: 'Saved locally on this device.', editReflection: 'Edit response', discussWithVela: 'Discuss this with Vela', saveFailed: 'Could not save. Your draft is still here.', retrySave: 'Retry save', skipOptional: 'Skip', completeModule: 'Complete module', moduleComplete: 'Module complete', nextModule: 'Next module', reviewCompletion: 'Review this module', accessibility: 'Accessibility', reducedMotion: 'Reduce motion', reducedMotionBody: 'Removes Vela bobbing and transition motion.', velaPrivacy: 'Vela & privacy', aiDisabled: 'Vela is turned off. No AI request will be made.',
    clearVelaConversation: 'Clear Vela conversation', privacyDetails: 'Privacy details', cancelEdit: 'Cancel edit', completionSaved: 'Your module progress is saved on this device.', continueToNextModule: 'Continue to {{module}}',
    chatSend: 'Send', chatPlaceholder: 'Write your response. Avoid names or identifying details.', chatConsent: 'I understand and consent', chatTutor: 'Learning conversation', chatFeedback: 'Educational feedback', chatContinue: 'Continue lesson', chatPrivacy: 'This optional tutor can use general sleep and health science as well as lesson context. Recent chat context is sent only after consent and is not saved as an AI conversation on this device.', chatThinking: 'Thinking…', chatEmpty: 'Tell us what you understand or what you want to ask.', chatUnavailable: 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.',
    velaName: 'Vela', velaGuide: 'AI sleep education guide', velaRateLimited: 'Vela is temporarily busy. Please try again shortly. Your lesson and saved progress are still available.',
  }},
  es: { translation: {
    velaName: 'Vela', velaGuide: 'Guía educativa de sueño con IA', velaRateLimited: 'Vela está temporalmente ocupada. Inténtelo de nuevo en breve. Su lección y progreso guardado siguen disponibles.',
    home: 'Inicio', progress: 'Progreso', settings: 'Ajustes', appName: 'Educación del sueño', back: 'Atrás', backToModules: 'Volver a módulos', backToModule: 'Volver al módulo', you: 'Usted', askLesson: 'Preguntar sobre esta lección',
    welcome: 'Aprenda a su ritmo. Su progreso permanece en este dispositivo.',
    start: 'Comenzar', continue: 'Continuar', review: 'Repasar módulo', allModulesComplete: 'Todos los módulos están completos', reviewModules: 'Repase cualquier módulo a continuación.',
    notStarted: 'No iniciado', inProgress: 'En curso', completed: 'Completado',
    overallProgress: 'Progreso total', steps: 'pasos', previous: 'Anterior', next: 'Siguiente',
    submit: 'Enviar respuesta', retry: 'Intentar de nuevo', selected: 'seleccionado', about: 'Información y aviso', changeAnswers: 'Cambiar respuestas', submitAnswers: 'Enviar {{count}} respuestas',
    language: 'Idioma', narration: 'Narración', narrationRate: 'Velocidad de narración',
    reset: 'Restablecer progreso', resetTitle: '¿Restablecer todo el progreso?', resetBody: 'Esto elimina el progreso y las respuestas guardadas de este dispositivo. El idioma y la narración se conservan.',
    cancel: 'Cancelar', confirmReset: 'Restablecer', play: 'Reproducir', stop: 'Detener', replay: 'Repetir',
    educationalDisclaimer: 'Esta aplicación ofrece información educativa general y no reemplaza el consejo de su profesional de salud. Hable con su equipo médico sobre preguntas relacionadas con sus síntomas, diagnóstico, embarazo o tratamiento.',
    aboutPrivacyBody: 'El contenido, el progreso y las preferencias permanecen en el dispositivo. No se recopilan datos personales de salud. El contenido escrito funciona sin conexión. La narración depende de las voces instaladas. El acompañante de IA opcional envía solo el texto que usted decide compartir, y solo después de su consentimiento.',
    loading: 'Cargando su plan de aprendizaje…', answerSaved: 'Respuesta enviada. Puede continuar.',
    correct: 'Correcto.', notQuite: 'Aún no.', changeAnswer: 'Cambiar respuesta',
    reflectionSaved: 'Respuesta guardada.', personalReflection: 'REFLEXIÓN PERSONAL', reflectionMultiInstruction: 'Seleccione todas las opciones que correspondan. Esta respuesta nunca se califica.', reflectionSingleInstruction: 'Seleccione una respuesta. Esta respuesta nunca se califica.', saveResponse: 'Guardar respuesta', saveResponses: 'Guardar {{count}} respuestas', correctChoice: 'Opción correcta',
    incorrectChoice: 'Seleccionada, pero no correcta', missedCorrectChoice: 'Opción correcta no seleccionada',
    aiTools: 'Herramientas educativas de IA', aiOptionalFeedback: 'La orientación de IA es opcional. Las lecciones funcionan sin ella.', revokeAiConsent: 'Revocar consentimiento de IA',
    chatPrivacyNotice: 'No escriba nombres, correos, teléfonos, fechas, direcciones, números de expediente, nombres de profesionales ni citas. Las comprobaciones automáticas no garantizan eliminar información identificativa.',
    close: 'Cerrar', closeLessonChat: 'Cerrar el chat de la lección', reflectTutor: 'Reflexionar con el tutor', openAiActivity: 'Abrir actividad de IA', openOptionalAiActivity: 'Abrir actividad opcional de IA', askVela: 'Preguntar a Vela', velaActivityPlaceholder: 'Escriba lo que quiere compartir con Vela.', velaActivitySendNotice: 'Su respuesta se envía solo cuando decide enviarla.', velaActivityConsentNotice: 'Se requiere consentimiento antes de enviar algo. Puede continuar sin usar Vela.', yourResponse: 'Su respuesta', pitch: 'Tono', decrease: 'Disminuir', increase: 'Aumentar', aiFeatures: 'Funciones de IA', imageSource: 'Fuente de imagen',
    chatPrivacyWarning: 'Quite los datos identificativos antes de enviar. Esta comprobación es complementaria y no garantiza eliminar información de salud.',
    openVela: 'Abrir Vela', closeVela: 'Cerrar Vela', velaSheetTitle: 'Acompañante educativo Vela', velaEmpty: 'Haga una pregunta sobre esta lección o comparta lo que entiende.', velaThinking: 'Vela está pensando…', velaStop: 'Detener respuesta', velaRetry: 'Intentar de nuevo', velaOffline: 'Parece que está sin conexión. Su lección y progreso guardado siguen disponibles.', velaSafety: 'Vela puede ofrecer contexto educativo, pero no puede diagnosticar, recomendar tratamiento ni cambiar ajustes de PAP.', velaConsentTitle: '¿Usar Vela para apoyo educativo opcional?', velaConsentBody: 'Vela ofrece contexto educativo sobre el sueño y esta lección. No es profesional clínico y no puede diagnosticar, recetar ni crear un plan de tratamiento personalizado.', velaConsentData: 'Su mensaje y el contexto reciente de la lección se envían al servicio configurado solo después de su consentimiento. No incluya nombres, fechas, datos de contacto ni información de expediente. Puede retirar el consentimiento en Ajustes.', velaConsentEnable: 'Continuar a Vela', velaConsentDisabled: 'Vela está desactivada en Ajustes.', velaNudge: 'Si tienes preguntas, pregúntame.', clearTranscript: 'Borrar conversación', transcriptCleared: 'Conversación borrada.', reflectionLabel: 'REFLEXIÓN', reflectionPlaceholder: 'Escriba una reflexión privada (opcional).', reflectionPrivacy: 'Esto permanece en su dispositivo.', reflectionDiscussBody: 'Compartir con Vela siempre es explícito y nunca automático.', saveReflection: 'Guardar reflexión', savedLocally: 'Guardada localmente en este dispositivo.', editReflection: 'Editar respuesta', discussWithVela: 'Hablar de esto con Vela', saveFailed: 'No se pudo guardar. El borrador sigue aquí.', retrySave: 'Reintentar guardado', skipOptional: 'Omitir', completeModule: 'Completar módulo', moduleComplete: 'Módulo completado', nextModule: 'Siguiente módulo', reviewCompletion: 'Repasar este módulo', accessibility: 'Accesibilidad', reducedMotion: 'Reducir movimiento', reducedMotionBody: 'Elimina el movimiento de Vela y las transiciones.', velaPrivacy: 'Vela y privacidad', aiDisabled: 'Vela está desactivada. No se hará ninguna solicitud de IA.',
    clearVelaConversation: 'Borrar conversación de Vela', privacyDetails: 'Detalles de privacidad', cancelEdit: 'Cancelar edición', completionSaved: 'El progreso de su módulo se guarda en este dispositivo.', continueToNextModule: 'Continuar a {{module}}',
    chatSend: 'Enviar', chatPlaceholder: 'Escriba su respuesta. Evite nombres o datos identificativos.', chatConsent: 'Entiendo y doy mi consentimiento', chatTutor: 'Conversación educativa', chatFeedback: 'Orientación educativa', chatContinue: 'Continuar la lección', chatPrivacy: 'Este tutor opcional puede usar ciencia general del sueño y la salud además del contexto de la lección. El contexto reciente se envía solo después del consentimiento y no se guarda como conversación de IA en este dispositivo.', chatThinking: 'Pensando…', chatEmpty: 'Díganos qué entiende o qué quiere preguntar.', chatUnavailable: 'La orientación de IA no está disponible temporalmente. Su lección y progreso guardado siguen disponibles.',
  }},
} as const;

void i18n.use(initReactI18next).init({
  resources: ui,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
  i18n.on('languageChanged', (language) => { document.documentElement.lang = language; });
}

export default i18n;
