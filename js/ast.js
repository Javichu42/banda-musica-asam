/* Traducción de la web al asturiano.
   - "exacto": cada texto en castellano (tal cual aparece en la web) y su versión en asturiano.
   - "prefijos": comienzos de texto que se traducen y el resto se traduce aparte (p. ej. "Foto de " + nombre).
   - "reglas": textos con partes que cambian (números, cuotas…).
   Si un texto no está aquí, se muestra en castellano. Los textos que se escriben desde
   Administración (noticias nuevas, eventos…) solo se traducen si se añaden a esta lista. */
window.ASAM_AST = {
  meses: ["xineru", "febreru", "marzu", "abril", "mayu", "xunu", "xunetu", "agostu", "setiembre", "ochobre", "payares", "avientu"],
  mesesCorto: ["xin", "feb", "mar", "abr", "may", "xun", "xnt", "ago", "set", "och", "pay", "avi"],

  exacto: {
    /* Cabecera y menú */
    "Inicio": "Aniciu",
    "Quiénes somos": "Quién somos",
    "Dirección": "Direición",
    "Noticias": "Noticies",
    "Contacto": "Contautu",
    "Hazte socio": "Faite sociu",
    "Administración": "Alministración",
    "Páginas": "Páxines",
    "Logotipo ASAM": "Logotipu ASAM",
    "Ver la web en asturiano": "Ver la web n'asturianu",
    "Ver la web en castellano": "Ver la web en castellanu",
    "Más información abajo": "Más información embaxo",
    "Actuaciones y noticias": "Actuaciones y noticies",
    "Acceso privado": "Accesu priváu",
    "Área de músicos y administración": "Área de músicos y alministración",
    "Entra con tu usuario o tu correo y tu contraseña.": "Entra col to usuariu o col to corréu y cola to contraseña.",
    "Convocatorias, asistencia, partituras y anuncios.": "Convocatories, asistencia, partitures y anuncios.",
    "Edita los contenidos de la web, las cuentas y los administradores.": "Edita los conteníos de la web, les cuentes y los alministradores.",
    "Correo o nombre de usuario": "Corréu o nome d'usuariu",
    "Cerrar sesión": "Zarrar sesión",

    /* Inicio */
    "La Asociación Sierense Amigos de la Música es una entidad sin ánimo de lucro que enseña, toca y comparte música en el concejo. Conciertos gratuitos, pasacalles en las fiestas y clases para todas las edades.":
      "L'Asociación Sierense Amigos de la Música ye una entidá ensin ánimu de llucru qu'enseña, toca y comparte música nel conceyu. Conciertos de baldre, pasacais nes fiestes y clases pa toles edaes.",
    "Fundada el 24 de diciembre de 1984": "Fundada'l 24 d'avientu de 1984",
    "Viento y percusión": "Vientu y percusión",
    "Cantera de jóvenes músicos": "Cantera de músicos mozos",
    "Clases desde los 6 años": "Clases dende los 6 años",
    "Hacerse socio": "Facese sociu",
    "Desde 12 € al año": "Dende 12 € al añu",
    "Tres maneras de vivir la música": "Tres maneres de vivir la música",
    "Músicos profesionales y aficionados que llenan de música auditorios y fiestas del concejo.": "Músicos profesionales y aficionaos que llenen de música auditorios y fiestes del conceyu.",
    "La cantera: los más jóvenes aprenden a tocar en grupo y preparan el relevo.": "La cantera: los más mozos deprenden a tocar en grupu y preparen el relevu.",
    "Clases de instrumento y de repertorio y ensayo con el Bandín, desde los 6 años.": "Clases d'instrumentu y de repertoriu y ensayu col Bandín, dende los 6 años.",
    "Conoce la Banda →": "Conoz la Banda →",
    "Conoce el Bandín →": "Conoz el Bandín →",
    "Conoce la Escuela →": "Conoz la Escuela →",
    "Conoce el Bandín": "Conoz el Bandín",
    "Próximas actuaciones": "Próximes actuaciones",
    "Ver todas": "Ver toes",
    "Pronto anunciaremos las próximas actuaciones. Síguenos en redes para no perderte nada.": "Ceo anunciaremos les próximes actuaciones. Síguinos nes redes pa nun perder nada.",
    "Pronto anunciaremos las próximas actuaciones.": "Ceo anunciaremos les próximes actuaciones.",
    "Más noticias": "Más noticies",
    "Todas las noticias": "Toles noticies",
    "¿Quieres tocar con nosotros?": "¿Quies tocar con nós?",
    "Contacta": "Contauta",

    /* Quiénes somos */
    "Una asociación hecha por y para la gente de Siero": "Una asociación fecha por y pa la xente de Siero",
    "Entidad sin ánimo de lucro dedicada a promover y difundir la música en el concejo de Siero desde 1984.": "Entidá ensin ánimu de llucru dedicada a promover y espardir la música nel conceyu de Siero dende 1984.",
    "La <b>Asociación Sierense Amigos de la Música (ASAM)</b> nació en 1984 para promover y difundir la música en el concejo de Siero. Desde entonces organiza conciertos gratuitos, pone música a los pasacalles de las fiestas locales y forma a nuevas generaciones de músicos.":
      "L'<b>Asociación Sierense Amigos de la Música (ASAM)</b> nació en 1984 pa promover y espardir la música nel conceyu de Siero. Dende entós organiza conciertos de baldre, pon música a los pasacais de les fiestes llocales y forma nueves xeneraciones de músicos.",
    "Bajo su paraguas conviven tres proyectos: la <b>Banda de Música de Siero</b>, formada por instrumentistas de viento y percusión; <b>el Bandín</b>, donde los más jóvenes aprenden a tocar en grupo; y la <b>escuela de música</b>, abierta a principiantes y a músicos avanzados.":
      "So'l so paragües conviven tres proyeutos: la <b>Banda de Música de Siero</b>, formada por instrumentistes de vientu y percusión; <b>el Bandín</b>, onde los más mozos deprenden a tocar en grupu; y la <b>escuela de música</b>, abierta a principiantes y a músicos avanzaos.",
    "Sus conciertos forman parte de la programación cultural del municipio, en el auditorio municipal la entrada es gratuita, y en las fiestas más señaladas de Pola de Siero la banda sale a tocar a la calle.":
      "Los sos conciertos formen parte de la programación cultural del conceyu, nel auditoriu municipal la entrada ye de baldre, y nes fiestes más señalaes de La Pola la banda sal a tocar a la cai.",
    "Además de los conciertos propios, organiza intercambios con otras formaciones y colabora con coros como los de Siero Musical.": "Amás de los conciertos propios, organiza intercambios con otres formaciones y collabora con coros como los de Siero Musical.",
    "Las clases de la escuela de música": "Les clases de la escuela de música",
    "Instrumentos de viento madera y metal": "Instrumentos de vientu madera y metal",
    "Repertorio": "Repertoriu",
    "Práctica de conjunto en el Bandín y la Banda": "Práctica de conxuntu nel Bandín y na Banda",
    "Horarios y cuotas →": "Horarios y cuotes →",
    "Hazte socio desde 12 € al año": "Faite sociu dende 12 € al añu",
    "Personas, empresas e instituciones pueden colaborar con la divulgación de la música en Siero y la Comarca del Nora haciéndose socio o mecenas.":
      "Persones, empreses ya instituciones pueden collaborar cola divulgación de la música en Siero y na Comarca del Nora faciéndose socios o mecenes.",
    "Cómo hacerse socio →": "Cómo facese sociu →",
    "La asociación se sostiene gracias a sus socios, al apoyo institucional del Ayuntamiento de Siero y la Fundación Caja Rural de Asturias, y a empresas mecenas y amigos que comparten nuestra afición.":
      "L'asociación sostiénse gracies a los sos socios, al sofitu institucional del Ayuntamientu de Siero y de la Fundación Caja Rural de Asturias, y a empreses mecenes y amigos que comparten la nuestra afición.",
    "Promover la cultura musical en Siero y en Asturias a través de la educación, la interpretación y la participación de toda la comunidad.":
      "Promover la cultura musical en Siero y n'Asturies al traviés de la educación, la interpretación y la participación de tola comunidá.",
    "Ser un referente cultural del concejo, con un entorno inclusivo donde personas de cualquier edad desarrollen su talento musical.":
      "Ser un referente cultural del conceyu, con un entornu inclusivu onde persones de cualquier edá desendolquen el so talentu musical.",
    "Colaboración, respeto y apoyo mutuo. Creemos que la música une a la gente, y por eso todo el mundo es bienvenido.":
      "Collaboración, respetu y sofitu mutuu. Creemos que la música xune a la xente, y por eso tol mundu ye bienveníu.",
    "Formación impartida por profesorado con experiencia, desde la teoría hasta la práctica instrumental.": "Formación impartida por profesoráu con esperiencia, dende la teoría hasta la práctica instrumental.",
    "Trabajo voluntario y altruista": "Trabayu voluntariu y altruista",
    "Junta Directiva": "Xunta Directiva",

    /* Historia */
    "Más de cuatro décadas de compases": "Más de cuatro décades de compases",
    "Siero tiene una larga tradición bandística. La ASAM tomó el relevo en los años ochenta y desde entonces no ha dejado de sonar.":
      "Siero tien una llarga tradición bandística. L'ASAM tomó'l relevu nos años ochenta y dende entós nun dexó de sonar.",
    "24 de diciembre": "24 d'avientu",
    "Nace la Asociación": "Naz l'Asociación",
    "Se firma el acta fundacional de la Asociación Sierense Amigos de la Música, con la banda como proyecto central.": "Róblase l'acta fundacional de l'Asociación Sierense Amigos de la Música, cola banda como proyeutu central.",
    "Febrero": "Febreru",
    "La banda debuta en el parque de Pola de Siero con un repertorio de pasodobles. La primera partitura que tocó fue «El abanico».": "La banda debuta nel parque de La Pola con un repertoriu de pasodobles. La primer partitura que tocó foi «El abanico».",
    "Una larga etapa": "Una etapa llarga",
    "Durante más de tres décadas dirige la banda y le da su sello. Es autor, entre otras obras, del pasodoble «El mar y la montaña».": "Durante más de tres décades dirixe la banda y da-y el so sellu. Ye autor, ente otres obres, del pasodoble «El mar y la montaña».",
    "El Bandín coge fuerza": "El Bandín garra fuerza",
    "Emilio Huerta, flautista de la banda desde su fundación, dirige el Bandín, la cantera de jóvenes músicos.": "Emilio Huerta, flautista de la banda dende la so fundación, dirixe'l Bandín, la cantera de músicos mozos.",
    "Septiembre": "Setiembre",
    "Nueva dirección de la Banda": "Nueva direición de la Banda",
    "Emilio Huerta Villanueva, subdirector desde 2014, asume la dirección de la Banda de Música de Siero.": "Emilio Huerta Villanueva, subdirector dende 2014, asume la direición de la Banda de Música de Siero.",
    "40 aniversario": "40 aniversariu",
    "Cuarenta años y nueva imagen": "Cuarenta años y imaxe nueva",
    "La asociación renueva su identidad: el azul representa la tradición, el verde el futuro en Siero y el naranja el amanecer musical de los más jóvenes.":
      "L'asociación anova la so identidá: l'azul representa la tradición, el verde'l futuru en Siero y el naranxa l'amanecer musical de los más mozos.",
    "Hoy": "Güei",
    "Nueva etapa": "Etapa nueva",
    "Relevo en el Bandín": "Relevu nel Bandín",
    "El clarinetista Víctor Peinó Ornia toma la batuta del Bandín, una de las pocas formaciones infantojuveniles de Asturias.": "El clarinetista Víctor Peinó Ornia toma la batuta del Bandín, una de les poques formaciones infantoxuveniles d'Asturies.",

    /* Banda */
    "La banda que suena en las fiestas y auditorios del concejo": "La banda que suena nes fiestes y auditorios del conceyu",
    "¡La Banda de Pola mola!": "¡La Banda de La Pola presta!",
    "Logotipo de la Banda de Música de Siero": "Logotipu de la Banda de Música de Siero",
    "Nacido en Traspando (Siero), es flautista de la banda desde su creación en 1984. Dirigió el Bandín entre 2008 y 2012, fue subdirector de la Banda de 2014 a 2021 y desde septiembre de 2021 es su director.":
      "Nacíu en Traspando (Siero), ye flautista de la banda dende la so creación en 1984. Dirixó'l Bandín ente 2008 y 2012, foi subdirector de la Banda de 2014 a 2021 y dende setiembre de 2021 ye'l so director.",
    "Ver trayectoria completa": "Ver trayeutoria completa",
    "Trayectoria": "Trayeutoria",
    "Profesor de Piano, Profesor Superior de Lenguaje Musical y de Órgano por el Conservatorio Superior Eduardo Martínez Torner de Oviedo.": "Profesor de Pianu, Profesor Superior de Llinguaxe Musical y d'Órganu pol Conservatoriu Superior Eduardo Martínez Torner d'Uviéu.",
    "Maestro especialista en Educación Musical por la Universidad de Oviedo.": "Maestru especialista n'Educación Musical pola Universidá d'Uviéu.",
    "Organista titular de la parroquia de San Pedro Apóstol de Pola de Siero.": "Organista titular de la parroquia de San Pedro Apóstol de La Pola.",
    "Compositor y arreglista para banda, órgano, coro, teatro y música infantil.": "Compositor y arreglista pa banda, órganu, coru, teatru y música infantil.",
    "Miembro del dúo Nuberu entre 1991 y 2007.": "Miembru del dúu Nuberu ente 1991 y 2007.",
    "La Banda de Música de Siero es el corazón de la ASAM. La forman músicos profesionales y amateurs que comparten atril e interpretan un repertorio variado, del pasodoble a las bandas sonoras.":
      "La Banda de Música de Siero ye'l corazón de l'ASAM. Fórmenla músicos profesionales y aficionaos que comparten atril ya interpreten un repertoriu variáu, del pasodoble a les bandes sonores.",
    "Azul por la tradición, verde por el futuro: los colores del logotipo del 40 aniversario.": "Azul pola tradición, verde pol futuru: los colores del logotipu del 40 aniversariu.",
    "Pronto publicaremos la plantilla de músicos.": "Ceo espublizaremos la plantía de músicos.",
    "Jefe de sección": "Xefe de seición",

    /* Bandín */
    "La cantera: donde se aprende a tocar en grupo": "La cantera: onde se deprende a tocar en grupu",
    "¡El Bandín de Pola mola!": "¡El Bandín de La Pola presta!",
    "Joven clarinetista formado en la casa. Tomó el relevo de la flautista Silvia Ovies, que se dedica en exclusiva a la docencia en la escuela de la ASAM, y debutó al frente del Bandín con bandas sonoras de cine y una obra de Holst.":
      "Clarinetista mozu formáu na casa. Tomó'l relevu de la flautista Silvia Ovies, que se dedica en esclusiva a la docencia na escuela de l'ASAM, y debutó al frente del Bandín con bandes sonores de cine y una obra de Holst.",
    "El Bandín reúne a los músicos más jóvenes de la escuela. Mientras mejoran con su instrumento, niños y niñas aprenden algo que pocas enseñanzas musicales ofrecen: tocar en conjunto, escuchar a los demás y subirse a un escenario.":
      "El Bandín axunta a los músicos más mozos de la escuela. Mentanto ameyoren col so instrumentu, neños y neñes deprenden daqué que poques enseñances musicales ofrecen: tocar en conxuntu, escuchar a los demás y xubise a un escenariu.",
    "Es un ambiente formativo, cercano y con ganas de pasarlo bien. Aquí se prepara el relevo generacional de la Banda de Siero.": "Ye un ambiente formativu, cercanu y con ganes de pasalo bien. Equí se prepara'l relevu xeneracional de la Banda de Siero.",
    "El naranja de su logotipo representa el amanecer a la música de las jóvenes promesas.": "El naranxa del so logotipu representa l'amanecer a la música de les promeses moces.",
    "¿Tu hijo/a quiere aprender a tocar un instrumento?": "¿El to fíu o la to fía quier deprender a tocar un instrumentu?",
    "Pregúntanos por las clases y por cómo entrar en el Bandín.": "Entrúganos poles clases y por cómo entrar nel Bandín.",

    /* Dirección */
    "Quién lleva la batuta y quién sostiene la asociación": "Quién lleva la batuta y quién sostién l'asociación",
    "Profesorado": "Profesoráu",
    "Flautista. Tras dirigir el Bandín, se dedica en exclusiva a la docencia en la escuela de la ASAM.": "Flautista. Dempués de dirixir el Bandín, dedícase en esclusiva a la docencia na escuela de l'ASAM.",

    /* Escuela */
    "Aprende a tocar desde los 6 años": "Deprende a tocar dende los 6 años",
    "Clases de instrumento y de repertorio y, desde el principio, práctica en grupo con el Bandín.": "Clases d'instrumentu y de repertoriu y, dende'l principiu, práctica en grupu col Bandín.",
    "Anímate a tocar con nosotros": "Anímate a tocar con nós",
    "¿Dónde se dan las clases?": "¿Ónde se dan les clases?",
    "Centro Cultural de La Fresneda": "Centru Cultural de La Fresneda",
    "Pola de Siero": "La Pola Siero",
    "Clases semanales": "Clases selmanales",
    "Desde los 6 años · También clases para adultos": "Dende los 6 años · Tamién clases pa adultos",
    "Clase de instrumento": "Clase d'instrumentu",
    "Clase individual: cada alumno aprende su instrumento con su profesor.": "Clase individual: cada alumnu deprende'l so instrumentu col so profesor.",
    "Clase de repertorio": "Clase de repertoriu",
    "Clase grupal de teoría musical.": "Clase en grupu de teoría musical.",
    "Ensayo del Bandín": "Ensayu del Bandín",
    "Todo lo aprendido se pone en práctica tocando juntos.": "Too lo deprendío pónse en práctica tocando xuntos.",
    "Cuotas de socio promesa": "Cuotes de sociu promesa",
    "Clases de repertorio": "Clases de repertoriu",
    "Clases de instrumento": "Clases d'instrumentu",
    "Repertorio + instrumento": "Repertoriu + instrumentu",
    "Recomendado": "Aconseyáu",
    "Forma de pago": "Forma de pagu",
    "¿Quieres apuntarte?": "¿Quies apuntate?",
    "Escríbenos o llámanos y te contamos los horarios y qué instrumento encaja contigo.": "Escríbinos o llámanos y cuntámoste los horarios y qué instrumentu te cuadra meyor.",

    /* Actuaciones */
    "Una temporada de conciertos a lo largo del año": "Una temporada de conciertos a lo llargo del añu",
    "Los conciertos en los auditorios municipales son gratuitos hasta completar aforo.": "Los conciertos nos auditorios municipales son de baldre hasta completar l'aforu.",
    "¡Nos vemos en el concierto!": "¡Vémonos nel conciertu!",
    "Próximos conciertos": "Próximos conciertos",
    "Pronto anunciaremos nuevos conciertos.": "Ceo anunciaremos conciertos nuevos.",
    "Ver todos los detalles ↓": "Ver tolos detalles ↓",
    "Nuestra temporada habitual": "La nuestra temporada habitual",
    "Noviembre": "Payares",
    "Diciembre": "Avientu",
    "Marzo": "Marzu",
    "Verano": "Branu",
    "Fiestas": "Fiestes",
    "Concierto de Santa Cecilia": "Conciertu de Santa Cecilia",
    "La cita con la patrona de la música en el Auditorio de Pola de Siero.": "La cita cola patrona de la música nel Auditoriu de La Pola.",
    "Concierto de Navidad": "Conciertu de Navidá",
    "Banda y Bandín juntos, a menudo con los coros de la Sociedad Siero Musical.": "Banda y Bandín xuntos, davezu colos coros de la Sociedá Siero Musical.",
    "Concierto de Carnaval": "Conciertu d'Antroxu",
    "Repertorio festivo en el Auditorio de Pola de Siero.": "Repertoriu festivu nel Auditoriu de La Pola.",
    "Conciertos e intercambios": "Conciertos ya intercambios",
    "Visitas de otras bandas y salidas a otros concejos.": "Visites d'otres bandes y salíes a otros conceyos.",
    "Música al aire libre": "Música al aire llibre",
    "Conciertos en la calle, en El Paraguas y otros espacios.": "Conciertos na cai, n'El Paraguas y n'otros espacios.",
    "Pasacalles": "Pasacais",
    "La banda recorre las calles en las fiestas más señaladas de Siero.": "La banda percuerre les cais nes fiestes más señalaes de Siero.",
    "Concierto de Primavera": "Conciertu de Primavera",
    "Intercambio con la banda de Sabadell": "Intercambiu cola banda de Sabadell",
    "Concierto con la COSMUPA": "Conciertu cola COSMUPA",
    "Concierto en Llanera": "Conciertu en Llanera",
    "Concierto del Tardeo": "Conciertu del Tardeo",
    "Auditorio de Pola de Siero": "Auditoriu de La Pola",
    "El Paraguas, Pola de Siero": "El Paraguas, La Pola",
    "Ver cartel": "Ver el cartel",

    /* Noticias */
    "Lo último de la asociación": "Lo últimu de l'asociación",
    "Lo último de la banda": "Lo últimu de la banda",
    "Última noticia": "Cabera noticia",
    "Mecenas": "Mecenes",
    "Todavía no hay noticias publicadas.": "Entá nun hai noticies espublizaes.",
    "La ASAM y el Ayuntamiento de Siero renuevan su convenio": "L'ASAM y l'Ayuntamientu de Siero anueven el so conveniu",
    "El acuerdo mantiene el apoyo municipal a la promoción y difusión de la música en el concejo. Al acto acudieron representantes de la junta directiva, la concejala de Cultura y el alcalde.":
      "L'alcuerdu caltién el sofitu municipal a la promoción y espardimientu de la música nel conceyu. A l'actu acudieron representantes de la xunta directiva, la conceyala de Cultura y l'alcalde.",
    "Nuevos apoyos para la música en Siero": "Sofitos nuevos pa la música en Siero",
    "Voltaje se suma como mecenas de la Banda y el Bandín, y Ornia&Campal Abogados firma un convenio de colaboración.": "Voltaje súmase como mecenes de la Banda y del Bandín, y Ornia&Campal Abogados robla un conveniu de collaboración.",
    "Santa Cecilia con sabor a reencuentro": "Santa Cecilia con sabor a reencuentru",
    "Antiguos músicos vuelven a la banda y Alfonso Sánchez Peña, director durante más de treinta años, dirige dos piezas, entre ellas su pasodoble «El mar y la montaña».":
      "Músicos antiguos vuelven a la banda y Alfonso Sánchez Peña, director durante más de trenta años, dirixe dos pieces, ente elles el so pasodoble «El mar y la montaña».",
    "Concierto de Navidad con la Sociedad Siero Musical": "Conciertu de Navidá cola Sociedá Siero Musical",
    "Más de un centenar de músicos y cantantes en el Auditorio, con la Marcha Radetzky como broche y el público marcando el compás.":
      "Más d'un centenar de músicos y cantantes nel Auditoriu, cola Marcha Radetzky como zarru y el públicu marcando'l compás.",
    "Víctor Peinó Ornia, nuevo director del Bandín": "Víctor Peinó Ornia, nuevu director del Bandín",
    "El joven clarinetista sustituye a Silvia Ovies, que pasa a dedicarse por completo a la docencia en la escuela.": "El clarinetista mozu sustitúi a Silvia Ovies, que pasa a dedicase dafechu a la docencia na escuela.",

    /* Galería */
    "Momentos de la Banda, el Bandín y la escuela": "Momentos de la Banda, del Bandín y de la escuela",
    "En nuestras redes hay muchas más fotos y vídeos.": "Nes nuestres redes hai munches más semeyes y vídeos.",
    "Momentos para recordar": "Momentos pa recordar",
    "Filtrar galería": "Peñerar la galería",
    "Todas": "Toes",
    "Todavía no hay fotos en la galería.": "Entá nun hai semeyes na galería.",
    "No hay fotos en esta categoría.": "Nun hai semeyes nesta categoría.",
    "Ver otra foto": "Ver otra semeya",
    "Cerrar ✕": "Zarrar ✕",

    /* Contacto */
    "Ven a vernos o escríbenos": "Ven a visitanos o escríbinos",
    "Teléfono (WhatsApp)": "Teléfonu (WhatsApp)",
    "Correo electrónico": "Corréu electrónicu",
    "Copiado": "Copiao",
    "Seleccionado": "Seleicionao",
    "Únete a la música": "Xúntate a la música",
    "Si quieres matricularte en la escuela, tocar en la Banda o en el Bandín, o hacerte socio desde 12 € al año, llámanos, escríbenos por WhatsApp o mándanos un correo y te contamos todo: instrumentos, horarios y tarifas.":
      "Si quies matriculate na escuela, tocar na Banda o nel Bandín, o facete sociu dende 12 € al añu, llámanos, escríbinos per WhatsApp o mándanos un corréu y cuntámoste too: instrumentos, horarios y tarifes.",
    "Escríbenos": "Escríbinos",
    "Calle Alcalde Parrondo, 32 · 33510 Pola de Siero (Asturias)": "Calle Alcalde Parrondo, 32 · 33510 La Pola Siero (Asturies)",

    /* Pie */
    "Asociación sin ánimo de lucro que enseña, toca y comparte música en el concejo de Siero desde 1984.": "Asociación ensin ánimu de llucru qu'enseña, toca y comparte música nel conceyu de Siero dende 1984.",
    "Con el apoyo del Ayuntamiento de Siero y la Fundación Caja Rural de Asturias": "Col sofitu del Ayuntamientu de Siero y de la Fundación Caja Rural de Asturias",
    "Con el apoyo del Ayuntamiento de Siero.": "Col sofitu del Ayuntamientu de Siero.",
    "Síguenos": "Síguinos",
    "© Asociación Sierense Amigos de la Música · Pola de Siero, Asturias": "© Asociación Sierense Amigos de la Música · La Pola Siero, Asturies",
    "Acceso administradores": "Accesu alministradores",

    /* Hacerse socio */
    "Hazte socio de la ASAM": "Faite sociu de l'ASAM",
    "La asociación se sostiene gracias a sus socios. Con tu cuota ayudas a que haya conciertos gratuitos, música en las fiestas y una escuela abierta a todas las edades.":
      "L'asociación sostiénse gracies a los sos socios. Cola to cuota ayudes a que haya conciertos de baldre, música nes fiestes y una escuela abierta a toles edaes.",
    "¡Hazte socio!": "¡Faite sociu!",
    "¿Cómo hacerse socio?": "¿Cómo facese sociu?",
    "Rellena la hoja de socio con tus datos.": "Enllena la fueya de sociu colos tos datos.",
    "Entrégala en nuestras oficinas o envíanosla.": "Entrégala nes nuestres oficines o unviánosla.",
    "Te confirmamos el alta y empiezas a formar parte de la asociación.": "Confirmámoste l'alta y entames a formar parte de l'asociación.",
    "Cuota de socio": "Cuota de sociu",
    "Hoja de socio ↓": "Fueya de sociu ↓",
    "Hoja de socio": "Fueya de sociu",
    "Muy pronto podrás rellenarla aquí": "Mui ceo vas poder enllenala equí",
    "Estamos preparando la hoja de inscripción para que puedas completarla desde la web. Mientras tanto, puedes pedirla en nuestras oficinas.":
      "Tamos preparando la fueya d'inscripción pa que puedas completala dende la web. Mentanto, pues pidila nes nuestres oficines.",
    "Para más información, contacte con nosotros o pase por nuestras oficinas.": "Pa más información, contaute con nós o pase poles nuestres oficines.",
    "Ver datos de contacto →": "Ver los datos de contautu →"
  },

  prefijos: [
    ["Foto de ", "Semeya de "],
    ["Ver foto de ", "Ver semeya de "],
    ["Ver foto: ", "Ver semeya: "],
    ["Reproducir vídeo: ", "Reproducir vídeu: "],
    ["Ver el cartel de ", "Ver el cartel de "],
    ["Cartel de ", "Cartel de "],
    ["Cartel · ", "Cartel · "]
  ],

  reglas: [
    [/^(\d+) años haciendo música$/, "$1 años faciendo música"],
    [/^🎼 Repertorio \((\d+) obra\)$/, "🎼 Repertoriu ($1 obra)"],
    [/^🎼 Repertorio \((\d+) obras\)$/, "🎼 Repertoriu ($1 obres)"],
    [/^Precios por (.+)$/, "Precios por $1"],
    [/^Clases para todas las edades y sitio en el Bandín y la Banda\. Hazte socio desde (.+) al año\.$/, "Clases pa toles edaes y sitiu nel Bandín y na Banda. Faite sociu dende $1 al añu."],
    [/^Desde (.+) al año$/, "Dende $1 al añu"]
  ]
};
