Je veux une application web permettant de calculer le retour sur investissement de mon boitier bioflex E85. L'application doit pouvoir gérer plusieurs véhicules.

## Fonctionnalités clés

- **Calculateur de ROI**: Saisir le coût d'achat du boitier et les pleins d'essences pour obtenir le retour sur investissement

- **Definition du véhicule**:
    - Marque et modèle

- **Informations à saisir une seule fois**:
    - Coût d'achat du boitier (957.60)
    - Date d'installation du boitier

- **Informations à chaque plein d'essence E85**:
    - Date du plein : Automatique au moment de la saisie
    - Prix au litre du E85
    - Prix au litre du SP95
    - Nombre de litres

- **Informations à calculées**:
    - Prix payé pour le plein de E85 = Prix au litre du E85 * Nombre de litres
    - Prix payé pour le plein de SP95 = Prix au litre du SP95 * (Nombre de litres -20%)
    - Economie pour ce plein = Prix payé pour le plein de SP95 - Prix payé pour le plein de E85
    - Reste à amortir : Coût d'achat du boitier - Économies totales

- **Tableau de bord**:
    - Visualisation des économies totales ainsi que la liste des économies par plein d'essence
    - Visualisation du restant à amortir

- **Graphiques**:
    - Graphique linéaire des économies cumulatives au fil du temps
    - Graphique en barres comparant le prix payé pour l'E85 vs le SP95 à chaque plein
    - Graphique circulaire représentant la répartition des coûts et économies
