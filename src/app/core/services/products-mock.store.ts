import { Injectable, signal } from '@angular/core';

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
      galerie: [
        "https://burst.shopifycdn.com/photos/wireless-headphones.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/easy-listening.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/black-fashion-backpack.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/gold-zipper-on-black-fashion-backpack.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/ripe-red-strawberries-in-a-white-bowl.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/kitchen-ready-for-cooking.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/portrait-of-illuminated-laptop.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/laptop-keyboard-illuminated-in-red.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/illuminated-laptop-and-mobile-phone.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/open-laptop-and-cell-phone-on-table.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/ready-set-snow.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/gardening-flatlay.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      imagePrincipale: "https://burst.shopifycdn.com/photos/kitchen-ready-for-cooking.jpg?width=3840&format=pjpg&exif=0&iptc=0",
      galerie: [
        "https://burst.shopifycdn.com/photos/sarah_kitchen_supplies_red_adjusted.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/ripe-red-strawberries-in-a-white-bowl.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/illuminated-laptop-and-mobile-phone.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/open-laptop-and-cell-phone-on-table.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      imagePrincipale: "https://burst.shopifycdn.com/photos/a-minimal-yet-cosy-workspace.jpg?width=3840&format=pjpg&exif=0&iptc=0",
      galerie: [
        "https://burst.shopifycdn.com/photos/office-flat-lay-on-wooden-desk-with-catch-tray.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/woman-sitting-on-phone-in-modern-office-chair.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/wrist-watches.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/modern-bamboo-wristwatch.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      imagePrincipale: "https://burst.shopifycdn.com/photos/gaming-glasses-mouse.jpg?width=3840&format=pjpg&exif=0&iptc=0",
      galerie: [
        "https://burst.shopifycdn.com/photos/designers-desk-flatlay.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/brightly-lit-laptop-keyboard.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/portrait-of-illuminated-laptop.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/laptop-keyboard-illuminated-in-red.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      imagePrincipale: "https://burst.shopifycdn.com/photos/black-kettle-and-pour-over-coffee.jpg?width=3840&format=pjpg&exif=0&iptc=0",
      galerie: [
        "https://burst.shopifycdn.com/photos/espresso-machine-with-dark-wood-handles.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/creamy-cold-drink-sits-on-a-wooden-table.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/close-up-of-motherboard.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/electronic-components-for-science-project.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/trendy-bluetooth-speaker.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/waterproof-bluetooth-speaker.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/red-t-shirt.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/grey-t-shirt.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      imagePrincipale: "https://burst.shopifycdn.com/photos/copper-light-in-bedroom.jpg?width=3840&format=pjpg&exif=0&iptc=0",
      galerie: [
        "https://burst.shopifycdn.com/photos/teak-headboard-table.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/yellow-pillow-bedside-table.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/video-game-controller.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/designers-desk-flatlay.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      imagePrincipale: "https://burst.shopifycdn.com/photos/close-up-of-motherboard.jpg?width=3840&format=pjpg&exif=0&iptc=0",
      galerie: [
        "https://burst.shopifycdn.com/photos/digital-photography-flatlay.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/portrait-of-illuminated-laptop.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
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
      galerie: [
        "https://burst.shopifycdn.com/photos/sarah_kitchen_supplies_red_adjusted.jpg?width=3840&format=pjpg&exif=0&iptc=0",
        "https://burst.shopifycdn.com/photos/bare-stony-room-with-two-wooden-benches-and-coffee-tables.jpg?width=3840&format=pjpg&exif=0&iptc=0"
      ],
      createdAt: Date.now() - 1000 * 60 * 180,
      note: 4.7,
      nbAvis: 234,
      livraisonGratuite: false
    },
    { id: 'prod-21', titre: 'Écouteurs Bluetooth', categorie: 'Électronique', ville: 'Douala', prix: 18500, descriptionCourte: 'Écouteurs ultraportables avec réduction de bruit.', descriptionDetaillee: 'Écouteurs sans fil, 24h d\'autonomie. Confort optimisé pour les longues sessions.', imagePrincipale: "https://burst.shopifycdn.com/photos/flat-lay-of-phone-and-wireless-earbuds.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/wireless-headphones.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/black-coffee-and-phone-flatlay.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 50, note: 4.4, nbAvis: 567, prixBarre: 22000, livraisonGratuite: true },
    { id: 'prod-22', titre: 'Jean slim', categorie: 'Mode', ville: 'Yaoundé', prix: 15000, descriptionCourte: 'Jean slim stretch, coupe moderne.', descriptionDetaillee: 'Jean confortable en coton stretch. Taille ajustée.', imagePrincipale: "https://burst.shopifycdn.com/photos/man-sits-and-laughs.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/person-in-a-white-shirt-sits-in-front-of-a-brick-wall.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/hotdog-pin-man-jean-jacket.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 120, note: 4.3, nbAvis: 234, livraisonGratuite: false },
    { id: 'prod-23', titre: 'Grille-pain 2 fentes', categorie: 'Cuisine', ville: 'Bafoussam', prix: 12500, descriptionCourte: 'Grille-pain compact avec 6 niveaux de cuisson.', descriptionDetaillee: 'Grille-pain économique, plaques antiadhésives amovibles.', imagePrincipale: "https://burst.shopifycdn.com/photos/breakfast-from-above.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/croissant-coffee.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/restaurant-breakfast.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 90, note: 4.5, nbAvis: 189, livraisonGratuite: true },
    { id: 'prod-24', titre: 'Webcam HD 1080p', categorie: 'Informatique', ville: 'Douala', prix: 35000, descriptionCourte: 'Webcam Full HD pour visioconférence.', descriptionDetaillee: 'Webcam avec micro intégré, pivot réglable.', imagePrincipale: "https://burst.shopifycdn.com/photos/a-person-talking-to-their-laptop-screen.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/graphic-designer-at-work.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/designer-at-work.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 70, note: 4.6, nbAvis: 312, prixBarre: 42000, livraisonGratuite: true },
    { id: 'prod-25', titre: 'Table de chevet', categorie: 'Maison', ville: 'Yaoundé', prix: 28000, descriptionCourte: 'Table de chevet en bois avec tiroir.', descriptionDetaillee: 'Table de chevet design épuré, tiroir de rangement.', imagePrincipale: "https://burst.shopifycdn.com/photos/teak-headboard-table.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/yellow-pillow-bedside-table.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/gift-with-flowers-on-bedside-table.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 100, note: 4.2, nbAvis: 89, livraisonGratuite: false },
    { id: 'prod-26', titre: 'Enceinte portable', categorie: 'Électronique', ville: 'Douala', prix: 42000, descriptionCourte: 'Enceinte Bluetooth waterproof, 20W.', descriptionDetaillee: 'Enceinte portable waterproof IPX7, batterie 12h.', imagePrincipale: "https://burst.shopifycdn.com/photos/trendy-bluetooth-speaker.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/portable-bluetooth-music-speaker.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/waterproof-bluetooth-speaker.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 85, note: 4.7, nbAvis: 456, livraisonGratuite: true },
    { id: 'prod-27', titre: 'Robe d\'été', categorie: 'Mode', ville: 'Bafoussam', prix: 18500, descriptionCourte: 'Robe légère en coton, coupe fluide.', descriptionDetaillee: 'Robe confortable pour l\'été, coupe universelle.', imagePrincipale: "https://burst.shopifycdn.com/photos/woman-dressed-in-white-leans-against-a-wall.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/model-with-leather-jacket-over-shoulders.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/cozy-reading-in-bed.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 60, note: 4.4, nbAvis: 123, livraisonGratuite: true },
    { id: 'prod-28', titre: 'Bouilloire électrique', categorie: 'Cuisine', ville: 'Yaoundé', prix: 15000, descriptionCourte: 'Bouilloire 1,7 L, arrêt automatique.', descriptionDetaillee: 'Bouilloire rapide, base 360°, sécurité anti-débordement.', imagePrincipale: "https://burst.shopifycdn.com/photos/black-kettle-and-pour-over-coffee.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/barista-pour-over-coffee-from-copper-kettle.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/black-coffee-and-phone-flatlay.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 110, note: 4.5, nbAvis: 278, livraisonGratuite: true },
    { id: 'prod-29', titre: 'Support PC portable', categorie: 'Informatique', ville: 'Douala', prix: 12000, descriptionCourte: 'Support ventilé pour ordinateur portable.', descriptionDetaillee: 'Support ergonomique avec ventilation, réglable en hauteur.', imagePrincipale: "https://burst.shopifycdn.com/photos/laptop-from-above.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/laptop-on-desk-from-above.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/designer-at-work.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 95, note: 4.3, nbAvis: 167, livraisonGratuite: true },
    { id: 'prod-30', titre: 'Plaque chauffante', categorie: 'Cuisine', ville: 'Bafoussam', prix: 22000, descriptionCourte: 'Plaque électrique 2 zones, induction.', descriptionDetaillee: 'Plaque induction 2 zones, commandes tactiles.', imagePrincipale: "https://burst.shopifycdn.com/photos/kitchen-ready-for-cooking.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/sarah_kitchen_supplies_red_adjusted.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/woman-in-collared-shirt-in-the-kitchen-holding-a-mug.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 80, note: 4.6, nbAvis: 189, livraisonGratuite: false },
    { id: 'prod-31', titre: 'Raspberry Pi 4', categorie: 'Informatique', ville: 'Yaoundé', prix: 55000, descriptionCourte: 'Mini PC 4 Go RAM pour projets DIY.', descriptionDetaillee: 'Raspberry Pi 4, processeur Quad-core, WiFi et Bluetooth.', imagePrincipale: "https://burst.shopifycdn.com/photos/close-up-of-motherboard.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/electronic-components-for-science-project.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/pieces-needed-for-building-a-robot.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 45, note: 4.8, nbAvis: 234, livraisonGratuite: true },
    { id: 'prod-32', titre: 'Couverture polaire', categorie: 'Maison', ville: 'Douala', prix: 9500, descriptionCourte: 'Couverture douce 150x200 cm.', descriptionDetaillee: 'Couverture polaire ultra-douce, lavable en machine.', imagePrincipale: "https://burst.shopifycdn.com/photos/woman-resting-her-feet-by-the-window.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/blush-coloured-couch-with-blankets.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/comfortable-living-room-cat.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 130, note: 4.2, nbAvis: 445, livraisonGratuite: true },
    { id: 'prod-33', titre: 'Tap Isométrique', categorie: 'Mode', ville: 'Bafoussam', prix: 8500, descriptionCourte: 'Tapis de yoga antidérapant 6 mm.', descriptionDetaillee: 'Tapis yoga écologique, surface antidérapante.', imagePrincipale: "https://burst.shopifycdn.com/photos/yoga-mat-unrolled.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/yoga-accessories.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/crescent-moon-pose-side-stretch.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 140, note: 4.4, nbAvis: 312, livraisonGratuite: false },
    { id: 'prod-34', titre: 'Presse-agrumes', categorie: 'Cuisine', ville: 'Yaoundé', prix: 18000, descriptionCourte: 'Presse-agrumes électrique, grand bol.', descriptionDetaillee: 'Presse-agrumes pour oranges et citrons, collecteur 1,2 L.', imagePrincipale: "https://burst.shopifycdn.com/photos/ripe-red-strawberries-in-a-white-bowl.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/hibiscus-tea.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/creamy-cold-drink-sits-on-a-wooden-table.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 75, note: 4.5, nbAvis: 198, livraisonGratuite: true },
    { id: 'prod-35', titre: 'Étagère 5 niveaux', categorie: 'Maison', ville: 'Douala', prix: 25000, descriptionCourte: 'Étagère métallique pour rangement.', descriptionDetaillee: 'Étagère robuste 5 niveaux, montage facile.', imagePrincipale: "https://burst.shopifycdn.com/photos/ladder-plant-shelf.jpg?width=3840&format=pjpg&exif=0&iptc=0", galerie: ["https://burst.shopifycdn.com/photos/babys-toys-on-shelf.jpg?width=3840&format=pjpg&exif=0&iptc=0", "https://burst.shopifycdn.com/photos/office-desk-in-window-light.jpg?width=3840&format=pjpg&exif=0&iptc=0"], createdAt: Date.now() - 1000 * 60 * 160, note: 4.3, nbAvis: 76, livraisonGratuite: false }
  ]);

  readonly products = this.productsSignal.asReadonly();

  byId(id: string): ProductMock | undefined {
    return this.products().find((p) => p.id === id);
  }

  byCategorie(categorie: string): ProductMock[] {
    return this.products().filter((p) => p.categorie === categorie);
  }
}

