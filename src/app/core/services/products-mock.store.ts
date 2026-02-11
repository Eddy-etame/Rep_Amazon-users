import { Injectable, signal } from '@angular/core';

const IMG = (id: number, w = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const IMG_JPG = (id: number, w = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpg?auto=compress&cs=tinysrgb&w=${w}`;
const UIMG = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

export interface ProductMock {
  id: string;
  titre: string;
  categorie: string;
  ville: string;
  prix: number;
  descriptionCourte: string;
  descriptionDetaillee: string;
  imagePrincipale: string;
  galerie: string[];
  createdAt: number;
  note?: number;
  nbAvis?: number;
  prixBarre?: number | null;
  livraisonGratuite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsMockStore {
  private readonly productsSignal = signal<ProductMock[]>([
    {
      id: 'prod-1',
      titre: 'Casque Bluetooth Pro',
      categorie: 'Électronique',
      ville: 'Douala',
      prix: 59000,
      descriptionCourte: 'Casque sans fil avec réduction de bruit active.',
      descriptionDetaillee:
        'Profitez d’un son immersif et d’une autonomie de 30h avec ce casque Bluetooth Pro, idéal pour le travail et les voyages.',
      imagePrincipale: "https://tse1.mm.bing.net/th/id/OIP.fcgjqsPp4JTUxLVre_GqjwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
      galerie: [IMG(3394653), IMG(3394665)],
      createdAt: Date.now() - 1000 * 60 * 45,
      note: 4.5,
      nbAvis: 342,
      prixBarre: 72000,
      livraisonGratuite: true
    },
    {
      id: 'prod-2',
      titre: 'Sac à dos urbain',
      categorie: 'Mode',
      ville: 'Yaoundé',
      prix: 32000,
      descriptionCourte: 'Sac à dos robuste pour le quotidien et les déplacements.',
      descriptionDetaillee:
        'Sac à dos imperméable avec compartiment pour ordinateur portable 15", parfait pour le bureau, la fac ou les week-ends.',
      imagePrincipale: "https://cdn.shopify.com/s/files/1/0804/5461/5380/files/sac-a-dos-urbain-impermeable_4.jpg?v=1705442444",
      galerie: [IMG(15246346), IMG(9321607)],
      createdAt: Date.now() - 1000 * 60 * 90,
      note: 4.2,
      nbAvis: 128,
      livraisonGratuite: true
    },
    {
      id: 'prod-3',
      titre: 'Mixeur compact',
      categorie: 'Cuisine',
      ville: 'Bafoussam',
      prix: 27500,
      descriptionCourte: 'Mixeur pratique pour smoothies et préparations rapides.',
      descriptionDetaillee:
        'Bol en verre, 3 vitesses, fonction glace pilée. Idéal pour les jus, smoothies et sauces maison.',
      imagePrincipale: "https://www.cdiscount.com/pdt2/7/6/4/1/700x700/aaais25764/rw/blendermini-mixeur-compact.jpg",
      galerie: [UIMG('1564940735784-b15466e8dc09'), IMG(3738095)],
      createdAt: Date.now() - 1000 * 60 * 240,
      note: 4.6,
      nbAvis: 89,
      prixBarre: 35000,
      livraisonGratuite: true
    },
    {
      id: 'prod-4',
      titre: 'Ordinateur portable 15"',
      categorie: 'Informatique',
      ville: 'Douala',
      prix: 325000,
      descriptionCourte:
        'PC portable 15" Full HD, 8 Go RAM, SSD 512 Go pour le travail et les études.',
      descriptionDetaillee:
        'Ordinateur portable polyvalent avec processeur moderne, écran 15" Full HD et stockage SSD 512 Go. Idéal pour la bureautique, les cours en ligne et le divertissement à la maison.',
      imagePrincipale: "https://www.electrodepot.fr/media/catalog/product/cache/21829524fa1ab23f727c95c7cf2d8bf0/P10008531.jpg?frz-v=4277",
      galerie: [IMG(1181298), IMG(8284722)],
      createdAt: Date.now() - 1000 * 60 * 60,
      note: 4.7,
      nbAvis: 512,
      livraisonGratuite: true
    },
    {
      id: 'prod-5',
      titre: 'Smartphone 4G Dual SIM',
      categorie: 'Électronique',
      ville: 'Yaoundé',
      prix: 145000,
      descriptionCourte:
        'Smartphone 4G avec grand écran lumineux et double SIM, parfait pour rester connecté.',
      descriptionDetaillee:
        'Écran 6,5" lumineux, 4 Go RAM, 128 Go de stockage, double SIM et batterie longue durée. Idéal pour les réseaux sociaux, la navigation et le travail en mobilité.',
      imagePrincipale: "https://th.bing.com/th/id/OIP.40xiJW3ZQVxSRh7PPPcs9wHaHa?w=193&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      galerie: [IMG(404280), IMG(1092671)],
      createdAt: Date.now() - 1000 * 60 * 10,
      note: 4.3,
      nbAvis: 1247,
      prixBarre: 175000,
      livraisonGratuite: true
    },
    {
      id: 'prod-6',
      titre: 'Chaussures de sport légères',
      categorie: 'Mode',
      ville: 'Douala',
      prix: 28000,
      descriptionCourte:
        'Baskets confortables pour le quotidien, la marche et la salle de sport.',
      descriptionDetaillee:
        'Chaussures de sport respirantes avec semelle amortissante et design moderne. Parfaites pour la marche en ville, le footing léger et les journées actives.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.MXLcaRL8cOxKeBbJZXEbwwHaHa?w=186&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
      galerie: [IMG(1598505), IMG(2529148)],
      createdAt: Date.now() - 1000 * 60 * 180,
      note: 4.4,
      nbAvis: 567,
      livraisonGratuite: true
    },
    {
      id: 'prod-7',
      titre: 'Robot de cuisine multifonction',
      categorie: 'Cuisine',
      ville: 'Yaoundé',
      prix: 95000,
      descriptionCourte:
        'Robot de cuisine 5 en 1 pour râper, mixer, pétrir et plus encore.',
      descriptionDetaillee:
        'Bol grande capacité, plusieurs accessoires pour râper, couper, mixer et pétrir vos préparations. Gagnez du temps sur la préparation de vos plats au quotidien.',
      imagePrincipale: "https://www.bing.com/th?id=OPEC.F3ETf1eH5Tu6HA474C474&o=5&pid=21.1&w=140&h=140&qlt=100&dpr=1,3&o=2",
      galerie: [UIMG('1564940735784-b15466e8dc09'), UIMG('1564940735784-b15466e8dc09')],
      createdAt: Date.now() - 1000 * 60 * 75,
      note: 4.8,
      nbAvis: 234,
      livraisonGratuite: true
    },
    {
      id: 'prod-8',
      titre: 'TV 43\" LED Full HD',
      categorie: 'Électronique',
      ville: 'Bafoussam',
      prix: 210000,
      descriptionCourte:
        'Téléviseur 43\" Full HD avec ports HDMI et USB pour vos contenus.',
      descriptionDetaillee:
        'Écran 43\" Full HD, couleurs vives et son clair. Idéal pour le salon, avec plusieurs ports HDMI/USB pour connecter décodeur, console et clé USB.',
      imagePrincipale: "https://www.bing.com/th?id=OPEC.NqKLb%2bPwM%2fbSUA474C474&o=5&pid=21.1&w=140&h=140&qlt=100&dpr=1,3&o=2&pcl=f5f5f5",
      galerie: [IMG(1444416), IMG(904620)],
      createdAt: Date.now() - 1000 * 60 * 300,
      note: 4.5,
      nbAvis: 412,
      livraisonGratuite: true
    },
    {
      id: 'prod-9',
      titre: 'Fauteuil de bureau ergonomique',
      categorie: 'Maison',
      ville: 'Douala',
      prix: 68000,
      descriptionCourte:
        'Chaise de bureau réglable avec support lombaire pour travailler confortablement.',
      descriptionDetaillee:
        'Dossier ergonomique, accoudoirs réglables et assise rembourrée pour vos longues journées de travail. Idéal pour le télétravail ou le bureau.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.8290h15gpSCz47GxUSpFcAHaGk?w=241&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [UIMG('1750306957077-b74e45fe1819'), IMG(416320)],
      createdAt: Date.now() - 1000 * 60 * 25,
      note: 4.6,
      nbAvis: 178,
      livraisonGratuite: false
    },
    {
      id: 'prod-10',
      titre: 'Montre connectée fitness',
      categorie: 'Électronique',
      ville: 'Yaoundé',
      prix: 45000,
      descriptionCourte:
        'Montre connectée avec suivi d’activité, notifications et cardiofréquencemètre.',
      descriptionDetaillee:
        'Suivi des pas, du sommeil, du rythme cardiaque et des entraînements. Reçoit les notifications de votre smartphone et résiste aux éclaboussures.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.CPFfqoRLd-UlEumdcR-digHaEL?w=255&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG(267394), IMG(267393)],
      createdAt: Date.now() - 1000 * 60 * 5,
      note: 4.3,
      nbAvis: 893,
      prixBarre: 52000,
      livraisonGratuite: true
    },
    {
      id: 'prod-11',
      titre: 'Kit bureau (clavier, souris, casque)',
      categorie: 'Électronique',
      ville: 'Douala',
      prix: 45000,
      descriptionCourte: 'Set complet pour le télétravail et le gaming.',
      descriptionDetaillee:
        'Clavier sans fil, souris ergonomique et casque audio. Design épuré et confortable pour vos longues sessions de travail ou de jeu.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.cws_M-gKDNqROMIiy7_WVwHaHa?w=198&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG(1714202), IMG(3394666)],
      createdAt: Date.now() - 1000 * 60 * 120,
      note: 4.4,
      nbAvis: 156,
      livraisonGratuite: true
    },
    {
      id: 'prod-12',
      titre: 'Clavier sans fil',
      categorie: 'Informatique',
      ville: 'Yaoundé',
      prix: 25000,
      descriptionCourte: 'Clavier ergonomique sans fil pour bureau et télétravail.',
      descriptionDetaillee:
        'Clavier sans fil compact avec pavé numérique, autonomie 18 mois. Touches silencieuses et design épuré pour une frappe confortable.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.LW7ZYPWTaex4TjOZ1m-OvgHaEo?w=262&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG(735911), IMG(1181298)],
      createdAt: Date.now() - 1000 * 60 * 80,
      note: 4.6,
      nbAvis: 289,
      livraisonGratuite: true
    },
    {
      id: 'prod-13',
      titre: 'Cafetière programmable',
      categorie: 'Cuisine',
      ville: 'Bafoussam',
      prix: 35000,
      descriptionCourte: 'Cafetière filtre 12 tasses avec minuterie et verseuse isotherme.',
      descriptionDetaillee:
        'Préparez votre café au réveil grâce à la minuterie programmable. Réservoir amovible, filtre permanent et arrêt automatique.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.cCJuhXs4_Q_2FV-6v3aVAwHaHa?w=202&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG(29510333), IMG(2719464)],
      createdAt: Date.now() - 1000 * 60 * 150,
      note: 4.5,
      nbAvis: 445,
      prixBarre: 42000,
      livraisonGratuite: true
    },
    {
      id: 'prod-14',
      titre: 'Clé USB 64 Go',
      categorie: 'Informatique',
      ville: 'Douala',
      prix: 12000,
      descriptionCourte: 'Clé USB 3.0 haute vitesse pour transferts rapides.',
      descriptionDetaillee:
        'Capacité 64 Go, USB 3.0 pour des transferts jusqu\'à 100 Mo/s. Compacte et fiable pour vos documents, photos et vidéos.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.Tez6kCPRZBDuCwUgwIuFmgHaHa?w=199&h=199&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG_JPG(18105), IMG(1181298)],
      createdAt: Date.now() - 1000 * 60 * 30,
      note: 4.3,
      nbAvis: 2034,
      livraisonGratuite: true
    },
    {
      id: 'prod-15',
      titre: 'Powerbank 20000 mAh',
      categorie: 'Électronique',
      ville: 'Yaoundé',
      prix: 22000,
      descriptionCourte: 'Batterie externe pour recharger smartphone et tablette.',
      descriptionDetaillee:
        '20000 mAh, double port USB, charge rapide. Rechargez votre smartphone jusqu\'à 4 fois. Indicateur LED et protection contre les surcharges.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.YMygNxqpWXw0YFglMCX7OAHaIO?w=163&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [UIMG('1706275399494-fb26bbc5da63'), UIMG('1635861321688-b63d28749a82')],
      createdAt: Date.now() - 1000 * 60 * 95,
      note: 4.2,
      nbAvis: 678,
      livraisonGratuite: true
    },
    {
      id: 'prod-16',
      titre: 'T-shirt col rond',
      categorie: 'Mode',
      ville: 'Douala',
      prix: 8500,
      descriptionCourte: 'T-shirt 100% coton, coupe classique et confortable.',
      descriptionDetaillee:
        'T-shirt unisexe en coton respirant. Coupe régulière, col rond, couleurs unies. Idéal pour le quotidien ou le sport.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.PxrlcMu6Ytk6kcjlYzOsxgHaKB?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG(5622571), IMG(6769347)],
      createdAt: Date.now() - 1000 * 60 * 200,
      note: 4.1,
      nbAvis: 523,
      livraisonGratuite: false
    },
    {
      id: 'prod-17',
      titre: 'Lampe de bureau LED',
      categorie: 'Maison',
      ville: 'Douala',
      prix: 15000,
      descriptionCourte: 'Lampe de bureau à LED réglable, 3 niveaux de luminosité.',
      descriptionDetaillee:
        'Lampe design avec bras flexible, base lestée. Éclairage LED blanc froid et chaud, économie d\'énergie. Parfaite pour le télétravail.',
      imagePrincipale: "https://th.bing.com/th/id/OIP.5w-dlf8agyxCuMe1ea84IwHaHa?w=280&h=210&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      galerie: [IMG(923311), IMG(284951)],
      createdAt: Date.now() - 1000 * 60 * 70,
      note: 4.5,
      nbAvis: 312,
      livraisonGratuite: true
    },
    {
      id: 'prod-18',
      titre: 'Souris sans fil',
      categorie: 'Informatique',
      ville: 'Yaoundé',
      prix: 12000,
      descriptionCourte: 'Souris ergonomique sans fil, 6 boutons programmables.',
      descriptionDetaillee:
        'Souris optique sans fil avec portée 10 m. Design ergonomique pour droitiers, autonomie 12 mois. Compatible Windows et Mac.',
      imagePrincipale: "https://www.bing.com/th/id/OIP.8s-gDapiBqHvDV9-y2i_WgHaHa?w=174&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
      galerie: [IMG(2115257), IMG(2054219)],
      createdAt: Date.now() - 1000 * 60 * 45,
      note: 4.4,
      nbAvis: 892,
      livraisonGratuite: true
    },
    {
      id: 'prod-19',
      titre: 'Disque dur externe 1 To',
      categorie: 'Informatique',
      ville: 'Douala',
      prix: 65000,
      descriptionCourte: 'Stockage portable USB 3.0 pour sauvegardes et multimédia.',
      descriptionDetaillee:
        '1 To de stockage, interface USB 3.0. Design compact et robuste, sauvegarde automatique possible. Idéal pour sauvegarder vos photos et vidéos.',
      imagePrincipale: "https://th.bing.com/th/id/OIP.JBE8O5-Kg3gDiReKU9PUSQHaHa?w=204&h=204&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      galerie: [IMG(5882557), IMG(1181298)],
      createdAt: Date.now() - 1000 * 60 * 100,
      note: 4.6,
      nbAvis: 412,
      livraisonGratuite: true
    },
    {
      id: 'prod-20',
      titre: 'Batterie de cuisine 5 pièces',
      categorie: 'Cuisine',
      ville: 'Bafoussam',
      prix: 45000,
      descriptionCourte: 'Set casseroles et poêles en inox pour tous les feux.',
      descriptionDetaillee:
        'Batterie complète : 2 casseroles, 1 poêle, 1 sauteuse. Inox 18/10, poignées bakélite résistantes à la chaleur. Compatible induction.',
      imagePrincipale: "https://th.bing.com/th/id/OIP.pqAX3C67r_xqz40mOV1iMgHaEM?w=332&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      galerie: [IMG(2717167), IMG(3182757)],
      createdAt: Date.now() - 1000 * 60 * 180,
      note: 4.7,
      nbAvis: 234,
      livraisonGratuite: false
    }
  ]);

  readonly products = this.productsSignal.asReadonly();

  byId(id: string): ProductMock | undefined {
    return this.products().find((p) => p.id === id);
  }

  byCategorie(categorie: string): ProductMock[] {
    return this.products().filter((p) => p.categorie === categorie);
  }
}

