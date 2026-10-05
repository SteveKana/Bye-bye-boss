// Legal texts (EN). Same structure as fr.js -- keep both in sync.
export default {
  legal: {
    title: 'Legal notice',
    intro:
      'Legal information about the Bye Bye Boss website, as required by French law (law no. 2004-575 of 21 June 2004, LCEN).',
    updated: 'October 5, 2026',
    sections: [
      {
        id: 'editeur',
        title: 'Website publisher',
        blocks: [
          'The Bye Bye Boss website (also called MatchCareer) is published by **Steve Kana**.',
          'Address: 97 rue Ardoin, 93400 Saint-Ouen-sur-Seine, France.',
          'Contact: through the [contact form](/contact).',
        ],
      },
      {
        id: 'direction',
        title: 'Publication director',
        blocks: ['The publication director is **Steve Kana**.'],
      },
      {
        id: 'hebergeur',
        title: 'Hosting provider',
        blocks: [
          'The site is hosted by **Hetzner Online GmbH**, Industriestr. 25, 91710 Gunzenhausen, Germany.',
          'Phone: +49 (0)9831 505-0 – Website: [hetzner.com](https://www.hetzner.com).',
        ],
      },
      {
        id: 'service',
        title: 'Nature of the service',
        blocks: [
          'Bye Bye Boss analyses your CV and preferences to show you job offers and estimate how well they fit your profile.',
          'Offers come from third-party sources and scores are **indicative estimates**: they do not guarantee an interview, a job, or the accuracy or availability of an offer. Always check the offer with the company that published it.',
        ],
      },
      {
        id: 'propriete',
        title: 'Intellectual property',
        blocks: [
          'The brand, logo, texts, graphics and code of the site belong to their publisher unless stated otherwise. Any reproduction or reuse without prior written permission is forbidden.',
          'The content you upload (CV, profile information) remains yours.',
        ],
      },
      {
        id: 'liens',
        title: 'External links',
        blocks: [
          'The site may link to third-party sites (job offers, sign-in services). The publisher does not control their content and cannot be held responsible for their availability or content.',
        ],
      },
      {
        id: 'donnees',
        title: 'Personal data and cookies',
        blocks: [
          'How your personal data is processed is explained in the [privacy policy](/confidentialite). Cookie usage is described in the [cookie policy](/cookies).',
        ],
      },
      {
        id: 'droit',
        title: 'Governing law',
        blocks: [
          'The site is governed by French law. In case of dispute, and failing an amicable solution, French courts have jurisdiction.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy policy',
    intro:
      'This page explains which personal data Bye Bye Boss collects, why, who it is shared with, and how to exercise your rights (EU GDPR and the French Data Protection Act).',
    updated: 'October 5, 2026',
    sections: [
      {
        id: 'responsable',
        title: 'Who is responsible for your data?',
        blocks: [
          'The data controller is **Steve Kana**, 97 rue Ardoin, 93400 Saint-Ouen-sur-Seine, France.',
          'For any question about your data: [contact form](/contact?topic=personal_data), topic “Personal data (GDPR)”.',
        ],
      },
      {
        id: 'donnees',
        title: 'What data do we collect?',
        blocks: [
          {
            list: [
              '**Account**: email address, first name, last name, password (stored in encrypted form, never in clear text). If you sign in with Google: your Google identifier, email, name and profile picture.',
              '**CV and profile**: the CV file you upload, its text, and the information extracted from it (experience, skills, education, languages, certifications, location, summary).',
              '**Availability**: immediate, start date or notice period. Older accounts may also keep search preferences entered earlier (contract types, remote work, mobility, salary expectations or daily rate); they are no longer used.',
              '**Results**: the offers shown to you, compatibility scores, and the tracking of your applications.',
              '**Notifications**: your alert choices; your WhatsApp number and/or Discord webhook link only if you enable those channels.',
              '**Waitlist**: your email address if you leave it on the home page.',
              '**Contact form**: your name, email and message.',
              '**Technical data**: IP address, date and pages requested, kept in security logs.',
            ],
          },
          'We do not intentionally collect sensitive data (health, opinions, origin…). If your CV contains some, it is up to you to decide whether to upload it.',
        ],
      },
      {
        id: 'finalites',
        title: 'Why, and on what legal basis?',
        blocks: [
          {
            list: [
              '**Providing the service** (creating your account, analysing your CV, computing scores, showing offers, tracking applications, sending alerts) – basis: performance of the contract.',
              '**Enabling your alert channels** (WhatsApp, Discord) and **signing in with Google** – basis: your consent, which you can withdraw at any time.',
              '**Answering your messages** and managing the waitlist – basis: your request / your consent.',
              '**Securing the site** (anti-spam and abuse, logs) – basis: our legitimate interest.',
              '**Meeting our legal obligations** (for example keeping certain connection logs).',
            ],
          },
        ],
      },
      {
        id: 'ia',
        title: 'Scores and artificial intelligence',
        blocks: [
          'Your CV is analysed with the help of an artificial intelligence service to extract your profile, which is then compared with offers to compute scores. These scores are a **decision aid**: no decision with legal effect on you is made automatically, and you always decide whether to apply.',
        ],
      },
      {
        id: 'destinataires',
        title: 'Who do we share your data with?',
        blocks: [
          'We never sell your data. It is only shared with the providers needed to run the service:',
          {
            list: [
              '**Hetzner Online GmbH** (Germany): hosting of the site and the database.',
              '**OpenAI**: analysis of your CV text and score computation.',
              '**An email delivery provider**: delivery of service emails (confirmation, alerts, replies).',
              '**Meta (WhatsApp)**: only if you enable WhatsApp alerts.',
              '**Discord**: only if you enable Discord alerts.',
              '**Google**: only if you choose “Continue with Google” (see the [cookie policy](/cookies)).',
              '**France Travail and Adzuna**: job offer sources. Only search keywords are sent to them, never your identity or CV.',
            ],
          },
          'These providers act on our behalf or under their own terms. Some may process data outside the European Union (notably in the United States); such transfers are covered by the mechanisms provided by the GDPR (standard contractual clauses or the EU–US data privacy framework).',
        ],
      },
      {
        id: 'durees',
        title: 'How long do we keep your data?',
        blocks: [
          {
            list: [
              '**Account, CV, profile, preferences, scores, applications, notifications**: as long as your account exists. If you delete your account, this data is permanently deleted.',
              '**Contact form messages**: the time needed to handle your request, then 3 years at most.',
              '**Waitlist**: until you unsubscribe, 3 years at most.',
              '**Technical logs**: 12 months at most.',
              '**Cookie choice**: 6 months (see the [cookie policy](/cookies)).',
            ],
          },
        ],
      },
      {
        id: 'droits',
        title: 'What are your rights?',
        blocks: [
          'At any time you can: access your data, correct it, erase it, restrict its processing, object to it, receive it in a reusable format (portability), withdraw your consent, and set instructions for your data after your death.',
          'To do so, write to us through the [contact form](/contact?topic=personal_data). We reply within one month. You can also delete your account and data directly from the site settings.',
          'If you believe your rights are not respected, you can lodge a complaint with the French authority, the CNIL: [cnil.fr](https://www.cnil.fr/en/complaints).',
        ],
      },
      {
        id: 'securite',
        title: 'How do we protect your data?',
        blocks: [
          'Exchanges with the site are encrypted (HTTPS), passwords are stored in encrypted form, and access to data is restricted. No system is infallible, so we encourage you to choose a strong, unique password.',
        ],
      },
      {
        id: 'modifications',
        title: 'Changes',
        blocks: [
          'This policy may change. The last update date is shown at the top of the page; we will let you know of any important change.',
        ],
      },
    ],
  },

  cookies: {
    title: 'Cookie policy',
    intro:
      'This page explains which cookies and trackers Bye Bye Boss uses, what they are for, and how to manage them.',
    updated: 'October 5, 2026',
    sections: [
      {
        id: 'definition',
        title: 'What is a cookie?',
        blocks: [
          'A cookie is a small file saved on your device when you visit a site. For example, it keeps you signed in or remembers your language.',
        ],
      },
      {
        id: 'essentiels',
        title: 'Essential cookies (always on)',
        blocks: [
          'These cookies are required for the site to work. They do not need your consent and are not used for advertising or to track your browsing.',
        ],
      },
      {
        id: 'liste',
        title: 'List of cookies',
        blocks: [],
      },
      {
        id: 'tiers',
        title: 'Third-party service that needs your consent',
        blocks: [
          '**Sign in with Google**: if you accept cookies, Google’s sign-in script is loaded on the login and sign-up pages to display the “Continue with Google” button. Google may then set its own cookies, under its [privacy policy](https://policies.google.com/privacy). If you refuse, this script is not loaded and you can still sign in with your email and password.',
        ],
      },
      {
        id: 'polices',
        title: 'Fonts',
        blocks: [
          'The site’s fonts (Inter and Caveat) are loaded from Google Fonts servers. This sends your IP address to Google but does not set any cookie on your device.',
        ],
      },
      {
        id: 'aucun',
        title: 'What we do not use',
        blocks: [
          'Bye Bye Boss uses no advertising cookies, no audience-measurement tool and no embedded social networks.',
        ],
      },
      {
        id: 'gerer',
        title: 'Managing your choices',
        blocks: [
          'Your choice is remembered for 6 months, then the banner is shown again. You can change it at any time with the button below.',
          'You can also delete or block cookies in your browser settings; cookies already set by Google are removed from those same settings. Blocking essential cookies may prevent you from signing in.',
        ],
      },
    ],
    table: {
      name: 'Name',
      purpose: 'Purpose',
      duration: 'Duration',
      rows: [
        {
          name: 'mc_access',
          purpose: 'Keeps your session open (access token)',
          duration: '30 minutes',
        },
        {
          name: 'mc_refresh',
          purpose: 'Renews your session without retyping your password',
          duration: '7 days',
        },
        {
          name: 'mc_lang',
          purpose: 'Remembers your language (French or English)',
          duration: '12 months',
        },
        { name: 'mc_consent', purpose: 'Remembers your cookie choice', duration: '6 months' },
      ],
    },
  },
}
