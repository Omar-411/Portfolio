import type { Localized } from "@/i18n/config";

/**
 * System design write-ups. These describe architectures and the reasoning behind them:
 * keep them honest about what is a design and what is shipped (see `status`).
 */
export type NodeKind = "client" | "service" | "data" | "external";

export interface DiagramNode {
  id: string;
  kind: NodeKind;
  label: Localized<string>;
  sub?: Localized<string>;
}

export interface DiagramLayer {
  title: Localized<string>;
  nodes: DiagramNode[];
}

export interface Decision {
  title: Localized<string>;
  why: Localized<string>;
  tradeoff: Localized<string>;
}

export interface SystemDesign {
  slug: string;
  name: Localized<string>;
  /** "design" = architecture I designed; "client" = real client work, shown without client details. */
  status: "design" | "client";
  summary: Localized<string>;
  stack: string[];
  layers: DiagramLayer[];
  /** Pairs of node ids, drawn left to right. */
  edges: [string, string][];
  decisions: Decision[];
}

const t = (en: string, fr: string): Localized<string> => ({ en, fr });

export const systems: SystemDesign[] = [
  {
    slug: "gym-saas",
    name: t("Multi-tenant gym management SaaS", "SaaS multi-tenant de gestion de salles de sport"),
    status: "design",
    summary: t(
      "One platform serving many independent gyms, each with its own members, trainers and class schedule. Scheduling is the core feature; billing and reminders build on it.",
      "Une seule plateforme au service de nombreuses salles indépendantes, chacune avec ses adhérents, ses coachs et son planning de cours. Le planning est la fonctionnalité centrale ; la facturation et les rappels s'appuient dessus."
    ),
    stack: ["Node.js", "Express", "MongoDB", "Redis", "React"],
    layers: [
      {
        title: t("Clients", "Clients"),
        nodes: [
          { id: "gym-member", kind: "client", label: t("Member app", "App adhérent"), sub: t("PWA", "PWA") },
          { id: "gym-owner", kind: "client", label: t("Owner dashboard", "Tableau de bord"), sub: t("per gym", "par salle") },
        ],
      },
      {
        title: t("API", "API"),
        nodes: [
          { id: "gym-api", kind: "service", label: t("Node.js API", "API Node.js"), sub: t("modular monolith", "monolithe modulaire") },
        ],
      },
      {
        title: t("Modules", "Modules"),
        nodes: [
          { id: "gym-auth", kind: "service", label: t("Auth & tenants", "Auth & tenants") },
          { id: "gym-sched", kind: "service", label: t("Scheduling", "Planning"), sub: t("classes · trainers", "cours · coachs") },
          { id: "gym-bill", kind: "service", label: t("Memberships", "Abonnements"), sub: t("plans · payments", "forfaits · paiements") },
          { id: "gym-notify", kind: "service", label: t("Notifications", "Notifications") },
        ],
      },
      {
        title: t("Data", "Données"),
        nodes: [
          { id: "gym-db", kind: "data", label: t("MongoDB", "MongoDB"), sub: t("tenantId on every document", "tenantId sur chaque document") },
          { id: "gym-queue", kind: "data", label: t("Redis queue", "File Redis"), sub: t("reminders · renewals", "rappels · renouvellements") },
        ],
      },
      {
        title: t("External", "Externe"),
        nodes: [
          { id: "gym-sms", kind: "external", label: t("SMS / WhatsApp", "SMS / WhatsApp") },
          { id: "gym-pay", kind: "external", label: t("Payment gateway", "Passerelle de paiement") },
        ],
      },
    ],
    edges: [
      ["gym-member", "gym-api"],
      ["gym-owner", "gym-api"],
      ["gym-api", "gym-auth"],
      ["gym-api", "gym-sched"],
      ["gym-api", "gym-bill"],
      ["gym-api", "gym-notify"],
      ["gym-auth", "gym-db"],
      ["gym-sched", "gym-db"],
      ["gym-bill", "gym-db"],
      ["gym-notify", "gym-queue"],
      ["gym-queue", "gym-sms"],
      ["gym-bill", "gym-pay"],
    ],
    decisions: [
      {
        title: t("One shared database, tenantId on every document", "Une base partagée, tenantId sur chaque document"),
        why: t(
          "Hundreds of small gyms means cheap onboarding, one schema to migrate and one thing to back up.",
          "Des centaines de petites salles imposent un onboarding peu coûteux, un seul schéma à migrer et une seule sauvegarde."
        ),
        tradeoff: t(
          "Isolation depends on code. All queries go through a tenant-scoped repository and are covered by tests; a large chain can later move to its own database.",
          "L'isolation dépend du code. Toutes les requêtes passent par un repository limité au tenant et sont couvertes par des tests ; une grande chaîne pourra plus tard avoir sa propre base."
        ),
      },
      {
        title: t("Modular monolith, not microservices", "Monolithe modulaire, pas de microservices"),
        why: t(
          "A small team ships faster with one deployable. Modules (scheduling, billing, notifications) have clear boundaries so they can be split out later.",
          "Une petite équipe livre plus vite avec un seul déploiement. Les modules (planning, facturation, notifications) ont des frontières claires pour être extraits plus tard."
        ),
        tradeoff: t(
          "Everything scales together. That is fine for this load, and cheaper to run until it is not.",
          "Tout évolue ensemble. C'est acceptable pour cette charge, et moins cher à exploiter jusqu'à ce que ça ne le soit plus."
        ),
      },
      {
        title: t("Scheduling first, with atomic bookings", "Planning d'abord, avec des réservations atomiques"),
        why: t(
          "Class and trainer scheduling is the wedge feature. A booking decrements capacity in a single conditional update, so two members can never take the last spot.",
          "Le planning des cours et des coachs est la fonctionnalité d'entrée. Une réservation décrémente la capacité en une seule mise à jour conditionnelle : deux adhérents ne peuvent jamais prendre la dernière place."
        ),
        tradeoff: t(
          "Waitlist promotion adds logic (who gets a freed spot, and when). It is worth it: full classes are where gyms lose money.",
          "La promotion de la liste d'attente ajoute de la logique (qui obtient une place libérée, et quand). Ça en vaut la peine : les cours complets sont là où les salles perdent de l'argent."
        ),
      },
      {
        title: t("Background queue for reminders and renewals", "File d'attente pour les rappels et renouvellements"),
        why: t(
          "Reminders and subscription renewals must not slow down requests or be lost on a restart.",
          "Les rappels et les renouvellements ne doivent ni ralentir les requêtes ni se perdre lors d'un redémarrage."
        ),
        tradeoff: t(
          "One more piece of infrastructure to run and monitor.",
          "Une brique d'infrastructure de plus à exploiter et à surveiller."
        ),
      },
      {
        title: t("Payments behind an interface", "Paiements derrière une interface"),
        why: t(
          "Gyms in Tunisia often take cash or local payment methods. The billing module records payments first and talks to a gateway through an interface, so a local provider can be added without touching the rest.",
          "Les salles en Tunisie encaissent souvent en espèces ou via des moyens locaux. Le module d'abonnements enregistre d'abord les paiements et parle à une passerelle via une interface : on peut ajouter un prestataire local sans toucher au reste."
        ),
        tradeoff: t(
          "Reconciling cash and online payments needs clear states per invoice.",
          "Rapprocher espèces et paiements en ligne demande des états clairs par facture."
        ),
      },
    ],
  },
  {
    slug: "betting-platform",
    name: t("Betting platform: sportsbook and casino", "Plateforme de paris : sportsbook et casino"),
    status: "design",
    summary: t(
      "A design exercise for a platform with live sports odds and casino games. The hard parts are money correctness and live data, not the screens. Not a live product.",
      "Un exercice de conception pour une plateforme avec cotes sportives en direct et jeux de casino. Les difficultés sont la justesse de l'argent et les données en direct, pas les écrans. Pas un produit en ligne."
    ),
    stack: ["Node.js", "PostgreSQL", "Redis", "WebSocket", "React"],
    layers: [
      {
        title: t("Client", "Client"),
        nodes: [{ id: "bet-web", kind: "client", label: t("Web app", "App web"), sub: t("bet slip · live odds", "ticket · cotes live") }],
      },
      {
        title: t("Edge", "Accès"),
        nodes: [{ id: "bet-gw", kind: "service", label: t("API gateway", "Passerelle API"), sub: t("REST + WebSocket", "REST + WebSocket") }],
      },
      {
        title: t("Services", "Services"),
        nodes: [
          { id: "bet-sports", kind: "service", label: t("Sportsbook", "Sportsbook"), sub: t("markets · settlement", "marchés · règlement") },
          { id: "bet-casino", kind: "service", label: t("Casino", "Casino"), sub: t("game sessions", "sessions de jeu") },
        ],
      },
      {
        title: t("Core & integrations", "Cœur & intégrations"),
        nodes: [
          { id: "bet-feed", kind: "external", label: t("Odds & results feed", "Flux cotes & résultats") },
          { id: "bet-redis", kind: "data", label: t("Redis", "Redis"), sub: t("odds cache · pub/sub", "cache cotes · pub/sub") },
          { id: "bet-queue", kind: "data", label: t("Job queue", "File de jobs"), sub: t("settlement", "règlement") },
          { id: "bet-wallet", kind: "service", label: t("Wallet & ledger", "Portefeuille & registre"), sub: t("every movement", "chaque mouvement") },
          { id: "bet-provider", kind: "external", label: t("Casino game provider", "Fournisseur de jeux") },
        ],
      },
      {
        title: t("Storage", "Stockage"),
        nodes: [{ id: "bet-pg", kind: "data", label: t("PostgreSQL", "PostgreSQL"), sub: t("double-entry ledger", "registre en partie double") }],
      },
    ],
    edges: [
      ["bet-web", "bet-gw"],
      ["bet-gw", "bet-sports"],
      ["bet-gw", "bet-casino"],
      ["bet-sports", "bet-feed"],
      ["bet-sports", "bet-redis"],
      ["bet-sports", "bet-queue"],
      ["bet-sports", "bet-wallet"],
      ["bet-casino", "bet-wallet"],
      ["bet-casino", "bet-provider"],
      ["bet-wallet", "bet-pg"],
    ],
    decisions: [
      {
        title: t("A double-entry ledger, not a balance column", "Un registre en partie double, pas une colonne de solde"),
        why: t(
          "Every bet, win and refund is a pair of entries that always sums to zero. Any balance can be rebuilt and audited, and money cannot silently appear or vanish.",
          "Chaque pari, gain et remboursement est une paire d'écritures dont la somme est toujours nulle. Tout solde peut être reconstruit et audité, et l'argent ne peut ni apparaître ni disparaître en silence."
        ),
        tradeoff: t(
          "More tables and heavier queries than a single balance. PostgreSQL transactions make it safe, and a cached balance keeps reads fast.",
          "Plus de tables et des requêtes plus lourdes qu'un simple solde. Les transactions PostgreSQL le rendent sûr, et un solde en cache garde les lectures rapides."
        ),
      },
      {
        title: t("Idempotency keys on every money movement", "Clés d'idempotence sur chaque mouvement d'argent"),
        why: t(
          "Networks retry. A repeated request with the same key returns the first result instead of charging twice.",
          "Les réseaux réessaient. Une requête répétée avec la même clé renvoie le premier résultat au lieu de débiter deux fois."
        ),
        tradeoff: t(
          "Keys must be stored and expired, and every client has to send them.",
          "Les clés doivent être stockées et expirées, et chaque client doit les envoyer."
        ),
      },
      {
        title: t("Odds from a feed, cached in Redis, pushed over WebSocket", "Cotes issues d'un flux, en cache Redis, poussées par WebSocket"),
        why: t(
          "Live odds change every few seconds. Pushing beats polling, and the cache protects the feed and the database.",
          "Les cotes en direct changent toutes les quelques secondes. Pousser vaut mieux que sonder, et le cache protège le flux et la base."
        ),
        tradeoff: t(
          "A bet slip can hold stale odds. Each odds value carries a version: if it changed, the bet is rejected with the new price instead of being accepted at the old one.",
          "Un ticket peut contenir des cotes périmées. Chaque cote porte une version : si elle a changé, le pari est refusé avec le nouveau prix au lieu d'être accepté à l'ancien."
        ),
      },
      {
        title: t("Casino games from a provider, over signed webhooks", "Jeux de casino via un fournisseur, par webhooks signés"),
        why: t(
          "A fair random engine needs certification. Integrating a provider means bet, win and rollback callbacks that the wallet handles idempotently.",
          "Un moteur aléatoire équitable nécessite une certification. Intégrer un fournisseur signifie des callbacks de mise, gain et annulation que le portefeuille traite de façon idempotente."
        ),
        tradeoff: t(
          "Dependence on the provider and its fees. Webhook signatures are verified and replays are ignored.",
          "Dépendance au fournisseur et à ses frais. Les signatures des webhooks sont vérifiées et les rejeux ignorés."
        ),
      },
      {
        title: t("Settlement as asynchronous jobs", "Règlement par jobs asynchrones"),
        why: t(
          "When a match ends, thousands of bets settle at once. A queue spreads the load and lets a failed job retry without double-paying.",
          "Quand un match se termine, des milliers de paris se règlent en même temps. Une file répartit la charge et permet à un job en échec de réessayer sans payer deux fois."
        ),
        tradeoff: t(
          "Winnings appear a few seconds after the result, not instantly.",
          "Les gains apparaissent quelques secondes après le résultat, pas instantanément."
        ),
      },
    ],
  },
  {
    slug: "document-pipeline",
    name: t("Document extraction pipeline", "Pipeline d'extraction de documents"),
    status: "client",
    summary: t(
      "Turns uploaded contracts and invoices into clean, structured data that other checks can trust, whatever the language or the extraction engine behind it.",
      "Transforme des contrats et factures téléversés en données structurées fiables pour d'autres contrôles, quelle que soit la langue ou le moteur d'extraction."
    ),
    stack: ["Node.js", "Azure Document Intelligence", "IPFS", "LLM"],
    layers: [
      {
        title: t("Client", "Client"),
        nodes: [{ id: "doc-client", kind: "client", label: t("Client app", "App cliente") }],
      },
      {
        title: t("Ingest", "Réception"),
        nodes: [{ id: "doc-api", kind: "service", label: t("Upload API", "API de dépôt"), sub: t("validates · creates a job", "valide · crée un job") }],
      },
      {
        title: t("Prepare", "Préparation"),
        nodes: [
          { id: "doc-store", kind: "data", label: t("File storage", "Stockage"), sub: t("+ IPFS pinning", "+ pin IPFS") },
          { id: "doc-lang", kind: "service", label: t("Language detection", "Détection de langue") },
        ],
      },
      {
        title: t("Extractors", "Extracteurs"),
        nodes: [
          { id: "doc-azure", kind: "external", label: t("Azure Document Intelligence", "Azure Document Intelligence") },
          { id: "doc-llm", kind: "external", label: t("LLM extractor", "Extracteur LLM"), sub: t("contracts", "contrats") },
        ],
      },
      {
        title: t("Normalize", "Normalisation"),
        nodes: [{ id: "doc-norm", kind: "service", label: t("Normalizer", "Normaliseur"), sub: t("to document schema", "vers le schéma") }],
      },
      {
        title: t("Result", "Résultat"),
        nodes: [{ id: "doc-result", kind: "data", label: t("Result store", "Stockage résultat"), sub: t("status · data", "statut · données") }],
      },
    ],
    edges: [
      ["doc-client", "doc-api"],
      ["doc-api", "doc-store"],
      ["doc-api", "doc-lang"],
      ["doc-store", "doc-azure"],
      ["doc-lang", "doc-azure"],
      ["doc-lang", "doc-llm"],
      ["doc-azure", "doc-norm"],
      ["doc-llm", "doc-norm"],
      ["doc-norm", "doc-result"],
    ],
    decisions: [
      {
        title: t("Extractors behind one interface", "Extracteurs derrière une seule interface"),
        why: t(
          "Azure handles invoices well; contracts benefit from an LLM. A common interface lets each document type use the best engine, and lets the client compare or replace them.",
          "Azure gère bien les factures ; les contrats profitent d'un LLM. Une interface commune permet à chaque type de document d'utiliser le meilleur moteur, et au client de les comparer ou de les remplacer."
        ),
        tradeoff: t(
          "The interface can only expose what every engine provides, so engine-specific extras need a deliberate escape hatch.",
          "L'interface ne peut exposer que ce que tous les moteurs fournissent : les options propres à un moteur demandent une porte de sortie explicite."
        ),
      },
      {
        title: t("Normalize right after extraction", "Normaliser juste après l'extraction"),
        why: t(
          "Every engine returns a different shape. Mapping each one to the agreed document schema immediately means the rest of the system never sees a vendor format.",
          "Chaque moteur renvoie une forme différente. Les convertir tout de suite vers le schéma de document convenu évite que le reste du système voie un format propre à un fournisseur."
        ),
        tradeoff: t(
          "A mapping to write and maintain per engine and per document type.",
          "Un mapping à écrire et à maintenir par moteur et par type de document."
        ),
      },
      {
        title: t("Keep the original, referenced by its hash", "Conserver l'original, référencé par son hash"),
        why: t(
          "Pinning the file on IPFS gives it a content address: anyone can prove the file behind a result was not changed afterwards.",
          "Épingler le fichier sur IPFS lui donne une adresse de contenu : on peut prouver que le fichier derrière un résultat n'a pas été modifié ensuite."
        ),
        tradeoff: t(
          "IPFS content is public by default, so sensitive files must be encrypted before pinning. Pinning also has a cost.",
          "Le contenu IPFS est public par défaut : les fichiers sensibles doivent être chiffrés avant d'être épinglés. L'épinglage a aussi un coût."
        ),
      },
      {
        title: t("Detect the language before extracting", "Détecter la langue avant d'extraire"),
        why: t(
          "Documents arrive in several languages. Knowing the language first lets the pipeline choose the right model settings.",
          "Les documents arrivent en plusieurs langues. Connaître la langue d'abord permet de choisir les bons réglages de modèle."
        ),
        tradeoff: t(
          "A detection error cascades into extraction, so low-confidence results fall back to a multilingual setting.",
          "Une erreur de détection se propage à l'extraction : les résultats peu fiables basculent vers un réglage multilingue."
        ),
      },
      {
        title: t("Asynchronous jobs with a status", "Jobs asynchrones avec un statut"),
        why: t(
          "OCR takes seconds. The upload returns a job id right away and the client polls or is notified, so large files never block a request.",
          "L'OCR prend plusieurs secondes. Le dépôt renvoie tout de suite un identifiant de job et le client interroge ou est notifié : les gros fichiers ne bloquent jamais une requête."
        ),
        tradeoff: t(
          "More states to model: queued, processing, done, failed.",
          "Plus d'états à modéliser : en attente, en cours, terminé, échoué."
        ),
      },
    ],
  },
];
