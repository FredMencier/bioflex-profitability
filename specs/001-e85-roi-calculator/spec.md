# Feature Specification: Calculateur de rentabilité E85

**Feature Branch**: `001-e85-roi-calculator`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: « Utilise le fichier `definition application/concept.md` pour générer les spécifications. »

## Clarifications

### Session 2026-10-18

- Q: Quel coût initial l'utilisateur doit-il renseigner pour le boîtier ? → A: Le coût est renseigné par l'utilisateur; le champ propose 1 000 € par défaut.
- Q: Où le fichier JSON doit-il être conservé pour que l’application retrouve les données lors d’une prochaine visite ? → A: Sur le serveur de l'application, afin que plusieurs personnes puissent utiliser l'application depuis plusieurs appareils. Cette décision a été remplacée le 2026-10-19 par stockage local et import/export manuel.
- Q: Chaque utilisateur doit-il accéder uniquement à ses propres véhicules, ou tous les utilisateurs doivent-ils partager le même ensemble de véhicules et de pleins ? → A: Chaque personne garde ses propres données via un fichier JSON distinct, sans isolation ni authentification assurée par l'application.
- Q: Acceptez-vous des fonctions Netlify exécutées à la demande, sans serveur Node.js permanent, pour synchroniser les fichiers JSON privés entre appareils avec une authentification par email et mot de passe non-OIDC ? → A: Pages statiques sur Netlify, fonctions Netlify à la demande, fichiers JSON privés dans Netlify Blobs et authentification email/mot de passe via un service géré non-OIDC. Cette décision a été remplacée le 2026-10-19 par un hébergement GitHub Pages avec stockage local.

### Session 2026-10-19

- Q: Pour conserver des données JSON privées par utilisateur et synchronisées entre appareils sur GitHub Pages, acceptez-vous un service backend géré externe comme Firebase, avec des comptes email/mot de passe et un fichier JSON protégé pour chaque utilisateur ? → A: Option B, GitHub Pages seul avec données locales et sans synchronisation automatique entre appareils.
- Q: Comment les différentes personnes doivent-elles séparer leurs données locales sur GitHub Pages, sans compte ni backend ? → A: Chaque personne gère un fichier JSON distinct et l'importe ou l'exporte manuellement; il n'y a ni authentification dans l'application ni protection des données par compte.
- Q: Quel framework et quel langage doivent être utilisés pour l'interface statique et ses graphiques ? → A: React avec Next.js App Router, TypeScript/TSX, Tailwind CSS et Apache ECharts, exportés en fichiers statiques pour GitHub Pages.

## User Scenarios & Testing

### User Story 1 - Suivre la rentabilité d'un véhicule (Priority: P1)

En tant que propriétaire d'un véhicule équipé du boîtier Bioflex E85, je peux enregistrer le véhicule, le coût et la date d'installation du boîtier, puis saisir chaque plein E85 afin de connaître les économies réalisées et le montant restant à amortir.

**Why this priority**: Le calcul du retour sur investissement est la valeur principale de l'application. Sans les données du véhicule et de ses pleins, aucun suivi fiable n'est possible.

**Independent Test**: Créer un véhicule en renseignant le coût du boîtier (1 000 € est proposé par défaut), enregistrer un plein avec les deux prix au litre et le volume, puis vérifier les montants calculés et le cumul des économies.

**Acceptance Scenarios**:

1. **Given** un véhicule renseigné avec un coût de boîtier et une date d'installation, **When** l'utilisateur saisit un plein avec le prix au litre de l'E85, le prix au litre du SP95 et le nombre de litres, **Then** l'application enregistre le plein avec la date du jour et affiche son coût E85, son coût SP95 estimé, son économie et le restant à amortir.
2. **Given** un véhicule ayant déjà des pleins enregistrés, **When** l'utilisateur ajoute un autre plein, **Then** les économies totales incluent les économies de tous ses pleins et le montant restant est recalculé à partir du coût de son boîtier.
3. **Given** une saisie contenant un prix nul ou négatif, un volume nul ou négatif, ou un champ obligatoire manquant, **When** l'utilisateur tente d'enregistrer le plein, **Then** l'application refuse l'enregistrement et indique les champs à corriger.
4. **Given** un plein pour lequel le coût E85 est supérieur au coût SP95 estimé, **When** le plein est enregistré, **Then** l'application affiche une économie négative et l'inclut dans le cumul sans la ramener artificiellement à zéro.
5. **Given** un véhicule sans plein enregistré, **When** l'utilisateur consulte son suivi, **Then** l'application affiche des totaux nuls, le coût du boîtier restant à amortir et un état vide explicite pour l'historique.

---

### User Story 2 - Consulter l'évolution des économies (Priority: P2)

En tant que propriétaire, je peux consulter un tableau de bord et des graphiques pour comprendre les économies réalisées, leur évolution dans le temps et leur contribution à l'amortissement du boîtier.

**Why this priority**: La saisie des pleins fournit les données nécessaires au ROI; leur synthèse rend le suivi compréhensible et permet de constater le retour sur investissement.

**Independent Test**: Enregistrer plusieurs pleins à des dates différentes, puis vérifier que les totaux, la liste et les trois graphiques reflètent ces pleins et leurs calculs.

**Acceptance Scenarios**:

1. **Given** un véhicule ayant plusieurs pleins, **When** l'utilisateur ouvre son tableau de bord, **Then** il voit les économies totales, le restant à amortir et la liste des économies pour chaque plein.
2. **Given** plusieurs pleins enregistrés à des dates différentes, **When** l'utilisateur consulte le graphique cumulatif, **Then** les économies cumulées sont présentées dans l'ordre chronologique.
3. **Given** au moins un plein enregistré, **When** l'utilisateur consulte le graphique comparatif, **Then** les montants payés pour l'E85 et le SP95 estimé sont comparés pour chaque plein.
4. **Given** des dépenses E85 et des économies calculées, **When** l'utilisateur consulte le graphique circulaire, **Then** la répartition entre dépenses E85 et économies est visible et correspond aux totaux affichés.
5. **Given** que les économies cumulées atteignent ou dépassent le coût du boîtier, **When** l'utilisateur consulte son tableau de bord, **Then** le restant à amortir est affiché à zéro ou en valeur négative et l'amortissement est indiqué comme atteint.

---

### User Story 3 - Gérer plusieurs véhicules (Priority: P1)

En tant que propriétaire de plusieurs véhicules équipés, je peux enregistrer chacun d'eux et consulter son suivi séparément afin de ne pas mélanger leurs pleins ou leurs économies.

**Why this priority**: La gestion de plusieurs véhicules est une exigence centrale du concept et conditionne l'exactitude du ROI pour chaque boîtier.

**Independent Test**: Créer deux véhicules, enregistrer des pleins différents pour chacun, puis passer de l'un à l'autre et vérifier que chaque historique et chaque total restent isolés.

**Acceptance Scenarios**:

1. **Given** un véhicule déjà enregistré, **When** l'utilisateur ajoute un autre véhicule, le coût de boîtier est prérempli à 1 000 € et l'utilisateur renseigne ou confirme ce coût avec la marque, le modèle et la date d'installation, **Then** l'application conserve les deux véhicules comme suivis distincts.
2. **Given** au moins deux véhicules enregistrés, **When** l'utilisateur sélectionne un véhicule, **Then** le tableau de bord, les pleins et les économies affichés concernent uniquement ce véhicule.
3. **Given** plusieurs véhicules enregistrés, **When** un plein est ajouté au véhicule sélectionné, **Then** seuls l'historique, les économies totales et le restant à amortir de ce véhicule sont modifiés.

---

### User Story 4 - Gérer son fichier JSON local (Priority: P1)

En tant qu'utilisateur, je peux importer mon fichier JSON personnel, poursuivre mon suivi localement, puis exporter le fichier actualisé pour le sauvegarder ou l'utiliser manuellement sur un autre appareil.

**Why this priority**: Le fichier contrôlé par l'utilisateur est le moyen de conserver et transférer ses données sans compte ni service distant.

**Independent Test**: Importer un fichier valide, créer un véhicule et un plein, exporter le suivi, puis importer le fichier exporté dans un autre profil de navigateur et vérifier les mêmes données et calculs.

**Acceptance Scenarios**:

1. **Given** un utilisateur qui importe un fichier JSON valide, **When** il confirme le remplacement du jeu de données local actif, **Then** l'application charge les véhicules et les pleins du fichier.
2. **Given** un utilisateur ayant ajouté ou modifié des données, **When** il demande l'export, **Then** l'application télécharge un fichier JSON structuré contenant le jeu de données courant.
3. **Given** un fichier JSON exporté sur un autre appareil, **When** l'utilisateur l'importe manuellement, **Then** il retrouve les mêmes véhicules, pleins et calculs; aucune synchronisation automatique n'a lieu.
4. **Given** un fichier d'import mal formé ou d'une version non prise en charge, **When** l'utilisateur tente de l'importer, **Then** l'application refuse le fichier et préserve le jeu de données actif.
5. **Given** un utilisateur qui consulte les commandes de données, **When** il choisit d'importer ou d'exporter, **Then** l'application lui indique que les fichiers et données locales ne sont protégés par aucun compte et ne sont pas synchronisés.

### Edge Cases

- Un véhicule nouvellement créé ne possède encore aucun plein : afficher un état vide et le coût total restant à amortir.
- Un plein peut générer une économie négative : conserver cette valeur dans le détail et le cumul.
- Les économies cumulées peuvent dépasser le coût du boîtier : afficher le dépassement sans plafonner le cumul; le restant à amortir peut donc être négatif.
- Les prix ou le volume sont absents, nuls ou négatifs : bloquer l'enregistrement et expliquer les corrections attendues.
- Une date d'installation future est incohérente avec un suivi déjà commencé : empêcher l'enregistrement de pleins antérieurs à cette date et expliquer la règle.
- Le stockage local du navigateur est indisponible, plein ou effacé : informer l'utilisateur que ses données locales peuvent être perdues et qu'il doit réimporter son fichier JSON exporté.
- Un fichier JSON importé est mal formé, dépasse les limites prises en charge ou utilise une version inconnue : refuser l'import sans remplacer le jeu de données actif.
- L'import d'un fichier valide remplace le jeu de données actif après confirmation explicite; les données remplacées ne sont récupérables que si l'utilisateur les a exportées.
- Plusieurs pleins peuvent être enregistrés le même jour : conserver chacun comme une entrée distincte et les inclure tous dans les totaux et graphiques.
- Les montants sont affichés en euros avec deux décimales; les totaux sont calculés à partir des valeurs saisies et présentés avec un arrondi monétaire cohérent.

## Requirements

### Functional Requirements

- **FR-001**: L'application MUST permettre d'enregistrer plusieurs véhicules avec, pour chacun, une marque, un modèle, un coût d'achat du boîtier et une date d'installation.
- **FR-002**: Le coût du boîtier MUST être renseigné par l'utilisateur lors de la création du véhicule; le champ MUST proposer 1 000 € par défaut et permettre à l'utilisateur de confirmer cette valeur ou de la modifier.
- **FR-003**: L'application MUST permettre d'ajouter un plein E85 au véhicule sélectionné en saisissant le prix au litre E85, le prix au litre SP95 et le nombre de litres.
- **FR-004**: La date d'un plein MUST être renseignée automatiquement au moment de son enregistrement.
- **FR-005**: L'application MUST calculer le coût E85 d'un plein comme le prix au litre E85 multiplié par le nombre de litres.
- **FR-006**: L'application MUST calculer le coût SP95 estimé du même plein comme le prix au litre SP95 multiplié par 80 % du nombre de litres E85 saisi.
- **FR-007**: L'application MUST calculer l'économie d'un plein comme le coût SP95 estimé moins le coût E85; une économie négative MUST être conservée.
- **FR-008**: L'application MUST calculer les économies totales d'un véhicule en additionnant les économies de ses pleins enregistrés.
- **FR-009**: L'application MUST calculer le restant à amortir d'un véhicule comme son coût de boîtier moins ses économies totales, sans limiter le résultat à zéro.
- **FR-010**: L'application MUST empêcher l'enregistrement d'un véhicule sans marque, modèle, coût de boîtier ou date d'installation valides, et empêcher l'enregistrement d'un plein sans prix strictement positif et volume strictement positif.
- **FR-011**: L'application MUST empêcher l'enregistrement d'un plein daté avant l'installation du boîtier du véhicule concerné.
- **FR-012**: Le tableau de bord MUST afficher, pour le véhicule sélectionné, les économies totales, le restant à amortir et la liste des pleins avec l'économie associée à chacun.
- **FR-013**: Le tableau de bord MUST distinguer explicitement un boîtier amorti lorsque les économies cumulées sont égales ou supérieures à son coût.
- **FR-014**: L'application MUST présenter un graphique linéaire des économies cumulées au fil du temps pour le véhicule sélectionné.
- **FR-015**: L'application MUST présenter un graphique en barres comparant le coût E85 et le coût SP95 estimé pour chaque plein du véhicule sélectionné.
- **FR-016**: L'application MUST présenter un graphique circulaire représentant la répartition des dépenses E85 et des économies cumulées du véhicule sélectionné.
- **FR-017**: Les données, historiques, totaux et graphiques MUST être conservés localement sur l'appareil et dans le profil de navigateur utilisés; aucune synchronisation automatique entre appareils MUST être présentée.
- **FR-018**: Les montants affichés MUST être exprimés en euros et présentés avec deux décimales.
- **FR-019**: L'application MUST conserver le jeu de données actif localement sous une structure JSON persistante et MUST permettre d'importer et d'exporter un fichier JSON complet par utilisateur.
- **FR-020**: L'application MUST fonctionner sans compte distant, service d'identité externe, authentification OIDC ou fonction serverless.
- **FR-022**: L'interface MUST être constituée de pages statiques déployables sur GitHub Pages et MUST fonctionner sans serveur d'application.
- **FR-023**: L'import d'un fichier JSON MUST valider sa structure et sa version avant toute modification du jeu de données actif; un import invalide MUST laisser les données actives inchangées.
- **FR-024**: L'application MUST indiquer que l'accès au jeu de données local n'est pas protégé par un compte et que la confidentialité dépend de la sécurité de l'appareil, du profil de navigateur et du fichier exporté.
- **FR-025**: L'interface MUST utiliser React avec Next.js App Router; ses composants MUST être écrits en TypeScript avec syntaxe JSX dans des fichiers `.tsx`, être stylés avec Tailwind CSS et être exportés par Next.js en fichiers statiques déployables sur GitHub Pages sans backend.
- **FR-026**: Les graphiques linéaire, en barres et circulaire MUST être rendus avec Apache ECharts et refléter les données du véhicule sélectionné.

### Key Entities

- **Véhicule** : véhicule suivi, identifié par sa marque et son modèle, avec un coût de boîtier et une date d'installation; possède un historique de pleins.
- **Plein E85** : plein associé à un seul véhicule, avec date d'enregistrement, prix au litre E85, prix au litre SP95 et volume; ses coûts et son économie sont calculés à partir de ces informations.
- **Suivi de rentabilité** : synthèse propre à un véhicule comprenant les économies cumulées, le coût du boîtier restant à amortir et les données présentées dans les graphiques.
- **Ensemble de données local** : structure JSON persistée dans le stockage du navigateur sur un appareil et non liée à un compte distant.
- **Fichier de données JSON** : document structuré complet associé à une personne par convention; l'utilisateur le garde, l'importe et l'exporte manuellement.
- **Jeu de données local actif** : copie de travail du fichier JSON persistant dans le navigateur courant, sans authentification ni synchronisation distante.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un utilisateur peut créer un véhicule et saisir son premier plein en moins de 3 minutes, sans aide extérieure.
- **SC-002**: Pour tous les pleins de test, le coût E85, le coût SP95 estimé, l'économie et le restant à amortir correspondent aux formules spécifiées, à un centime près à l'affichage.
- **SC-003**: Dans un test avec plusieurs véhicules, 100 % des pleins et économies sont attribués au véhicule auquel ils ont été saisis; aucun total affiché ne mélange les véhicules.
- **SC-004**: Au moins 90 % des utilisateurs testés identifient en moins de 30 secondes les économies cumulées et si le boîtier du véhicule affiché est amorti.
- **SC-005**: Après une nouvelle visite depuis le même appareil et profil de navigateur, l'utilisateur retrouve tous les véhicules et pleins précédemment enregistrés, avec les mêmes totaux et graphiques.
- **SC-006**: Dans tous les scénarios de test d'export puis d'import valide, 100 % des véhicules, pleins et résultats calculés sont conservés; un fichier invalide ne modifie jamais le jeu de données actif.

## Assumptions

- Chaque personne conserve son propre fichier JSON et le choisit explicitement lors de l'import; l'application ne vérifie pas que le fichier appartient à cette personne.
- L'application conserve automatiquement le jeu de données actif dans le stockage du navigateur courant; l'utilisateur doit exporter le fichier JSON pour sauvegarde ou transfert vers un autre appareil.
- Il n'existe ni compte distant, ni authentification dans l'application, ni synchronisation automatique; les autres personnes ayant accès au même navigateur ou fichier peuvent consulter les données.
- Pour chaque nouveau véhicule, le coût du boîtier est renseigné par l'utilisateur; le champ propose 1 000 € par défaut, valeur que l'utilisateur peut confirmer ou modifier.
- La formule « nombre de litres - 20 % » du concept signifie que le SP95 estimé utilise 80 % du volume E85 saisi, pour une comparaison indicative du même plein.
- Les économies peuvent être négatives et le cumul peut dépasser le prix du boîtier; aucun plafond ou seuil artificiel n'est appliqué aux valeurs calculées.
- Le graphique circulaire répartit le coût estimé de référence entre les dépenses E85 réellement saisies et les économies calculées; si aucune donnée n'est disponible, l'application présente un état vide plutôt qu'une répartition trompeuse.
- Les pleins sont saisis après leur réalisation; leur date est la date courante au moment de l'enregistrement et n'est pas modifiable dans ce périmètre.
- Les calculs sont un outil d'estimation de rentabilité et ne constituent pas une comptabilité ou une mesure certifiée de consommation.
- L'interface est déployée sous forme de pages statiques sur GitHub Pages; aucun backend ni service distant de stockage ou d'authentification n'est utilisé.
- Les informations sont conservées dans un jeu de données local et peuvent être transférées entre appareils uniquement par import/export manuel de fichiers JSON.
