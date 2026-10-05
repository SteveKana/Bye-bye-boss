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
          'Bye Bye Boss analyse votre CV et vos préférences pour vous présenter des offres d’emploi et estimer leur adéquation avec votre profil.',
          'Les offres proviennent de sources tierces et les scores sont des **estimations indicatives** : ils ne garantissent ni un entretien, ni une embauche, ni l’exactitude ou la disponibilité d’une offre. Vérifiez toujours l’offre auprès de l’entreprise qui la publie.',
        ],
      },
      {
        id: 'propriete',
        title: 'Propriété intellectuelle',
        blocks: [
          'La marque, le logo, les textes, les graphismes et le code du site sont la propriété de leur éditeur, sauf mention contraire. Toute reproduction ou réutilisation sans autorisation écrite préalable est interdite.',
          'Les contenus que vous importez (CV, informations de profil) restent les vôtres.',
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
          'Le traitement de vos données personnelles est détaillé dans la [politique de confidentialité](/confidentialite). L’usage des cookies est décrit dans la [politique d’utilisation des cookies](/cookies).',
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
      'Cette page explique quelles données personnelles Bye Bye Boss collecte, pourquoi, avec qui elles sont partagées et comment exercer vos droits (règlement européen RGPD et loi Informatique et Libertés).',
    updated: '5 octobre 2026',
    sections: [
      {
        id: 'responsable',
        title: 'Qui est responsable de vos données ?',
        blocks: [
          'Le responsable du traitement est **Steve Kana**, 97 rue Ardoin, 93400 Saint-Ouen-sur-Seine, France.',
          'Pour toute question sur vos données : [formulaire de contact](/contact?topic=personal_data), sujet « Données personnelles (RGPD) ».',
        ],
      },
      {
        id: 'donnees',
        title: 'Quelles données collectons-nous ?',
        blocks: [
          {
            list: [
              '**Compte** : adresse email, prénom, nom, mot de passe (stocké sous forme chiffrée, jamais en clair). Si vous vous connectez avec Google : votre identifiant Google, votre email, votre nom et votre photo de profil.',
              '**CV et profil** : le fichier de CV que vous importez, son texte, et les informations qui en sont extraites (expériences, compétences, formations, langues, certifications, localisation, résumé).',
              '**Préférences de recherche** : types de contrat, télétravail, mobilité, prétentions salariales ou tarif journalier, disponibilité.',
              '**Résultats** : offres qui vous sont proposées, scores de compatibilité, et suivi de vos candidatures.',
              '**Notifications** : vos choix d’alertes ; votre numéro WhatsApp et/ou le lien du webhook Discord uniquement si vous activez ces canaux.',
              '**Liste d’attente** : votre adresse email si vous la laissez sur la page d’accueil.',
              '**Formulaire de contact** : votre nom, votre email et votre message.',
              '**Données techniques** : adresse IP, date et pages demandées, conservées dans des journaux de sécurité.',
            ],
          },
          'Nous ne collectons pas de données sensibles (santé, opinions, origine…) de manière volontaire. Si votre CV en contient, c’est vous qui décidez de le déposer ou non.',
        ],
      },
      {
        id: 'finalites',
        title: 'Pourquoi et sur quelle base légale ?',
        blocks: [
          {
            list: [
              '**Fournir le service** (créer votre compte, analyser votre CV, calculer vos scores, vous proposer des offres, suivre vos candidatures, vous envoyer vos alertes) – base : l’exécution du contrat.',
              '**Activer vos canaux d’alerte** (WhatsApp, Discord) et **vous connecter avec Google** – base : votre consentement, que vous pouvez retirer à tout moment.',
              '**Répondre à vos messages** et gérer la liste d’attente – base : votre demande / votre consentement.',
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
          'Votre CV est analysé avec l’aide d’un service d’intelligence artificielle pour en extraire votre profil, puis comparé aux offres pour calculer des scores. Ces scores sont une **aide à la décision** : aucune décision ayant un effet juridique sur vous n’est prise automatiquement, et c’est toujours vous qui décidez de postuler ou non.',
        ],
      },
      {
        id: 'destinataires',
        title: 'Avec qui partageons-nous vos données ?',
        blocks: [
          'Nous ne vendons jamais vos données. Elles ne sont communiquées qu’aux prestataires nécessaires au service :',
          {
            list: [
              '**Hetzner Online GmbH** (Allemagne) : hébergement du site et de la base de données.',
              '**OpenAI** : analyse du texte de votre CV et calcul des scores.',
              '**Un prestataire d’envoi d’emails** : acheminement des emails du service (confirmation, alertes, réponses).',
              '**Meta (WhatsApp)** : uniquement si vous activez les alertes WhatsApp.',
              '**Discord** : uniquement si vous activez les alertes Discord.',
              '**Google** : uniquement si vous choisissez « Continuer avec Google » (voir la [politique cookies](/cookies)).',
              '**France Travail et Adzuna** : sources d’offres d’emploi. Seuls des mots-clés de recherche leur sont envoyés, jamais votre identité ni votre CV.',
            ],
          },
          'Ces prestataires agissent pour notre compte ou selon leurs propres conditions. Certains peuvent traiter des données en dehors de l’Union européenne (notamment aux États-Unis) ; ces transferts sont encadrés par les mécanismes prévus par le RGPD (clauses contractuelles types ou cadre de protection des données UE–États-Unis).',
        ],
      },
      {
        id: 'durees',
        title: 'Combien de temps conservons-nous vos données ?',
        blocks: [
          {
            list: [
              '**Compte, CV, profil, préférences, scores, candidatures, notifications** : tant que votre compte existe. Si vous supprimez votre compte, ces données sont supprimées définitivement.',
              '**Messages du formulaire de contact** : le temps de traiter votre demande, puis au maximum 3 ans.',
              '**Liste d’attente** : jusqu’à votre désinscription, au maximum 3 ans.',
              '**Journaux techniques** : 12 mois maximum.',
              '**Choix cookies** : 6 mois (voir la [politique cookies](/cookies)).',
            ],
          },
        ],
      },
      {
        id: 'droits',
        title: 'Quels sont vos droits ?',
        blocks: [
          'Vous pouvez à tout moment : accéder à vos données, les rectifier, les effacer, limiter leur traitement, vous y opposer, les récupérer dans un format réutilisable (portabilité), retirer votre consentement, et définir des directives sur le sort de vos données après votre décès.',
          'Pour cela, écrivez-nous via le [formulaire de contact](/contact?topic=personal_data). Nous répondons dans un délai d’un mois. Vous pouvez aussi supprimer votre compte et vos données directement depuis les paramètres du site.',
          'Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL : [cnil.fr](https://www.cnil.fr/fr/plaintes) (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07).',
        ],
      },
      {
        id: 'securite',
        title: 'Comment protégeons-nous vos données ?',
        blocks: [
          'Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont stockés sous forme chiffrée, et l’accès aux données est limité. Aucun système n’étant infaillible, nous vous invitons à choisir un mot de passe unique et solide.',
        ],
      },
      {
        id: 'modifications',
        title: 'Modifications',
        blocks: [
          'Cette politique peut évoluer. La date de dernière mise à jour figure en haut de la page ; en cas de changement important, nous vous en informerons.',
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
          'Un cookie est un petit fichier enregistré sur votre appareil lorsque vous visitez un site. Il permet par exemple de vous garder connecté ou de mémoriser votre langue.',
        ],
      },
      {
        id: 'essentiels',
        title: 'Cookies essentiels (toujours actifs)',
        blocks: [
          'Ces cookies sont indispensables au fonctionnement du site. Ils ne nécessitent pas votre accord et ne servent ni à la publicité ni au suivi de votre navigation.',
        ],
      },
      {
        id: 'liste',
        title: 'Liste des cookies',
        blocks: [],
      },
      {
        id: 'tiers',
        title: 'Service tiers soumis à votre accord',
        blocks: [
          '**Connexion avec Google** : si vous acceptez les cookies, le script de connexion de Google est chargé sur les pages de connexion et d’inscription pour afficher le bouton « Continuer avec Google ». Google peut alors déposer ses propres cookies, selon sa [politique de confidentialité](https://policies.google.com/privacy). Si vous refusez, ce script n’est pas chargé et vous pouvez toujours vous connecter avec votre email et votre mot de passe.',
        ],
      },
      {
        id: 'polices',
        title: 'Polices de caractères',
        blocks: [
          'Les polices d’écriture du site (Inter et Caveat) sont chargées depuis les serveurs de Google Fonts. Cela transmet votre adresse IP à Google, mais ne dépose aucun cookie sur votre appareil.',
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
        title: 'Gérer vos choix',
        blocks: [
          'Votre choix est mémorisé pendant 6 mois, puis le bandeau vous est proposé à nouveau. Vous pouvez le modifier à tout moment avec le bouton ci-dessous.',
          'Vous pouvez aussi supprimer ou bloquer les cookies depuis les réglages de votre navigateur ; les cookies déjà déposés par Google se suppriment depuis ces mêmes réglages. Bloquer les cookies essentiels peut empêcher la connexion au site.',
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
          purpose: 'Garde votre session ouverte (jeton d’accès)',
          duration: '30 minutes',
        },
        {
          name: 'mc_refresh',
          purpose: 'Renouvelle votre session sans ressaisir votre mot de passe',
          duration: '7 jours',
        },
        {
          name: 'mc_lang',
          purpose: 'Mémorise votre langue (français ou anglais)',
          duration: '12 mois',
        },
        { name: 'mc_consent', purpose: 'Mémorise votre choix sur les cookies', duration: '6 mois' },
      ],
    },
  },
}
