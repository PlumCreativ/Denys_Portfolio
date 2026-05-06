# Pluvitec Tools

Outil Python de traitement et de croisement de données Excel pour la génération de fichiers d'importation dans **Odoo ERP**. Le système fusionne quatre sources de données Excel (produits, articles, ouvrages, mapping) via la clé `IdBatAppli`, puis génère des fichiers d'import prêts à être chargés dans Odoo.

---

## Table des matières

1. [Contexte métier](#contexte-métier)
2. [Technologies utilisées](#technologies-utilisées)
3. [Architecture du projet](#architecture-du-projet)
4. [Structure des fichiers](#structure-des-fichiers)
5. [Classes principales](#classes-principales)
6. [Modules d'infrastructure](#modules-dinfrastructure)
7. [Commandes disponibles (Actions)](#commandes-disponibles-actions)
8. [Intégration Odoo (API XML-RPC)](#intégration-odoo-api-xml-rpc)
9. [Flux de données](#flux-de-données)
10. [Configuration et variables d'environnement](#configuration-et-variables-denvironnement)
11. [Installation et démarrage](#installation-et-démarrage)
12. [Fichiers d'entrée / sortie](#fichiers-dentrée--sortie)

---

## Contexte métier

Pluvitec est une entreprise du secteur de la construction (étanchéité, toiture). Ses données produits sont gérées dans deux systèmes :

- **BatAppli** : logiciel métier contenant le catalogue d'articles et d'ouvrages (prix, unités, compositions).
- **Odoo** : ERP centralisant les produits, nomenclatures (BoM), fournisseurs et prix.

L'objectif de cet outil est de **synchroniser les données de BatAppli vers Odoo** en générant des fichiers Excel d'importation standardisés, compatibles avec le module d'import natif d'Odoo.

---

## Technologies utilisées

| Technologie | Version | Rôle |
|---|---|---|
| **Python** | 3.x | Langage principal |
| **pandas** | 3.0.0 | Lecture et manipulation des fichiers Excel |
| **openpyxl** | 3.1.5 | Écriture Excel avancée (filtres, colonnes, freeze panes) |
| **python-dotenv** | 1.2.1 | Chargement de la configuration depuis `.env` |
| **xmlrpc.client** | stdlib | Communication avec l'API XML-RPC d'Odoo |
| **argparse** | stdlib | Interface en ligne de commande (CLI) |
| **logging** | stdlib | Système de logs console + fichier |
| **json** | stdlib | Sérialisation des données intermédiaires |
| **black** | 26.1.0 | Formateur de code |

---

## Architecture du projet

Le projet suit une **architecture orientée commandes (Action Pattern)** :

```
main.py  →  argparse subcommands  →  actions/<commande>.py
                                         ├── register()   ← déclare la commande CLI
                                         └── run()        ← exécute la logique
```

Chaque module d'action est **découvert dynamiquement** au démarrage via `pkgutil.iter_modules`, ce qui permet d'ajouter une nouvelle commande sans modifier `main.py`.

### Schéma de flux général

```
Fichiers Excel (BatAppli)          API Odoo (XML-RPC)
        │                                  │
        ▼                                  ▼
  Articles / Ouvrages             export_odoo_products()
  Mapping (clé IdBatAppli)        get_boms_with_costs()
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
             Action (generate_*)
                       │
                       ▼
         Fichier Excel d'import → Output/
```

---

## Structure des fichiers

```
client-pluvitec-tools/
│
├── main.py                        # Point d'entrée CLI, chargement dynamique des actions
├── API_Odoo.py                    # Client XML-RPC Odoo (authentification, recherche, export)
├── Articles.py                    # Classe de chargement des articles BatAppli (Excel)
├── Ouvrages.py                    # Classe de chargement des ouvrages BatAppli (Excel)
├── Mapping.py                     # Classe de chargement du mapping Odoo ↔ BatAppli (Excel)
├── product_service.py             # Fonctions métier (conversions, calculs de coûts)
├── logger.py                      # Configuration du système de logging synchrone
├── utils.py                       # Utilitaires : export Excel, export JSON, log des args
├── requirements.txt               # Dépendances Python
├── .env                           # Variables d'environnement (non versionné)
│
├── actions/                       # Modules de commandes CLI
│   ├── __init__.py                # Chargement dynamique des modules
│   ├── gen_bom_import.py          # Génération du fichier d'import BoM Odoo
│   ├── gen_provider_price_import.py  # Génération des prix fournisseurs
│   ├── gen_article_cost_price_import.py  # Mise à jour des coûts articles (standard_price)
│   ├── gen_article_sell_price_import.py  # Mise à jour des prix de vente (list_price)
│   ├── gen_bom_price_analysis.py  # Analyse des prix BoM via Odoo
│   ├── gen_odoo_analysis.py       # Analyse complète Odoo (produits + BoM)
│   ├── product_analysis.py        # Analyse qualité des produits Odoo
│   └── action_exemple.py          # Template d'exemple pour de nouvelles actions
│
├── Excel/
│   ├── Import/                    # Fichiers source BatAppli (.xlsx)
│   └── Tests/                     # Jeux de données de test
│
├── Output/                        # Fichiers générés (Excel d'import, JSON)
│   ├── OdooApiProducts.json
│   ├── OdooApiResult.json
│   └── OdooApiResultTemplateIds.json
│
└── logs/
    └── Log_Generation_BoM.log     # Log applicatif
```

---

## Classes principales

### `Articles` — `Articles.py`

Charge la feuille **« Liste des articles BatAppli »** du fichier Excel BatAppli.

| Méthode | Description |
|---|---|
| `__init__(excel_file, sheet_name)` | Charge le fichier Excel via pandas |
| `load_data()` | Lit le fichier et logue les colonnes et le nombre de lignes |
| `get_articles_dict()` | Retourne un `dict[IdBatAppli → dict]` avec toutes les colonnes de chaque article |

Colonnes clés utilisées : `IdBatAppli`, `Prix Dalalu Ratio`, `Prix achat HT`, `Ref Catalogue Dalalu`, `Desc Dalalu`, `Ratio Pluvitec / Dalalu`.

---

### `Ouvrages` — `Ouvrages.py`

Charge la feuille **« Liste des ouvrages »** du fichier Excel BatAppli. Un ouvrage est composé de plusieurs articles.

| Méthode | Description |
|---|---|
| `__init__(excel_file, sheet_name)` | Charge le fichier Excel via pandas |
| `load_data()` | Lit le fichier et logue les colonnes et le nombre de lignes |
| `get_ouvrages_dict()` | Retourne un `dict[IdBatAppli → dict]` où chaque ouvrage contient sa liste d'articles dans la clé `Articles_liste` |

**Logique de parsing** : Le fichier Excel entremêle les lignes d'ouvrages et d'articles. La méthode `get_ouvrages_dict()` identifie les ouvrages par la colonne `Taux de TVA` (valeur `"20,00 %"`) et regroupe les lignes suivantes comme articles jusqu'au prochain ouvrage.

---

### `Mapping` — `Mapping.py`

Charge le fichier de correspondance entre les **IDs produits Odoo** et les **identifiants BatAppli** (`IdBatAppli`).

| Méthode | Description |
|---|---|
| `__init__(excel_file, sheet_name)` | Charge le fichier Excel via pandas |
| `load_data()` | Lit le fichier et logue les méta-données |
| `get_mappings_dict()` | Retourne un `dict[id_odoo → dict]` avec le champ `IdBatAppli` et les autres colonnes |

Ce fichier est la **clé de voûte** de la jointure : il fait le pont entre le monde Odoo (ID interne) et le monde BatAppli (`IdBatAppli`).

---

### `OdooAPI` — `API_Odoo.py`

Client XML-RPC pour l'instance Odoo. L'authentification est effectuée **automatiquement** à l'instanciation.

| Méthode | Description |
|---|---|
| `__init__(url, db, username, api_key)` | Initialise et authentifie via `xmlrpc/2/common` |
| `_authenticate()` | Connexion XML-RPC, stocke `uid` et proxy `models` |
| `_execute(model, method, *args)` | Appel générique `execute_kw` sur n'importe quel modèle Odoo |
| `search(model, domain, **kwargs)` | Recherche d'IDs via domaine Odoo |
| `search_read(model, domain, fields)` | Recherche + lecture des champs en une requête |
| `export_data(model, ids, fields)` | Export formaté en liste de dicts (comme l'export natif Odoo) |
| `export_odoo_products()` | Export complet des `product.template` avec tous leurs champs (prix, fournisseurs, variantes…). Sauvegarde les résultats en JSON et Excel. |
| `get_boms_with_costs(filters)` | Récupère les BoM (`mrp.bom`) et leurs composants (`mrp.bom.line`) avec les prix |

**Modèles Odoo interrogés :**
- `product.template` — Gabarit de produit
- `mrp.bom` — Nomenclature (Bill of Materials)
- `mrp.bom.line` — Ligne de nomenclature (composant)

---

## Modules d'infrastructure

### `logger.py` — Logging synchrone

Système de logging dual (console + fichier) avec **flush immédiat** après chaque message, garantissant la visibilité en temps réel.

| Fonction | Description |
|---|---|
| `initialize_project_logging()` | Initialise handlers fichier (`logs/Log_Generation_BoM.log`) et console, configure le flush synchrone |
| `get_logger(name)` | Retourne un logger synchrone nommé (wrapping de `logging.getLogger`) |
| `make_logger_synchronous(logger)` | Monkey-patch du `handle()` pour forcer le flush après chaque log |
| `configure_all_loggers_sync()` | Rend tous les loggers existants et futurs synchrones via un hook sur `logging.getLogger` |

Format des logs : `%(asctime)s - %(name)s - %(levelname)s - %(message)s`

---

### `utils.py` — Utilitaires communs

| Fonction | Description |
|---|---|
| `get_output_path()` | Retourne le `Path("Output")` standard |
| `log_args(args)` | Logue les paramètres CLI (`command`, `func`, autres arguments triés alphabétiquement) |
| `json_export(data, name, file_path)` | Sérialise en JSON UTF-8 indenté avec log de confirmation |
| `excel_export(data_list, file_path)` | Exporte une liste de dicts vers un fichier Excel (appelle `excel_sheet_export`) |
| `excel_sheet_export(data_dict, file_path)` | Export multi-feuilles : freeze panes, auto-filter, ajustement automatique de la largeur des colonnes (min 8, max 50) |

---

### `product_service.py` — Logique métier produit

| Fonction | Description |
|---|---|
| `convert_to_odoo_quantities(quantite)` | Normalise les quantités (str avec virgule/espace → float) |
| `convert_to_odoo_units(unit)` | Convertit les unités BatAppli en unités Odoo : `H→h`, `ML→m`, `U→u`, `M²→m²` |
| `calculer_cout_ouvrages(articles_liste, articles_dict)` | Calcule le coût total d'un ouvrage : `∑(prix × quantité)` pour chaque article. Priorité : `New_Price` > `Prix achat HT` |
| `perform_product_analysis(odoo_products)` | Analyse qualité : détecte les produits Odoo avec des noms en doublon (> 2 occurrences) |

---

## Commandes disponibles (Actions)

Toutes les commandes s'exécutent avec :

```zsh
python main.py <commande>
```

### `gen_bom_import`

**Fichier :** `actions/gen_bom_import.py`  
**Sortie :** `Output/BomImport.xlsx`

Génère le fichier d'import des **nomenclatures (BoM)** pour Odoo.

**Flux :**
1. Charge `Mapping`, `Articles`, `Ouvrages` depuis Excel BatAppli
2. Exporte tous les produits Odoo via `OdooAPI.export_odoo_products()`
3. Pour chaque produit Odoo non-Service :
   - Cherche le mapping → `IdBatAppli` → données d'ouvrage
   - Pour chaque article de l'ouvrage → cherche le mapping inverse → produit Odoo correspondant
   - Génère les lignes `bom_line_ids/product_id/id`, `bom_line_ids/product_qty`, `bom_line_ids/product_uom_id`
4. Log du ratio ouvrages valides / invalides

---

### `gen_provider_price_import`

**Fichier :** `actions/gen_provider_price_import.py`  
**Sortie :** `Output/ProviderPriceImport.xlsx`

Génère le fichier d'import des **prix fournisseurs** (`seller_ids`).

**Logique spécifique DALALU :**
- Vérifie la présence de `Ref Catalogue Dalalu`
- Renseigne `seller_ids/product_code`, `seller_ids/product_name`, `seller_ids/min_qty`, `seller_ids/price` depuis les données BatAppli (`Prix Dalalu Ratio`, `Ratio Pluvitec / Dalalu`)

---

### `gen_article_cost_price_import`

**Fichier :** `actions/gen_article_cost_price_import.py`  
**Sortie :** `Output/ArticleCostPriceImport.xlsx`

Met à jour le **prix de revient** (`standard_price`) de chaque article Odoo en le calant sur le prix fournisseur actuel (`seller_ids/price`). N'exporte que les lignes où les deux prix diffèrent.

Colonnes de contrôle (préfixées `DONT IMPORT -`) : nom, partenaire, ancien prix, différence.

---

### `gen_article_sell_price_import`

**Fichier :** `actions/gen_article_sell_price_import.py`  
**Sortie :** `Output/ArticleSellPriceImport.xlsx`

Aligne le **prix de vente** (`list_price`) sur le coût (`standard_price`) pour les articles dont le prix de vente est actuellement supérieur au coût. Filtre sur `service_type_id == "article"`.

---

### `gen_bom_price_analysis`

**Fichier :** `actions/gen_bom_price_analysis.py`  
**Sortie :** `Output/ProviderBoMPriceAnalysis.xlsx`

Génère un rapport de **comparaison des prix BoM** en interrogeant uniquement l'API Odoo (pas de fichiers Excel BatAppli).

Pour chaque BoM :
- Calcule `total_component_cost = ∑(composant_qty × standard_price)`
- Compare au `list_price` actuel du produit
- Exporte : `Nom de l'Ouvrage`, `Prix de Cout`, `Nouveau Prix de Cout`

---

### `gen_odoo_analysis`

**Fichier :** `actions/gen_odoo_analysis.py`  
**Sortie :** `Output/OdooAnalysis.xlsx` (3 feuilles)

Analyse complète croisant produits et BoM Odoo. Génère un fichier Excel multi-feuilles :

| Feuille | Contenu |
|---|---|
| **Products** | Tous les produits avec indicateurs BoM (`contient BOM`, `nombre articles BOM`) + tous les champs produit et fournisseur |
| **BoM Cost** | Par BoM : coût actuel, coût recalculé, différence |
| **Feuille BoM Composition** | Détail ligne par ligne des composants avec prix unitaire et prix total de ligne |

---

### `product_analysis`

**Fichier :** `actions/product_analysis.py`

Analyse qualité : exporte les produits Odoo et logue les noms en **doublon** (> 2 occurrences). Aucun fichier de sortie généré, résultats dans les logs.

---

## Intégration Odoo (API XML-RPC)

### Authentification

```python
# Configuration via .env
ODOO_URL=https://votre-instance.odoo.com
ODOO_DB=nom_de_la_base
ODOO_USER=utilisateur@email.com
ODOO_API=cle_api_ou_mot_de_passe
```

L'authentification utilise le endpoint standard Odoo :
```
POST /xmlrpc/2/common  →  authenticate()  →  uid
POST /xmlrpc/2/object  →  execute_kw()
```

### Champs exportés pour `product.template`

```python
["id", "name", "product_variant_ids/id", "create_date",
 "list_price", "standard_price", "description_sale",
 "family_id", "subfamily_id", "color_id", "size_id",
 "categ_id", "service_type_id", "type", "sale_ok",
 "taxes_id/id", "purchase_ok", "supplier_taxes_id/id",
 "uom_id", "description", "is_storable", "product_tag_ids",
 "seller_ids/id", "seller_ids/partner_id", "seller_ids/product_code",
 "seller_ids/product_name", "seller_ids/min_qty",
 "seller_ids/product_uom_id", "seller_ids/price", "seller_ids/delay"]
```

### Sorties JSON automatiques

| Fichier | Contenu |
|---|---|
| `Output/OdooApiResultTemplateIds.json` | Liste des IDs de gabarits produits |
| `Output/OdooApiResult.json` | Résultat brut de l'export Odoo |
| `Output/OdooApiProducts.json` | Liste de dicts produits (format lisible) |

---

## Flux de données

### Clé de jointure : `IdBatAppli`

```
product.template (Odoo)
       │  id
       ▼
Mapping.xlsx  ──→  id (Odoo)  ↔  IdBatAppli (BatAppli)
                                       │
                    ┌──────────────────┤
                    ▼                  ▼
            Articles.xlsx        Ouvrages.xlsx
            (prix, unités)       (composition)
                                       │
                                       ▼
                               Articles_liste[]
                               { IdBatAppli, Quantité, Unité }
```

### Calcul du coût d'un ouvrage

```python
cout_total = 0
for article in ouvrage["Articles_liste"]:
    prix = article.get("New_Price") or article.get("Prix achat HT")
    quantite = convert_to_odoo_quantities(article["Quantité"])
    cout_total += prix * quantite
```

---

## Configuration et variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
ODOO_URL=https://votre-instance.odoo.com
ODOO_DB=nom_base_de_donnees
ODOO_USER=email@domaine.com
ODOO_API=votre_cle_api
```

---

## Installation et démarrage

### 1. Créer et activer l'environnement virtuel

```zsh
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Installer les dépendances

```zsh
pip install -r requirements.txt
```

### 3. Configurer le fichier `.env`

```zsh
cp .env.example .env
# Éditer .env avec les credentials Odoo
```

### 4. Placer les fichiers Excel sources dans `Excel/Import/`

Fichiers attendus :
- `INPUT Mapping Odoo BatAppli.xlsx` — feuille `Sheet1`
- `INPUT BatAppli Articles et Ouvrages.xlsx` — feuilles `Liste des articles BatAppli` et `Liste des ouvrages`

### 5. Exécuter une commande

```zsh
# Lister toutes les commandes disponibles
python main.py --help

# Générer le fichier d'import BoM
python main.py gen_bom_import

# Générer les prix fournisseurs
python main.py gen_provider_price_import

# Mettre à jour les prix de coût articles
python main.py gen_article_cost_price_import

# Mettre à jour les prix de vente articles
python main.py gen_article_sell_price_import

# Analyser les prix BoM existants dans Odoo
python main.py gen_bom_price_analysis

# Analyse complète Odoo (produits + BoM)
python main.py gen_odoo_analysis

# Analyse qualité des produits
python main.py product_analysis
```

---

## Fichiers d'entrée / sortie

### Entrées (Excel/Import/)

| Fichier | Feuille | Utilisé par |
|---|---|---|
| `INPUT Mapping Odoo BatAppli.xlsx` | `Sheet1` | `gen_bom_import`, `gen_provider_price_import` |
| `INPUT BatAppli Articles et Ouvrages.xlsx` | `Liste des articles BatAppli` | `gen_bom_import`, `gen_provider_price_import` |
| `INPUT BatAppli Articles et Ouvrages.xlsx` | `Liste des ouvrages` | `gen_bom_import` |

### Sorties (Output/)

| Fichier | Commande | Contenu |
|---|---|---|
| `BomImport.xlsx` | `gen_bom_import` | Import BoM Odoo (`product_tmpl_id/id`, `bom_line_ids/*`) |
| `ProviderPriceImport.xlsx` | `gen_provider_price_import` | Import prix fournisseurs (`seller_ids/*`) |
| `ArticleCostPriceImport.xlsx` | `gen_article_cost_price_import` | Import `standard_price` articles |
| `ArticleSellPriceImport.xlsx` | `gen_article_sell_price_import` | Import `list_price` articles |
| `ProviderBoMPriceAnalysis.xlsx` | `gen_bom_price_analysis` | Rapport comparaison prix BoM |
| `OdooAnalysis.xlsx` | `gen_odoo_analysis` | Analyse complète multi-feuilles |
| `OdooApiProducts.json` | Toutes (via `export_odoo_products`) | Cache produits Odoo |
| `OdooApiResult.json` | Toutes (via `export_odoo_products`) | Résultat brut API Odoo |

---

## Ajouter une nouvelle commande

1. Créer `actions/ma_commande.py` :

```python
import argparse
import utils
from logger import get_logger

logger = get_logger(__name__)

def register(subparsers) -> None:
    p = subparsers.add_parser("ma_commande", help="Description de la commande")
    # p.add_argument("--param", required=True)
    p.set_defaults(func=run)

def run(args: argparse.Namespace) -> int:
    utils.log_args(args)
    # ... logique métier ...
    return 0
```

2. Le module est **découvert automatiquement** au prochain lancement. Aucune modification de `main.py` nécessaire.
