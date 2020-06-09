import User from './entity/User';
import Property from './entity/Property';
import Locality from './entity/Locality';
import PropertyType from './entity/PropertyType';
import Image from './entity/Image';
import Reservation from './entity/Reservation';
import { registerUser } from '../actions';

// test data
const localities = [
    new Locality('Brno'),
    new Locality('Praha'),
    new Locality('Ostrava'),
];

const propertyTypes = [
    new PropertyType('Byty'),
    new PropertyType('Domy'),
    new PropertyType('Vily'),
    new PropertyType('Ostatní')
];

const properties = [
    new Property(2, 700, 1, 2, 1, 'Apartment "Your Choice"', 'Malý, ale elegantní byt přímo v centru Prahy. Byt je plně vybaven a nachází se v moderní budově, jistě splní všechny vaše požadavky. Nízká cena a výhodná poloha ho dělá ideální volbou pro vaše obchodní pobyty v Praze.'),
    new Property(1, 800, 2, 3, 1, 'Apartment "Negima"', 'Rozlehlý byt na kraji Brna, ve velice klidné lokalitě. Byt je jako dělaný pro vaše romantické výlety, nebo klidnou rodinnou dovolenou. Vybavení bytu je skromné a elegantní. Může se chlubit s kuchyní která splní všechna vaše očekávání, ložnicí s královskou postelí a dětským pokojem.'),
    new Property(3, 1200, 1, 3, 1, 'Apartment "Luxury"', 'Nový byt v centru Ostravy, ideální pro studenty kteří žijí na plno. Najdete zde vybavenou kuchyni, koupelnu a 3 oddělené pokoje, kde každý bude mít svůj klid. Pro společenské události má obývací pokoj s pohodlnými sedačkami a novou televizí.'),
    new Property(2, 1600, 2, 4, 2, 'House with garage', 'Rodinný dům ve venkovské oblasti Prahy. Právě teď je čas na rodinný výlet do Prahy, který jste vždy plánovali, a tento dům vám nabízí ubytování vašich snů. Dům má příjemnou atmosféru, najdete zde všechno co budete potřebovat. Má ložnici a dva dětské pokoje. Díky vybavené garáži se nemusíte starat o parkování, najdete v ní i venkovní hry pro své děti.'),
    new Property(1, 1600, 1, 5, 2, 'Modern house', 'Moderní dům v Brně, ideální pro jakoukoliv příležitost. Jste posedlí novou technologií? Pak zde budete nadšením bez sebe. Dům obsahuje smart home, stačí si říct a dům splní vaše požadavky. Je zde rychlé wifi připojení a chytrá televize Samsung TV.'),
    new Property(3, 2000, 2, 5, 3, 'Villa "AmaVilla"', 'Vila v Ostravě, jejíž obrázky mluví samy za sebe. Když přijedete, užijete si jedinečnou příležitost a budete se cítit jako králové.'),
    new Property(3, 2200, 1, 6, 3, 'Villa "Monte Grande"', 'Obrovská vila v Ostravě, která vám dopřeje prázdninový zážitek jako žádná jiná. Má venkovní bazén pro jakoukoliv vaši party, sport či relaxaci. Nemyslete si že je vhodný jen na léto - má možnost vyhřívání, takže i v zimě si užijete radost z bazénu, s osvěžujícím chladem kolem.'),
    new Property(3, 1200, 2, 6, 4, 'Abandoned house', 'Dům s ložnicemi a velkým sálem bez vybavení, který na vaši představivost neklade žádná omezení ohledně jeho využití. Ať už chcete dělat velkou party, sportovní událost pro děti či cokoliv jiného, tento dům je právě pro vás.'),
    new Property(1, 1800, 1, 6, 4, 'Studio "Unique"', 'Přijďte si splnit své herecké a modelingové sny do našeho studia Unique. Prvotřídní kamery, perfektní osvětlení a bezkonkurenční cena - to jsou jen některé z výhod, které vám můžeme nabídnout. Tak na co ještě čekáte?'),
];

const images = [
    new Image("property-1/1-0.jpg", 1), new Image("property-1/1-1.jpg", 1),
    new Image("property-2/2-0.jpg", 2), new Image("property-2/2-1.jpg", 2),
    new Image("property-3/3-0.jpg", 3), new Image("property-3/3-1.jpg", 3),
    new Image("property-4/4-0.jpg", 4), new Image("property-4/4-1.jpg", 4),
    new Image("property-5/5-0.jpg", 5), new Image("property-5/5-1.jpg", 5),
    new Image("property-6/6-0.jpg", 6), new Image("property-6/6-1.jpg", 6), new Image("property-6/6-2.jpg", 6), new Image("property-6/6-3.jpg", 6),
    new Image("property-7/7-0.jpg", 7), new Image("property-7/7-1.jpg", 7), new Image("property-7/7-2.jpg", 8),
    new Image("property-8/8-0.jpg", 8),
    new Image("property-9/9-0.jpg", 9), new Image("property-9/9-1.jpg", 9),
];

const users = [
    new User('johndoe@example.com', 'qwerty', 'John', 'Doe'),
    new User('thomascampbell@example.com', 'asdfgh', 'Thomas', 'Campbell'),
];

const reservations = [
    new Reservation(new Date("2010-07-07"), new Date("2010-08-08"), 3, 1, 70, 4)
];

export async function dbInit(connection): Promise<boolean> {
    try {
        const userRepository = connection.getRepository(User);
        const propertyRepository = connection.getRepository(Property);
        if (!await propertyRepository.createQueryBuilder().select('*').getCount()) {            
            users.forEach((u: User) => {
                registerUser(u.email, u.password, u.firstName, u.lastName, userRepository);
            });

            connection.manager.save(localities);
            connection.manager.save(propertyTypes);
            connection.manager.save(properties);
            connection.manager.save(images);
            connection.manager.save(reservations);
            console.log('Data added to database');
        } else {
            const properties = await propertyRepository.createQueryBuilder().select('*').getRawMany();
            properties.forEach(property => {
                console.log(`Property ${property.name}: ${property.price}`);
            });
        }
    } catch {
        return false;
    }
    return true;
}