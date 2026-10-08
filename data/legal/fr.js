// Legal texts (FR). Plain data, rendered by components/legal/LegalPage.vue.
// Block types: a string = paragraph, { list: [...] } = bullet list.
// Inline: **bold** and [label](/path | https://… | mailto:…).
export default {
  legal: {
    title: 'Mentions légales',
    intro:
      'Informations légales relatives au site Bye Bye Boss, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).',
    updated: '5 octobre 2026',
    sections: [
      {
        id: 'editeur',
        title: 'Éditeur du site',
        blocks: [
          'Le site Bye Bye Boss (aussi appelé MatchCareer) est édité par **Steve Kana**.',
          'Adresse : 97 rue Ardoin, 93400 Saint-Ouen-sur-Seine, France.',
          'Contact : via le [formulaire de contact](/contact).',
        ],
      },
      {
        id: 'direction',
        title: 'Directeur de la publication',
        blocks: ['Le directeur de la publication est **Steve Kana**.'],
      },
      {
        id: 'hebergeur',
        title: 'Hébergeur',
        blocks: [
          'Le site est hébergé par **Hetzner Online GmbH**, Industriestr. 25, 91710 Gunzenhausen, Allemagne.',
          'Téléphone : +49 (0)9831 505-0 – Site : [hetzner.com](https://www.hetzner.com).',
        ],
      },
      {
        id: 'service',
        title: 'Nature du service',
        blocks: [
          'Bye Bye Boss analyse ton CV et tes préférences pour te présenter des offres d’emploi et estimer leur adéquation avec ton profil.',
          'Les offres proviennent de sources tierces et les scores sont des **estimations indicatives** : ils ne garantissent ni un entretien, ni une embauche, ni l’exactitude ou la disponibilité d’une offre. Vérifie toujours l’offre auprès de l’entreprise qui la publie.',
        ],
      },
      {
        id: 'propriete',
        title: 'Propriété intellectuelle',
        blocks: [
          'La marque, le logo, les textes, les graphismes et le code du site sont la propriété de leur éditeur, sauf mention contraire. Toute reproduction ou réutilisation sans autorisation écrite préalable est interdite.',
          'Les contenus que tu importes (CV, informations de profil) restent les tiens.',
        ],
      },
      {
        id: 'liens',
        title: 'Liens externes',
        blocks: [
          'Le site peut renvoyer vers des sites tiers (offres d’emploi, services d’authentification). Leur contenu n’est pas contrôlé par l’éditeur, qui ne peut être tenu responsable de leur disponibilité ou de leur contenu.',
        ],
      },
      {
        id: 'donnees',
        title: 'Données personnelles et cookies',
        blocks: [
          'Le traitement de tes données personnelles est détaillé dans la [politique de confidentialité](/confidentialite). L’usage des cookies est décrit dans la [politique d’utilisation des cookies](/cookies).',
        ],
      },
      {
        id: 'droit',
        title: 'Droit applicable',
        blocks: [
          'Le site est soumis au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français sont compétents.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Politique de confidentialité',
    intro:
      'Cette page explique quelles données personnelles Bye Bye Boss collecte, pourquoi, avec qui elles sont partagées et comment exercer tes droits (règlement européen RGPD et loi Informatique et Libertés).',
    updated: '5 octobre 2026',
    sections: [
      {
        id: 'responsable',
        title: 'Qui est responsable de tes données ?',
        blocks: [
          'Le responsable du traitement est **Steve Kana**, 97 rue Ardoin, 93400 Saint-Ouen-sur-Seine, France.',
          'Pour toute question sur tes données : [formulaire de contact](/contact?topic=personal_data), sujet « Données personnelles (RGPD) ».',
        ],
      },
      {
        id: 'donnees',
        title: 'Quelles données collectons-nous ?',
        blocks: [
          {
            list: [
              '**Compte** : adresse email, prénom, nom, mot de passe (stocké sous forme chiffrée, jamais en clair). Si tu te connectes avec Google : ton identifiant Google, ton email, ton nom et ta photo de profil.',
              '**CV et profil** : le fichier de CV que tu importes, son texte, et les informations qui en sont extraites (expériences, compétences, formations, langues, certifications, localisation, résumé).',
              '**Disponibilité** : immédiate, date de début ou préavis.',
              '**Préférences de recherche** : zone géographique (régions), types de contrat, type de travail (sur site, hybride, full remote), salaire annuel minimum ou tarif journalier. Elles servent à choisir les offres qui te sont proposées et à pré-remplir tes filtres.',
              '**Résultats** : offres qui te sont proposées, scores de compatibilité, et suivi de tes candidatures.',
              '**Notifications** : tes choix d’alertes ; ton numéro WhatsApp et/ou le lien du webhook Discord uniquement si tu actives ces canaux.',
              '**Liste d’attente** : ton adresse email si tu la laisses sur la page d’accueil.',
              '**Formulaire de contact** : ton nom, ton email et ton message.',
              '**Données techniques** : adresse IP, date et pages demandées, conservées dans des journaux de sécurité.',
            ],
          },
          'Nous ne collectons pas de données sensibles (santé, opinions, origine…) de manière volontaire. Si ton CV en contient, c’est toi qui décides de le déposer ou non.',
        ],
      },
      {
        id: 'finalites',
        title: 'Pourquoi et sur quelle base légale ?',
        blocks: [
          {
            list: [
              '**Fournir le service** (créer ton compte, analyser ton CV, calculer tes scores, te proposer des offres, suivre tes candidatures, t’envoyer tes alertes) – base : l’exécution du contrat.',
              '**Activer tes canaux d’alerte** (WhatsApp, Discord) et **te connecter avec Google** – base : ton consentement, que tu peux retirer à tout moment.',
              '**Répondre à tes messages** et gérer la liste d’attente – base : ta demande / ton consentement.',
              '**Sécuriser le site** (lutte contre le spam et les abus, journaux) – base : notre intérêt légitime.',
              '**Respecter nos obligations légales** (par exemple conserver certains journaux de connexion).',
            ],
          },
        ],
      },
      {
        id: 'ia',
        title: 'Scores et intelligence artificielle',
        blocks: [
          'Ton CV est analysé avec l’aide d’un service d’intelligence artificielle pour en extraire ton profil, puis comparé aux offres pour calculer des scores. Ces scores sont une **aide à la décision** : aucune décision ayant un effet juridique sur toi n’est prise automatiquement, et c’est toujours toi qui décides de postuler ou non.',
        ],
      },
      {
        id: 'destinataires',
        title: 'Avec qui partageons-nous tes données ?',
        blocks: [
          'Nous ne vendons jamais tes données. Elles ne sont communiquées qu’aux prestataires nécessaires au service :',
          {
            list: [
              '**Hetzner Online GmbH** (Allemagne) : hébergement du site et de la base de données.',
              '**OpenAI** : analyse du texte de ton CV et calcul des scores.',
              '**Un prestataire d’envoi d’emails** : acheminement des emails du service (confirmation, alertes, réponses).',
              '**Meta (WhatsApp)** : uniquement si tu actives les alertes WhatsApp.',
              '**Discord** : uniquement si tu actives les alertes Discord.',
              '**Google** : uniquement si tu choisis « Continuer avec Google » (voir la [politique cookies](/cookies)).',
              '**France Travail et Adzuna** : sources d’offres d’emploi. Seuls des mots-clés de recherche leur sont envoyés, jamais ton identité ni ton CV.',
            ],
          },
          'Ces prestataires agissent pour notre compte ou selon leurs propres conditions. Certains peuvent traiter des données en dehors de l’Union européenne (notamment aux États-Unis) ; ces transferts sont encadrés par les mécanismes prévus par le RGPD (clauses contractuelles types ou cadre de protection des données UE–États-Unis).',
        ],
      },
      {
        id: 'durees',
        title: 'Combien de temps conservons-nous tes données ?',
        blocks: [
          {
            list: [
              '**Compte, CV, profil, préférences, scores, candidatures, notifications** : tant que ton compte existe. Si tu supprimes ton compte, ces données sont supprimées définitivement.',
              '**Messages du formulaire de contact** : le temps de traiter ta demande, puis au maximum 3 ans.',
              '**Liste d’attente** : jusqu’à ta désinscription, au maximum 3 ans.',
              '**Journaux techniques** : 12 mois maximum.',
              '**Choix cookies** : 6 mois (voir la [politique cookies](/cookies)).',
            ],
          },
        ],
      },
      {
        id: 'droits',
        title: 'Quels sont tes droits ?',
        blocks: [
          'Tu peux à tout moment : accéder à tes données, les rectifier, les effacer, limiter leur traitement, t’y opposer, les récupérer dans un format réutilisable (portabilité), retirer ton consentement, et définir des directives sur le sort de tes données après ton décès.',
          'Pour cela, écris-nous via le [formulaire de contact](/contact?topic=personal_data). Nous répondons dans un délai d’un mois. Tu peux aussi supprimer ton compte et tes données directement depuis les paramètres du site.',
          'Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL : [cnil.fr](https://www.cnil.fr/fr/plaintes) (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07).',
        ],
      },
      {
        id: 'securite',
        title: 'Comment protégeons-nous tes données ?',
        blocks: [
          'Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont stockés sous forme chiffrée, et l’accès aux données est limité. Aucun système n’étant infaillible, nous t’invitons à choisir un mot de passe unique et solide.',
        ],
      },
      {
        id: 'modifications',
        title: 'Modifications',
        blocks: [
          'Cette politique peut évoluer. La date de dernière mise à jour figure en haut de la page ; en cas de changement important, nous t’en informerons.',
        ],
      },
    ],
  },

  cookies: {
    title: 'Politique d’utilisation des cookies',
    intro:
      'Cette page explique quels cookies et traceurs Bye Bye Boss utilise, à quoi ils servent et comment les gérer.',
    updated: '5 octobre 2026',
    sections: [
      {
        id: 'definition',
        title: 'Qu’est-ce qu’un cookie ?',
        blocks: [
          'Un cookie est un petit fichier enregistré sur ton appareil lorsque tu visites un site. Il permet par exemple de te garder connecté ou de mémoriser ta langue.',
        ],
      },
      {
        id: 'essentiels',
        title: 'Cookies essentiels (toujours actifs)',
        blocks: [
          'Ces cookies sont indispensables au fonctionnement du site. Ils ne nécessitent pas ton accord et ne servent ni à la publicité ni au suivi de ta navigation.',
        ],
      },
      {
        id: 'liste',
        title: 'Liste des cookies',
        blocks: [],
      },
      {
        id: 'tiers',
        title: 'Service tiers soumis à ton accord',
        blocks: [
          '**Connexion avec Google** : si tu acceptes les cookies, le script de connexion de Google est chargé sur les pages de connexion et d’inscription pour afficher le bouton « Continuer avec Google ». Google peut alors déposer ses propres cookies, selon sa [politique de confidentialité](https://policies.google.com/privacy). Si tu refuses, ce script n’est pas chargé et tu peux toujours te connecter avec ton email et ton mot de passe.',
        ],
      },
      {
        id: 'polices',
        title: 'Polices de caractères',
        blocks: [
          'Les polices d’écriture du site (Inter et Caveat) sont chargées depuis les serveurs de Google Fonts. Cela transmet ton adresse IP à Google, mais ne dépose aucun cookie sur ton appareil.',
        ],
      },
      {
        id: 'aucun',
        title: 'Ce que nous n’utilisons pas',
        blocks: [
          'Bye Bye Boss n’utilise ni cookies publicitaires, ni outil de mesure d’audience, ni réseaux sociaux intégrés.',
        ],
      },
      {
        id: 'gerer',
        title: 'Gérer tes choix',
        blocks: [
          'Ton choix est mémorisé pendant 6 mois, puis le bandeau t’est proposé à nouveau. Tu peux le modifier à tout moment avec le bouton ci-dessous.',
          'Tu peux aussi supprimer ou bloquer les cookies depuis les réglages de ton navigateur ; les cookies déjà déposés par Google se suppriment depuis ces mêmes réglages. Bloquer les cookies essentiels peut empêcher la connexion au site.',
        ],
      },
    ],
    table: {
      name: 'Nom',
      purpose: 'Rôle',
      duration: 'Durée',
      rows: [
        {
          name: 'mc_access',
          purpose: 'Garde ta session ouverte (jeton d’accès)',
          duration: '30 minutes',
        },
        {
          name: 'mc_refresh',
          purpose: 'Renouvelle ta session sans ressaisir ton mot de passe',
          duration: '7 jours',
        },
        {
          name: 'mc_lang',
          purpose: 'Mémorise ta langue (français ou anglais)',
          duration: '12 mois',
        },
        { name: 'mc_consent', purpose: 'Mémorise ton choix sur les cookies', duration: '6 mois' },
      ],
    },
  },
}
