export interface CiasSpanishTranslation {
  title: string;
  paragraphs?: string[];
  keyPoints?: string[];
  prompt?: string;
  instructions?: string;
  contextParagraphs?: string[];
  choices?: string[];
  sourceVisibleLabels?: string[];
}

export const ciasSpanishTranslations: Record<string, CiasSpanishTranslation> = {
  'm1-01': {
    title: 'Introducción a la apnea del sueño',
    paragraphs: ['En esta sección aprenderemos qué es la apnea del sueño y cómo se trata. Veremos por qué ocurre, qué significa, por qué es importante atenderla y cómo se puede tratar.'],
  },
  'm1-02': {
    title: 'Apnea obstructiva del sueño (AOS)',
    paragraphs: ['Entonces, ¿qué es la apnea obstructiva del sueño o AOS?', 'Más información:'],
    sourceVisibleLabels: ['Respiración típica durante el sueño', 'Lengua', 'Paladar duro', 'Paladar blando', 'Vía respiratoria abierta', 'Apnea obstructiva del sueño', 'Lengua', 'Vía respiratoria bloqueada', '© MAYO FOUNDATION FOR MEDICAL EDUCATION AND RESEARCH. ALL RIGHTS RESERVED.'],
  },
  'm1-03': {
    title: 'Fisiología de la apnea del sueño',
    paragraphs: ['En este video profundizaremos en por qué ocurre la AOS, o apnea obstructiva del sueño.', 'En la AOS, la garganta se relaja tanto que se estrecha o se bloquea durante el sueño, lo que dificulta la respiración. Imagine succionar aire por una pajita y luego apretarla. El cerebro detecta la falta de oxígeno y le despierta lo suficiente para respirar, aunque quizá no lo recuerde. En la AOS, estas interrupciones ocurren muchas veces por noche y producen un sueño de menor calidad. Con el tiempo, esta tensión repetida estresa el cuerpo y puede reducir la calidad de vida.'],
  },
  'm1-q1': {
    title: '¿Verdadero o falso? Puede tener apnea obstructiva del sueño aunque no ronque.',
    prompt: '¿Verdadero o falso? Puede tener apnea obstructiva del sueño aunque no ronque.',
    instructions: '¿Verdadero o falso? Díganos qué piensa a continuación.',
    choices: ['Verdadero: puede tener apnea del sueño sin roncar', 'Falso: tiene que roncar para tener apnea del sueño'],
  },

  'm2-01': {
    title: '¿Cómo afecta la apnea del sueño a mi pareja?',
    paragraphs: ['En esta sección aprenderemos cómo la apnea del sueño afecta a su pareja u otras personas en la habitación, como un recién nacido, y cómo tratamientos como CPAP pueden mejorar la intimidad y la calidad de vida de ambos.'],
  },
  'm2-r1': {
    title: '¿Qué aspecto de su apnea del sueño molesta más a su pareja?',
    prompt: '¿Qué aspecto de su apnea del sueño molesta más a su pareja?',
    choices: ['Ronquidos', 'Despertares nocturnos (cualquier cosa que haga que se despierte durante la noche)', 'Cambios en el ánimo o la energía', 'Dormir en habitaciones separadas'],
  },
  'm2-03': {
    title: '¿Cómo puede CPAP mejorar la experiencia de sueño de su pareja?',
    paragraphs: ['La presión positiva continua en las vías respiratorias (CPAP) proporciona un flujo constante de aire a través de una mascarilla que mantiene abierta y estable la vía respiratoria superior, evitando las vibraciones de los tejidos que causan los ronquidos.', 'Esto reduce los sonidos durante el sueño y puede ofrecer una mejor experiencia para su pareja.'],
  },
  'm2-05': {
    title: '¿Cómo puede CPAP mejorar la intimidad? (continuación)',
    paragraphs: ['Se ha observado que CPAP puede aumentar la intimidad entre las parejas. Un estudio mostró que el 41 % de las parejas de cama informó mayor satisfacción en la relación, el 47 % no informó cambios y el 71 % dijo que su calidad del sueño mejoró.'],
  },
  'm2-04': {
    title: 'Usar CPAP mientras duerme con su pareja',
    paragraphs: ['Al principio de su experiencia con CPAP, es normal tener que adaptarse al aspecto de la máquina y a la intimidad. Algunas parejas pueden notar dificultades porque al principio CPAP parece una barrera para acercarse.', 'Sin embargo, con el tiempo las parejas se acostumbran a la máquina y han informado que recuperan o mejoran la intimidad, la calidad del sueño, el ánimo y la energía de ambos. Los estudios muestran que las personas con pareja pueden tener mejor adherencia a CPAP; contar con su pareja puede ayudar a mantenerla.', 'Para algunas parejas, CPAP puede parecer una barrera para la intimidad, pero es fundamental que una persona con apnea del sueño utilice la máquina, especialmente durante el embarazo. La apnea del sueño no tratada puede tener efectos graves para la madre y el bebé, como aprendimos en los módulos anteriores.'],
  },
  'm2-q2': {
    title: '¡Es hora de una pregunta! ¿Cuál de las siguientes afirmaciones es correcta? (seleccione todas las que correspondan).',
    prompt: '¡Es hora de una pregunta! ¿Cuál de las siguientes afirmaciones es correcta? (seleccione todas las que correspondan).',
    instructions: '¿Cuál de las siguientes afirmaciones es correcta? (seleccione todas las que correspondan).',
    choices: ['Usar CPAP al dormir con su pareja garantiza que ambos se duerman y despierten exactamente a la misma hora.', 'Usar CPAP al dormir con su pareja puede ayudar a mejorar los niveles de energía de ambos.', 'Usar CPAP una noche sí y otra no al dormir con su pareja ofrece los mismos beneficios para la pareja que usarlo todas las noches.', 'Usar CPAP al dormir con su pareja puede ayudar a que su pareja se duerma más rápido'],
  },
  'm2-q1': {
    title: '¿Verdadero o falso?',
    prompt: '¿Verdadero o falso?',
    contextParagraphs: ['Los estudios han mostrado que, aunque usar CPAP al dormir con una pareja mejora la calidad del sueño de esta, la satisfacción en la relación no cambió para ninguna de las parejas.'],
    choices: ['Verdadero', 'Falso'],
  },

  'm3-01': {
    title: 'Resultados y motivación relacionados con la AOS',
    paragraphs: ['En esta sección aprenderemos sobre algunos resultados que la AOS no tratada o tratada puede tener para usted y su bebé. Después veremos cómo mantener la motivación y el compromiso con el tratamiento de la apnea del sueño para que ambos estén lo más saludables posible.'],
  },
  'm3-q1': {
    title: '¿Verdadero o falso? (Esta pregunta es para aprender, no es una comprobación de conocimientos)',
    prompt: '¿Verdadero o falso? (Esta pregunta es para aprender, no es una comprobación de conocimientos)',
    contextParagraphs: ['Las embarazadas con AOS no tratada tienen más probabilidades de presentar enfermedades coexistentes que aumentan el riesgo de parto por cesárea.'],
    choices: ['Verdadero', 'Falso'],
  },
  'm3-q3': {
    title: 'Seleccione la respuesta correcta: (Esta pregunta es para aprender, no es una comprobación de conocimientos)',
    prompt: 'Las embarazadas con AOS no tratada durante su ingreso hospitalario para el parto tienen un riesgo significativamente mayor de:',
    instructions: 'Seleccione la respuesta correcta: (Esta pregunta es para aprender, no es una comprobación de conocimientos)',
    choices: ['resfriarse', 'tener problemas cardíacos', 'intoxicarse con alimentos', 'tener sangrado nasal'],
  },
  'm3-q4': {
    title: 'Seleccione la respuesta correcta: (Esta pregunta es para aprender, no es una comprobación de conocimientos)',
    prompt: 'Se han observado asociaciones clínicas entre las embarazadas con trastornos respiratorios del sueño (TRS) y pesos ______ de los recién nacidos.',
    instructions: 'Seleccione la respuesta correcta: (Esta pregunta es para aprender, no es una comprobación de conocimientos)',
    choices: ['anormalmente altos', 'normales', 'anormalmente bajos'],
  },
  'm3-recap': {
    title: 'Resumen',
    keyPoints: ['Espero que estas preguntas le hayan dado la oportunidad de aprender cómo la AOS puede afectar los resultados maternos y fetales o neonatales. En general, aprendimos:', '• La AOS no tratada aumenta las probabilidades de parto por cesárea', '• La AOS no tratada aumenta significativamente las probabilidades de problemas cardíacos', '• La AOS no tratada aumenta el riesgo de bajo peso al nacer'],
  },
  'm3-04': {
    title: 'Motivaciones: ¿por qué es tan importante usar una máquina PAP durante el embarazo?',
    paragraphs: ['Una máquina de presión positiva en las vías respiratorias (PAP) proporciona un flujo continuo de aire a una presión establecida que mantiene abierta la vía respiratoria y evita el colapso y los episodios de hipoxia, es decir, de bajo nivel de oxígeno, durante el sueño.', 'Esto ayuda a proteger la salud de usted y de su bebé durante y después del embarazo.'],
    sourceVisibleLabels: ['Adherencia al tratamiento con PAP para la apnea del sueño', 'Niveles de estrés bien controlados', 'Hormonas del estrés bien controladas', 'Presión arterial bien controlada', 'Glucosa en sangre bien controlada'],
  },

  'm4-01': {
    title: 'La apnea del sueño y la salud de su embarazo y su bebé',
    paragraphs: ['En este módulo aprenderemos sobre algunas complicaciones que la apnea del sueño no tratada o tratada puede causar en usted y su bebé durante el embarazo.', 'Para hacer este módulo interactivo, se le harán preguntas que le ayudarán a comprender el contenido. No se preocupe por equivocarse: estas preguntas son únicamente para aprender.'],
  },
  'm4-q1': {
    title: '¿Cuál de las siguientes afecciones puede estar asociada con la apnea del sueño durante el embarazo? ¡Dé su mejor respuesta!',
    prompt: '¿Cuál de las siguientes afecciones puede estar asociada con la apnea del sueño durante el embarazo? ¡Dé su mejor respuesta!',
    instructions: 'Pista: hay 3 respuestas correctas.',
    choices: ['Preeclampsia', 'Alergias alimentarias', 'Intolerancia a la lactosa', 'Presión arterial alta', 'Glucosa alta en sangre'],
  },
  'm4-03': {
    title: '¿Qué es la diabetes gestacional (glucosa alta en sangre durante el embarazo)?',
    paragraphs: ['Vea este video corto de YouTube de Blue Cross Blue Shield of Michigan para aprender más sobre la diabetes gestacional.'],
  },
  'm4-04': {
    title: '¿Cuáles son las complicaciones para la madre si tiene diabetes gestacional?',
    prompt: '¿Cuáles son las complicaciones para la madre si tiene diabetes gestacional?',
    instructions: 'Pista: hay 3 respuestas correctas.',
    choices: ['Asma', 'Necesitar una cesárea', 'Obesidad y diabetes tipo 2', 'Presión arterial alta y preeclampsia', 'Fracturas óseas'],
  },
  'm4-q4': {
    title: '¿Cuáles son las complicaciones para el bebé si la madre tiene diabetes gestacional?',
    prompt: '¿Cuáles son las complicaciones para el bebé si la madre tiene diabetes gestacional?',
    instructions: 'Pista: hay 3 respuestas correctas.',
    choices: ['Autismo', 'Síndrome de dificultad respiratoria (dificultad para respirar)', 'Peso excesivo al nacer', 'TDAH', 'Nacimiento prematuro o muerte fetal'],
  },
  'm4-05': {
    title: '¿Qué es la preeclampsia?',
    paragraphs: ['Vea este video corto de YouTube de Blue Cross Blue Shield of Michigan para aprender más sobre la preeclampsia.'],
  },
  'm4-06': {
    title: '¿Qué es la preeclampsia? (continuación)',
    paragraphs: ['Además de la información mencionada en el video, es importante señalar que la preeclampsia puede causar daño a órganos, no solo problemas cardíacos.', '• La preeclampsia puede causar presión arterial muy alta y daño renal, por lo que algunas mujeres tienen exceso de proteína en la orina, una señal de que los riñones no funcionan correctamente.', '• La preeclampsia también puede dañar el hígado, el cerebro y las plaquetas, que son células sanguíneas que permiten la coagulación.', 'Por último, la preeclampsia puede alterar el flujo de sangre hacia la placenta y causar una afección llamada restricción del crecimiento fetal. Esto ocurre cuando el bebé no recibe suficientes nutrientes a través de la placenta para crecer adecuadamente y termina siendo más pequeño de lo esperado para su edad gestacional.'],
  },
  'm4-q6': {
    title: '¿Cuáles son las complicaciones para la madre o el bebé si la madre tiene preeclampsia?',
    prompt: '¿Cuáles son las complicaciones para la madre o el bebé si la madre tiene preeclampsia?',
    instructions: 'Pista: hay 2 respuestas correctas.',
    choices: ['Codo de tenista', 'Problemas cardíacos graves', 'Pie de atleta', 'Restricción del crecimiento fetal', 'Caries'],
  },
  'm4-recap': {
    title: '¡Hagamos un resumen!',
    keyPoints: ['¡Hagamos un resumen de lo que aprendimos! Este diagrama resume las distintas afecciones con las que la apnea del sueño puede estar asociada.'],
    sourceVisibleLabels: ['Apnea del sueño no tratada', '↑ niveles de estrés,', '↑ hormonas del estrés', '↑ presión arterial', 'Preeclampsia', 'Restricción del crecimiento fetal', 'Problemas cardíacos graves (enfermedad cardíaca, insuficiencia cardíaca)', '↑ resistencia a la insulina', '↑ glucosa en sangre', 'diabetes gestacional', 'Necesitar una cesárea', 'Obesidad, diabetes tipo 2', 'Síndrome de dificultad respiratoria (dificultad para respirar)', 'Peso excesivo al nacer', 'Nacimiento prematuro o muerte fetal'],
  },

  'm5-01': {
    title: 'Higiene saludable del sueño',
    paragraphs: ['En este módulo aprenderemos sobre intervenciones de estilo de vida y cambios de conducta que puede incorporar a su vida diaria para mejorar su sueño en general.', 'Para hacer este módulo interactivo, se le harán preguntas que le ayudarán a comprender el contenido. No se preocupe por equivocarse: estas preguntas son únicamente para aprender.'],
  },
  'm5-02': {
    title: '¿Por qué es tan importante dormir bien durante el embarazo?',
    paragraphs: ['Dormir bien durante el embarazo ofrece importantes beneficios de salud para usted y para su bebé en crecimiento.', 'Algunos de los beneficios más importantes para usted incluyen:', '• Menor riesgo de enfermedades crónicas (diabetes, presión arterial alta y colesterol alto)', '• Mejor estado de ánimo y salud mental', '• Menos cansancio durante el día y más energía', 'Dormir bien también es importante durante el embarazo porque dormir mal se relaciona con resultados desfavorables del embarazo.', 'A continuación hablaremos sobre qué es la higiene del sueño y cómo podemos usarla para mejorar nuestro sueño.'],
  },
  'm5-03': {
    title: '¿Qué es la higiene del sueño?',
    paragraphs: ['La higiene del sueño es un conjunto de hábitos saludables, conductas y factores ambientales que favorecen un sueño constante y de calidad, ayudan a dormirse más rápido y permiten permanecer dormido por más tiempo.', 'En este módulo revisaremos estos elementos de la higiene del sueño:', '• Establecer una buena rutina de sueño', '• Abordar la dificultad para conciliar el sueño', '• La importancia de la luz, el sol y la oscuridad', '• Crear un buen ambiente para dormir', '• La cafeína', '• La importancia de la alimentación y la nutrición', '• La importancia de hacer ejercicio con regularidad', '• Abordar las siestas', '• Manejar el estrés para dormir', '• La postura al dormir'],
  },
  'm5-q5': {
    title: 'Comprobación de conocimientos 1: los problemas de dormir mal',
    prompt: '¿Cuáles son algunas consecuencias de dormir mal?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Dormir mal fortalecerá su sistema inmunitario', 'Mayor riesgo de depresión y síntomas de ánimo más intensos', 'Será más bajo de estatura', 'Dormir mal no es tan grave: tiene muy pocas consecuencias', 'Mayor riesgo de enfermedades crónicas (diabetes, presión arterial alta y colesterol alto)', 'Mayor probabilidad de cansancio y falta de energía durante el día'],
  },
  'm5-q6': {
    title: 'Comprobación de conocimientos 2: los problemas de dormir mal durante el embarazo',
    prompt: '¿Cuáles son algunas consecuencias de dormir mal durante el embarazo?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Mayor probabilidad de necesitar una cesárea', 'El trabajo de parto se detendrá por completo', 'El color de ojos de su bebé podría cambiar', 'Es más probable que el bebé sea nocturno', 'Mayor probabilidad de trabajos de parto más largos', 'Mayor riesgo de nacimiento prematuro'],
  },
  'm5-04': {
    title: 'Establecer una buena rutina de sueño, parte 1: rutina para acostarse',
    paragraphs: ['Establecer una buena rutina de sueño es una de las modificaciones de estilo de vida más importantes para mejorar el sueño, el estado de ánimo y la energía diaria. Revisaremos tres componentes de una buena rutina.', 'El primer componente es establecer una rutina relajante aproximadamente una hora antes de acostarse.', 'Puede incluir leer algo ligero y relativamente aburrido, estirarse o tomar un baño tibio. Escuchar música tranquila y bajar las luces también son buenas prácticas. Tener una rutina de sueño indica al cerebro y al cuerpo que es hora de relajarse, lo que reduce el estrés y la ansiedad y puede mejorar la calidad del sueño e incluso la función cognitiva.'],
  },
  'm5-13': {
    title: 'Establecer una buena rutina de sueño, parte 2: horarios de sueño y vigilia',
    paragraphs: ['El segundo componente de una buena rutina de sueño es mantener horarios similares para acostarse y levantarse.', 'Levántese aproximadamente a la misma hora cada mañana y acuéstese aproximadamente a la misma hora cada noche, incluso si la noche anterior no durmió bien. Esto ancla el reloj interno del cuerpo, o ritmo circadiano, y puede ayudarle a tener más sueño por la noche.', 'Esto es especialmente importante los fines de semana. Puede ser tentador dormir hasta tarde, pero cambiar el horario de sueño de un lado a otro, lo que se conoce como desfase horario social, se parece a cruzar zonas horarias cada semana. Si se siente cansado durante la semana, puede ser una señal de que necesita mejorar su sueño en general.'],
  },
  'm5-05': {
    title: 'Establecer una buena rutina de sueño, parte 3: evitar la luz azul cerca de la hora de acostarse',
    paragraphs: ['El tercer componente de una buena rutina de sueño es evitar la luz azul antes de acostarse.', 'La luz azul, y la luz brillante en general, inhibe la producción de melatonina, la sustancia que produce sueño. Esto es útil por la mañana, cuando quiere despertarse, pero perjudicial por la noche, cuando quiere sentir sueño. Muchos dispositivos electrónicos emiten mucha luz azul, por lo que usar el teléfono antes de acostarse puede perjudicar el sueño.', 'Estos cambios en su rutina pueden ayudarle a sentir más sueño por la noche y mejorar la calidad del sueño:', '• Mantenga la iluminación del hogar al mínimo antes de acostarse. Baje las luces y, cuando necesite luz, utilice tonos más cálidos, como naranja o rojo.', '• Utilice el modo nocturno o filtros de color del teléfono y reduzca el brillo. Lo mejor sería no usar dispositivos cerca de la hora de acostarse. El modo nocturno reduce la luz azul y un filtro rojo puede eliminarla por completo.'],
  },
  'm5-q7': {
    title: 'Comprobación de conocimientos 3: componentes de la higiene del sueño',
    prompt: '¿Qué 3 actividades puede incorporar a su vida para ayudar a mejorar el sueño?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Hacer ejercicio con regularidad cada semana', 'Comer una comida abundante antes de acostarse', 'Tomar una siesta larga durante el día', 'Comer alimentos nutritivos cada semana', 'Tomar el sol por la mañana y durante el día', 'Tomar cafeína antes de acostarse para despertarse descansado'],
  },
  'm5-11': {
    title: 'Abordar la dificultad para conciliar el sueño',
    paragraphs: ['¿Qué debe hacer si le cuesta conciliar el sueño?', 'La dificultad para conciliar el sueño puede aparecer durante el embarazo. Si dura más de 20 minutos, lo mejor es levantarse, ir a otra habitación y hacer una actividad tranquila y relajante con poca luz, como leer, escuchar música tranquila o meditar. Conviene asociar la cama con dormir; salir del dormitorio cuando no tiene sueño ayuda a mantener esa asociación. Regrese a la cama solo cuando tenga sueño.', 'Lo que NO debe hacer si le cuesta conciliar el sueño es usar dispositivos electrónicos. Estos pueden indicarle al cerebro que permanezca despierto por más tiempo.', 'NO haga actividades estimulantes, como leer un libro de suspenso o escuchar música alta.', 'NO encienda luces brillantes en mitad de la noche, ya que pueden dificultar volver a dormir.', 'NO revise la hora, porque esto puede aumentar la ansiedad y la frustración relacionadas con el sueño.'],
  },
  'm5-q1': {
    title: 'Comprobación de conocimientos 4: rutina de sueño',
    prompt: '¿Cuáles son los 3 componentes importantes que puede aplicar para mejorar su rutina de sueño?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Evitar la luz azul por la noche y usar tonos más cálidos', 'Establecer una rutina constante para acostarse', 'Dormirse y despertarse a las mismas horas del día', 'Desplazarse por el teléfono antes de acostarse para ayudarse a dormir', 'Ver su programa favorito cerca de la hora de acostarse', 'Dormir un par de horas más los fines de semana para “recuperar” el sueño'],
  },
  'm5-14': {
    title: 'La importancia de la luz solar',
    paragraphs: ['¡Salga a la luz del sol!', 'La luz natural, especialmente por la mañana, favorece un sueño de calidad por la noche porque ayuda a ajustar el reloj interno del cuerpo, o ritmo circadiano. Esto le hace estar más despierto y alerta durante el día y sentir sueño de forma natural cuando llega la hora de acostarse.', 'Puede dar un paseo corto por la mañana o simplemente abrir las ventanas para que entre la luz del sol en casa.'],
  },
  'm5-q4': {
    title: 'Comprobación de conocimientos 5: dificultad para conciliar el sueño',
    prompt: '¿Qué debe hacer si le cuesta conciliar el sueño por la noche?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Hacer una actividad tranquila y relajante con poca luz', 'Levantarse de la cama e ir a otra habitación', 'Revisar la hora y calcular cuánto sueño está perdiendo', 'Leer las noticias en el teléfono hasta tener sueño', 'Quedarse en la cama completamente quieto hasta dormirse', 'Volver a la cama cuando tenga sueño'],
  },
  'm5-06': {
    title: 'Establecer un buen ambiente para dormir',
    paragraphs: ['¿Cómo creo un ambiente óptimo para dormir?', 'En este módulo revisaremos 4 componentes importantes de un ambiente óptimo para dormir.', 'El primer componente es reservar el dormitorio únicamente para dormir o tener relaciones sexuales.', '• Esto se llama control de estímulos: se vuelve a entrenar al cerebro para asociar el dormitorio con el sueño y no con el trabajo, el estrés, desplazarse por el teléfono o estar despierto. Es una estrategia bien respaldada, especialmente para las personas con insomnio.'],
  },
  'm5-15': {
    title: 'Establecer un buen ambiente para dormir',
    paragraphs: ['El segundo componente de un ambiente óptimo para dormir es eliminar las molestias por ruido.', '• Los ruidos irregulares y no constantes pueden dificultar conciliar el sueño y reducir su calidad, incluso mientras está inconsciente. Busque formas de eliminar ruidos de autos, aviones o pasillos, y considere usar tapones para los oídos o una máquina de ruido blanco para cubrirlos.'],
  },
  'm5-16': {
    title: 'Establecer un buen ambiente para dormir',
    paragraphs: ['El tercer componente de un ambiente óptimo para dormir es mantener el dormitorio lo más oscuro posible.', '• Incluso pequeñas fuentes de luz pueden alterar el sueño. Considere cortinas opacas o un antifaz para eliminar la estimulación visual.', '• También intente mantener bastante tenue la iluminación del hogar por la noche. La luz brillante antes de acostarse puede reducir la calidad del sueño porque indica al cuerpo que debe estar despierto.', '• En algunas zonas, dejar una luz encendida puede hacer que la casa parezca ocupada y ayudar a disuadir robos. En ese caso, puede ser mejor dejar encendidas luces fuera del dormitorio, como la del porche o el pasillo.', '• Es común necesitar luz para ir al baño. Una luz tenue y cálida cerca del suelo, como una tira de luces LED, puede mantener oscuro el dormitorio y permitir desplazarse con seguridad.'],
  },
  'm5-17': {
    title: 'Establecer un buen ambiente para dormir',
    paragraphs: ['El cuarto componente de un ambiente óptimo para dormir es mantener el dormitorio fresco, alrededor de 65 °F.', '• La temperatura corporal baja de forma natural durante el sueño y un ambiente fresco favorece ese cambio.', '• Esto es especialmente útil durante el embarazo, porque el aumento de hormonas, volumen sanguíneo y metabolismo puede elevar mucho la temperatura corporal y causar sofocos o sudores nocturnos. Un cuarto fresco permite que el cuerpo se enfríe de forma eficaz.'],
  },
  'm5-07': {
    title: 'Cafeína',
    paragraphs: ['Para las mujeres en las primeras etapas del embarazo, consumir hasta 200 mg de cafeína, aproximadamente una taza de café de 12 onzas, al menos 8 a 10 horas antes de acostarse suele considerarse seguro. Consumir cafeína al menos 90 minutos después de despertarse también puede prevenir el bajón de cafeína de la tarde.', 'En las últimas etapas del embarazo, el cuerpo puede tardar más en procesar la cafeína; si la consume, hágalo lo más temprano posible.', 'En general, como el metabolismo de la cafeína varía mucho entre las embarazadas, muchos investigadores sugieren que lo más seguro es reducir su consumo tanto como sea posible.'],
  },
  'm5-q2': {
    title: 'Comprobación de conocimientos 7: ambiente para dormir',
    prompt: '¿Cuáles son 3 componentes importantes que puede aplicar para mejorar su ambiente para dormir?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Mantener un reloj digital brillante frente a la cama para poder mirar la hora', 'Eliminar toda estimulación visual', 'Dormir con música aleatoria toda la noche', 'Mantener el dormitorio a una temperatura fresca (60–68 °F)', 'Eliminar todas las molestias por ruido', 'Mantener el dormitorio a una temperatura cálida (75–82 °F)'],
  },
  'm5-08': {
    title: 'Crononutrición (horario de las comidas para dormir)',
    paragraphs: ['La crononutrición se refiere a cómo el horario de las comidas puede afectar el sueño y el ritmo circadiano. Veamos algunos de los mejores consejos de crononutrición.', 'Concentre las calorías y la hidratación más temprano en el día: “Desayune como rey, almuerce como príncipe y cene como mendigo”.', '• El cuerpo procesa mejor los alimentos más temprano en el día, cuando es más probable que se usen como combustible en lugar de almacenarse como grasa.', '• El cuerpo también se siente más lleno después de la misma comida si se consume más temprano, debido a una mejor señalización hormonal y al metabolismo. Un desayuno abundante y adelantar el almuerzo y la cena puede ayudarle a sentirse más lleno y tener menos antojos por la noche.', '• Considere almorzar y cenar más temprano y terminar la última comida 4 a 5 horas antes de acostarse para favorecer el sueño y la salud general.', '• Hidratarse temprano ayuda a evitar tener que orinar por la noche. Esto es más común durante el embarazo porque el bebé puede comprimir la vejiga y el volumen sanguíneo general es mayor.', 'Intente evitar las comidas abundantes al menos 3 a 4 horas antes de acostarse.', '• Esto evita que el cuerpo tenga que digerir activamente los alimentos mientras intenta dormir, lo que puede reducir la calidad del sueño.', '• Posiblemente sea aún mejor terminar la última comida más lejos de la hora de acostarse, 5 horas o más, porque la frecuencia cardíaca en reposo bajará, un indicador importante de la calidad del sueño.'],
  },
  'm5-18': {
    title: 'La importancia de la nutrición',
    paragraphs: ['Una alimentación nutritiva, especialmente rica en frutas, verduras, proteínas magras y cereales integrales, se relaciona de forma constante con un sueño más profundo y continuo. Esto se debe a que las vitaminas, los minerales y la fibra de estos alimentos reducen las variaciones de glucosa durante la noche y favorecen procesos relacionados con la relajación y la regulación del sueño.'],
  },
  'm5-q8': {
    title: 'Comprobación de conocimientos 9: crononutrición',
    prompt: '¿Qué 3 consejos nutricionales puede seguir que cuentan con respaldo de la evidencia actual sobre crononutrición?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Desayune como mendigo, almuerce como príncipe y cene como rey.', 'Hidratarse más temprano durante el día puede ayudar a reducir la nicturia (orinar en mitad de la noche).', 'Terminar la última comida más cerca de la hora de acostarse puede mejorar el sueño al reducir la frecuencia cardíaca en reposo.', 'Comer más temprano puede empeorar los antojos nocturnos al reducir las hormonas de saciedad.', 'Desayune como rey, almuerce como príncipe y cene como mendigo.', 'El cuerpo procesa mejor los alimentos más temprano, desde el punto de vista metabólico, hormonal y de la sensación de saciedad.'],
  },
  'm5-21': {
    title: 'La importancia del ejercicio regular',
    paragraphs: ['El ejercicio regular es una forma eficaz de mejorar el sueño. Libera energía, puede hacerle sentir más cansado por la noche y ayuda a aliviar la tensión mental.', 'Idealmente, intente hacer al menos 150 minutos por semana de actividad aeróbica de intensidad moderada, como caminar o nadar, y 2 sesiones semanales de entrenamiento de resistencia. Evite el ejercicio intenso justo antes de acostarse.', 'Si es nuevo en el ejercicio, comience despacio y aumente la actividad gradualmente. Puede añadir unos minutos cada día hasta mantenerse activo durante 20 a 30 minutos.', 'Aquí hay un enlace a la página del American College of Obstetricians and Gynecologists sobre el ejercicio durante el embarazo.'],
  },
  'm5-10': {
    title: 'Abordar las siestas',
    paragraphs: ['Si le cuesta conciliar el sueño por la noche, evite las siestas durante las 6 horas anteriores a la hora de acostarse. Las siestas de la tarde o la noche pueden hacer que tenga menos sueño al llegar la hora de dormir.', 'Durante el embarazo es completamente normal sentirse más cansada durante el día y necesitar siestas. Si necesita dormir la siesta, intente limitarla a 20 minutos antes de la tarde. Las siestas largas pueden alterar el sueño nocturno.'],
  },
  'm5-19': {
    title: 'Manejo del estrés para dormir',
    paragraphs: ['El estrés puede reducir la calidad del sueño porque mantiene crónicamente al cuerpo en un estado de alerta de “lucha o huida”, lo que dificulta dormir y hace que el sueño sea menos reparador.', 'Si tiene problemas constantes de estrés o ansiedad, o si el sueño o la ansiedad le impiden realizar sus actividades normales, hable con su profesional de salud sobre opciones para abordarlos.', 'Las opciones pueden incluir:', '• Terapia', '• Medicamentos', '• Ejercicios de meditación o atención plena'],
  },
  'm5-20': {
    title: 'Postura al dormir',
    paragraphs: ['Después de las 28 semanas, intente dormir de lado tanto como sea posible.', 'Después de las 28 semanas, dormir boca arriba puede hacer que el útero presione vasos sanguíneos importantes y reduzca el flujo de sangre, lo que podría ser perjudicial para usted y su bebé.', 'Al dormir, considere mantener una o ambas rodillas flexionadas, colocar una almohada entre las rodillas o debajo del abdomen, o usar una almohada corporal de cuerpo entero.', 'Esto puede mejorar la comodidad al dormir de lado y apoyar las caderas, la espalda y la pelvis.'],
  },
  'm5-q10': {
    title: 'Comprobación de conocimientos 12: siestas y postura al dormir',
    prompt: '¿Qué 3 consejos puede aplicar sobre las siestas y la postura al dormir?',
    instructions: 'Comprobemos rápidamente sus conocimientos. Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Intente usar almohadas entre las rodillas flexionadas o una almohada corporal de cuerpo entero para mayor comodidad y apoyo.', 'Dormir boca arriba después de las 28 semanas puede mejorar los resultados de salud al mantener al bebé relativamente elevado.', 'Si necesita una siesta, considere dormirla más tarde y durante al menos 30 minutos.', 'Si necesita una siesta, tómela más temprano y limítela a unos 20 minutos.', 'Evite usar almohadas porque pueden llenar demasiado el dormitorio.', 'Intente dormir de lado si ya pasó las 28 semanas de embarazo.'],
  },
  'm5-recap': {
    title: 'Resumen final',
    prompt: '¿Qué prácticas de higiene del sueño aprendió y se siente capaz de incorporar a su rutina?',
    instructions: 'Esta pregunta es muy abierta y busca que piense en pasos que puede tomar para mejorar su sueño.',
    contextParagraphs: ['¡Felicidades por completar este módulo de higiene saludable del sueño! Ha aprendido algunos de los mejores hábitos e intervenciones para mejorar el sueño y obtener beneficios para usted y su bebé.', 'Esta es la lista de prácticas de higiene del sueño que revisamos:', '• Tener una rutina de sueño', '    • Actividades relajantes antes de acostarse', '    • Horarios constantes para dormir y despertarse', '    • Limitar la luz azul', '• Hacer una actividad relajante si le cuesta dormir', '• Recibir luz solar por la mañana y oscuridad por la noche', '• Crear un buen ambiente para dormir', '    • Usar el dormitorio solo para dormir o tener relaciones sexuales', '    • Eliminar las molestias por ruido', '    • Eliminar las molestias visuales', '    • Mantener fresco el dormitorio (aproximadamente 65 °F)', '• No consumir cafeína cerca de la hora de acostarse o no consumirla en absoluto', '• Comer de forma equilibrada, comer más temprano y evitar comer tarde por la noche', '• Hacer ejercicio con regularidad', '• Evitar siestas largas y dormir la siesta temprano si es necesario', '• Buscar tratamiento médico para el estrés crónico', '• Dormir de lado y usar almohadas para mayor comodidad y apoyo'],
  },

  'm6-01': {
    title: 'Comorbilidades del embarazo y PAP',
    paragraphs: ['En este módulo aprenderemos sobre los síntomas y afecciones más comunes durante el embarazo que pueden complicar la apnea del sueño y el uso de PAP, y sobre cómo tratarlos. Revisaremos:', '• Congestión nasal', '• ERGE', '• Ansiedad', 'Para hacer este módulo interactivo, se le harán preguntas que le ayudarán a comprender el contenido. No se preocupe por equivocarse: estas preguntas son únicamente para aprender.', 'La imagen muestra a una mujer sonándose la nariz, a otra que se sostiene el pecho y parece incómoda, y a una tercera que se sostiene la cabeza y parece preocupada y ansiosa.'],
  },
  'm6-02': {
    title: 'Congestión nasal',
    paragraphs: ['Antecedentes', 'La congestión nasal por rinitis del embarazo, es decir, inflamación nasal, es muy común; algunas revisiones la encuentran hasta en el 42 % de los embarazos. También es común que empeore más adelante en el embarazo.', 'Causas y complicaciones', 'Los cambios en los líquidos corporales y las hormonas del embarazo, como el estrógeno y la progesterona, pueden hinchar el revestimiento de la nariz. Esto dificulta respirar por la nariz y puede causar congestión. La congestión nasal puede alterar el sueño y, como la nariz forma parte de la vía respiratoria, aumentar los ronquidos y empeorar la apnea del sueño. Abordarla puede ayudar a respirar durante el sueño.', 'La congestión nasal también puede afectar la tolerancia a la mascarilla de CPAP. Como el dispositivo proporciona aire por la mascarilla, ya sea nasal, facial completa o con almohadillas nasales, la congestión suele hacer que CPAP sea más incómodo y puede aumentar las fugas por la boca. Sin embargo, esto puede abordarse para mejorar la comodidad.'],
  },
  'm6-03': {
    title: 'Tratamiento de la congestión nasal',
    paragraphs: ['Al usar PAP, considere activar el calor o los elementos humidificadores para ayudar a prevenir la sequedad y la irritación nasal durante el sueño.', 'Además, los aerosoles nasales son una solución de bajo riesgo para la congestión. Considere comenzar con un aerosol de solución salina simple antes de acostarse. La solución salina en aerosol o espuma se puede comprar sin receta, ayuda a reducir la congestión y es segura durante el embarazo.', 'Si los síntomas persisten, pueden considerarse aerosoles nasales de esteroides, como fluticasona o budesonida, que pueden comprarse sin receta. También se consideran seguros durante el embarazo. Los posibles efectos secundarios, como sequedad nasal, escozor o ardor, irritación de garganta o sangrado nasal, suelen ser leves.', 'Al usar un aerosol nasal, después de colocarlo dentro de la nariz, dirija la punta hacia afuera, en dirección a los ojos, y no directamente hacia arriba, para llegar al revestimiento externo.', 'Si la congestión se relaciona con un resfriado o una infección respiratoria, puede usar un descongestionante tópico como Afrin, pero evite utilizarlo durante más de 2 o 3 días. Utilizarlo por más tiempo puede causar congestión de rebote y empeorar los síntomas.'],
  },
  'm6-04': {
    title: 'Enfermedad por reflujo gastroesofágico (ERGE)',
    paragraphs: ['Antecedentes', 'Los síntomas de ERGE, como la acidez, son muy comunes durante el embarazo; los estudios informan una frecuencia del 30 al 80 %. Esta afección también suele empeorar más adelante en el embarazo.', 'Causas y complicaciones', 'El embarazo puede relajar el tono del esfínter esofágico inferior, el músculo que normalmente mantiene el contenido del estómago dentro del estómago. Esto aumenta la probabilidad de que el contenido y el ácido del estómago regresen al esófago. Puede causar acidez, regurgitación, sabor agrio en la boca o náuseas.', 'La AOS y la ERGE pueden empeorar por separado la calidad del sueño. Además, la AOS puede empeorar la ERGE: al intentar inhalar con la vía respiratoria bloqueada, una presión negativa parecida a la succión puede llevar el contenido del estómago hacia el esófago.'],
  },
  'm6-q1': {
    title: 'Comprobación de conocimientos 1:',
    prompt: '¿Cuáles son las formas recomendadas de tratar la congestión nasal durante el embarazo?',
    instructions: 'Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Usar los elementos de calor o humidificación de la máquina PAP', 'Usar un aerosol de solución salina simple antes de acostarse', 'Usar aerosoles nasales de esteroides sin receta, como fluticasona o budesonida', 'Usar aerosoles nasales y dirigirlos directamente hacia arriba de la fosa nasal', 'Considerar usar Afrin todas las noches', 'Tomar antibióticos orales'],
  },
  'm6-07': {
    title: 'Tratamiento de la enfermedad por reflujo gastroesofágico (ERGE)',
    paragraphs: ['Los tratamientos iniciales para la ERGE y la acidez suelen ser cambios en la alimentación y ajustes de la cama, como:', '• comidas más pequeñas y con menos grasa', '• menos cafeína, por ejemplo en café, té, refrescos y bebidas energéticas', '• terminar la última comida 3 o 4 horas antes de acostarse', '• evitar alimentos desencadenantes comunes, como frituras grasas, comidas picantes, tomate, cítricos o bebidas carbonatadas', '• elevar la cabecera de la cama 6 a 10 pulgadas; puede usar una almohada en cuña o colocar libros bajo las patas de la cabecera. Elevar solo la cabeza con almohadas no necesariamente cambia la posición del estómago.', '• dormir sobre el lado izquierdo', '• antiácidos', 'Si las modificaciones del estilo de vida no son suficientes, durante el embarazo pueden considerarse medicamentos para reducir el ácido, como bloqueadores H2, entre ellos famotidina, nizatidina o cimetidina, o inhibidores de la bomba de protones, como omeprazol. En general, estos medicamentos se consideran seguros y la literatura indica que no causan defectos de nacimiento, pero consulte a su médico antes de comenzar a usarlos.'],
  },
  'm6-05': {
    title: 'Ansiedad',
    paragraphs: ['Antecedentes', 'Los síntomas de ansiedad durante el embarazo son muy comunes; los estudios informan que aproximadamente el 20 % de las embarazadas cumple los criterios de un trastorno de ansiedad y que las tasas son mayores cuando se consideran los síntomas.', 'Causas y complicaciones', 'El embarazo produce cambios físicos, hormonales y emocionales rápidos, además de incertidumbre sobre el futuro, lo que puede aumentar el estrés. Estos factores, junto con el empeoramiento del sueño por la AOS no tratada, pueden elevar los niveles de ansiedad.', 'En relación con PAP, la ansiedad puede aumentar la sensación de claustrofobia causada por la mascarilla y hacer que algunas personas se la quiten durante la noche o la usen menos. Algunas estrategias para acostumbrarse incluyen probar distintos estilos de mascarilla, practicar su uso estando despierto, usar respiración de relajación o ajustar la humidificación y la función de aumento gradual de la presión.'],
  },
  'm6-q2': {
    title: 'Comprobación de conocimientos 2: tratamientos para la ERGE',
    prompt: '¿Cuáles son las formas recomendadas de tratar la ERGE durante el embarazo?',
    instructions: 'Seleccione todas las opciones que correspondan. (Pista: hay 4 respuestas correctas.)',
    choices: ['Comer comidas más pequeñas con poca grasa', 'Reducir el consumo de cafeína', 'Elevar la cabecera de la cama', 'Dormir principalmente sobre el lado izquierdo', 'Tomar antiácidos antes de probar cambios en el estilo de vida', 'Dormir boca abajo'],
  },
  'm6-08': {
    title: 'Tratamiento de la ansiedad',
    paragraphs: ['Algunas modificaciones del estilo de vida que pueden aliviar la ansiedad incluyen incorporar actividad física, como caminar, llevar una alimentación saludable, dormir bien y limitar la cafeína y el alcohol.', 'Otros tratamientos pueden incluir educación, asesoramiento o terapia cognitivo-conductual (TCC). Consulte a su médico si estas opciones no funcionan para que pueda considerar medicamentos si fueran necesarios.'],
  },
  'm6-q3': {
    title: 'Comprobación de conocimientos 3: tratamientos para la ansiedad',
    prompt: '¿Cuáles son las formas recomendadas de tratar la ansiedad durante el embarazo?',
    instructions: 'Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Mejorar el sueño, la alimentación y el ejercicio', 'Reducir el consumo de cafeína y alcohol', 'Asesoramiento y terapia cognitivo-conductual', 'Pedir inmediatamente al médico una receta de un ISRS', 'Ignorarla y esperar que desaparezca', 'Fumar marihuana para calmarse'],
  },

  'm7-01': {
    title: 'Intimidad',
    paragraphs: ['En este módulo aprenderemos qué es la intimidad y cómo se relaciona con la AOS y el uso de PAP.'],
  },
  'm7-02': {
    title: '¿Qué es la intimidad?',
    paragraphs: ['“La intimidad en una relación es un sentimiento de cercanía y de conexión y apoyo emocional.”', 'La intimidad no se refiere únicamente a las relaciones sexuales. También puede incluir conversaciones significativas con su pareja, pasar tiempo de calidad, acurrucarse, tocarse o expresar sus emociones.'],
  },
  'm7-03': {
    title: '¿Cómo afecta la apnea del sueño a mi pareja?',
    paragraphs: ['El tratamiento con PAP no debería impedirle tener intimidad o relaciones sexuales.', '• Es importante mantener la adherencia al tratamiento: úselo cada vez que duerma, pero no es necesario llevarlo cuando está activo o despierto.', 'Dicho esto, es importante hablar con su pareja de cama sobre por qué es importante mantener la adherencia al tratamiento con PAP.', 'Es común pensar que CPAP puede afectar negativamente a la pareja o que a esta no le gustará verle con la máquina, pero los estudios muestran que el 90 % de las parejas de cama estaba satisfecha con el tratamiento y que el 75 % lo recomendaría a otras personas.'],
  },
  'm7-04': {
    title: 'Comprobación de conocimientos 1:',
    prompt: '¿Cuándo se recomienda usar la mascarilla de PAP?',
    instructions: 'Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Cuando planea quedarse dormido', 'Cuando tiene intimidad con su pareja', 'Durante las siestas', 'Si cree que podría quedarse dormido mientras descansa en la cama con su pareja', 'Solo si su pareja dice que ronca fuerte', 'Durante la actividad sexual'],
  },
  'm7-05': {
    title: 'Consejos para la intimidad con apnea del sueño',
    paragraphs: ['Vivir la intimidad con apnea del sueño puede ser complicado. Estas son algunas cosas útiles que debe saber:', '• No tiene que usar la mascarilla si no está durmiendo. Puede quitársela durante los momentos de intimidad.', '• Si se acurruca mientras duerme, ser “la cucharita pequeña” puede evitar que la mascarilla estorbe a su pareja.', '• Hablar con un ser querido o con su pareja puede ayudar mucho a abordar sus pensamientos y preocupaciones.'],
  },
  'm7-06': {
    title: '¿Cómo afecta la apnea del sueño a mi vida sexual?',
    paragraphs: ['Durante el embarazo es completamente normal que el deseo sexual cambie debido a cambios corporales, molestias, estrés o cansancio.', 'La apnea del sueño puede reducir el deseo sexual. Esto ocurre principalmente porque empeora la calidad del sueño, lo que puede producir:', '• Menos energía y deseo', '• Alteraciones hormonales', '• Más estrés, ansiedad o depresión', '• Menor flujo sanguíneo', 'Al usar CPAP, es normal que algunas personas tengan una percepción negativa de su imagen corporal, lo que a veces puede reducir el deseo sexual.', 'Sin embargo, CPAP desempeña un papel importante en la mejora de la calidad del sueño en personas con AOS, lo que puede ayudar a recuperar la energía, el deseo y el flujo sanguíneo y reducir el estrés o la ansiedad.'],
  },
  'm7-q2': {
    title: 'Comprobación de conocimientos 1:',
    prompt: '¿Qué afirmaciones describen correctamente cómo el embarazo, la apnea obstructiva del sueño y CPAP pueden afectar el deseo sexual?',
    instructions: 'Seleccione todas las opciones que correspondan. (Pista: hay 3 respuestas correctas.)',
    choices: ['Durante el embarazo, el deseo sexual puede cambiar normalmente debido a cambios corporales, molestias, estrés o cansancio.', 'La apnea del sueño puede reducir el deseo sexual al empeorar la calidad del sueño, lo que puede disminuir la energía y el deseo.', 'CPAP siempre aumenta inmediatamente el deseo sexual y nunca afecta la imagen corporal.', 'Un cambio en el deseo sexual durante el embarazo siempre significa que algo está médicamente mal.', 'CPAP puede mejorar la calidad del sueño, lo que puede ayudar a recuperar la energía, el deseo y el flujo sanguíneo y reducir el estrés o la ansiedad.', 'La apnea del sueño afecta el deseo sexual únicamente por la imagen corporal, no por la calidad del sueño, las hormonas, el ánimo o el flujo sanguíneo.'],
  },
};
