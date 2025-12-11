import { PointOfInterest } from '../types';

// Mock places data generator based on location
export function mockPlacesData(lat: number, lng: number): PointOfInterest[] {
  // Check if we're near Copenhagen (approx coordinates)
  const isNearCopenhagen = 
    lat > 55.6 && lat < 55.75 && lng > 12.5 && lng < 12.65;

  if (isNearCopenhagen) {
    return [
      {
        id: '1',
        name: 'Rundetårn',
        description: 'A 17th-century tower offering panoramic views of Copenhagen. Built by Christian IV as an astronomical observatory.',
        lat: 55.6813,
        lng: 12.5757,
        distance: 0.8,
        category: 'Historic Landmark'
      },
      {
        id: '2',
        name: 'Nyhavn',
        description: 'Colorful 17th-century waterfront with restaurants, bars, and historic wooden ships. Former home of Hans Christian Andersen.',
        lat: 55.6798,
        lng: 12.5914,
        distance: 1.2,
        category: 'Waterfront District'
      },
      {
        id: '3',
        name: 'Amalienborg Palace',
        description: 'The royal residence of the Danish monarch, consisting of four identical classical palace façades around an octagonal courtyard.',
        lat: 55.6840,
        lng: 12.5930,
        distance: 1.5,
        category: 'Royal Palace'
      },
      {
        id: '4',
        name: 'Tivoli Gardens',
        description: 'A famous amusement park and pleasure garden opened in 1843. One of the oldest operating amusement parks in the world.',
        lat: 55.6738,
        lng: 12.5681,
        distance: 0.5,
        category: 'Amusement Park'
      },
      {
        id: '5',
        name: 'The Little Mermaid',
        description: 'Bronze statue depicting a mermaid, inspired by Hans Christian Andersen\'s fairy tale. An iconic symbol of Copenhagen.',
        lat: 55.6929,
        lng: 12.5993,
        distance: 1.9,
        category: 'Statue & Monument'
      },
      {
        id: '6',
        name: 'Rosenborg Castle',
        description: 'A renaissance castle built in the early 17th century, housing the Danish crown jewels and royal regalia.',
        lat: 55.6859,
        lng: 12.5772,
        distance: 1.1,
        category: 'Castle & Museum'
      }
    ];
  }

  // Generic places for other locations
  return [
    {
      id: '1',
      name: 'City Center',
      description: 'The bustling heart of the city with shops, cafes, and historic architecture.',
      lat: lat + 0.005,
      lng: lng + 0.005,
      distance: 0.6,
      category: 'District'
    },
    {
      id: '2',
      name: 'Central Park',
      description: 'A beautiful green space perfect for relaxation and outdoor activities.',
      lat: lat - 0.008,
      lng: lng + 0.003,
      distance: 0.9,
      category: 'Park'
    },
    {
      id: '3',
      name: 'Historic Museum',
      description: 'Explore the rich history and culture of the region through fascinating exhibits.',
      lat: lat + 0.010,
      lng: lng - 0.005,
      distance: 1.3,
      category: 'Museum'
    },
    {
      id: '4',
      name: 'Main Square',
      description: 'A vibrant public space hosting markets, events, and community gatherings.',
      lat: lat + 0.003,
      lng: lng - 0.008,
      distance: 1.0,
      category: 'Square'
    },
    {
      id: '5',
      name: 'Riverside Walk',
      description: 'Scenic path along the water offering beautiful views and peaceful strolls.',
      lat: lat - 0.012,
      lng: lng - 0.010,
      distance: 1.7,
      category: 'Scenic Route'
    },
    {
      id: '6',
      name: 'Art Gallery',
      description: 'Contemporary and classical art exhibitions from local and international artists.',
      lat: lat + 0.007,
      lng: lng + 0.009,
      distance: 1.2,
      category: 'Gallery'
    }
  ];
}

// Mock podcast content for different places
export function generatePodcastContent(placeName: string, userQuery?: string): string {
  const copenhagenPlaces: Record<string, string> = {
    'rundetårn': `Welcome to Rundetårn, the Round Tower of Copenhagen. Standing 36 meters tall, this remarkable structure was completed in 1642 under the reign of King Christian the Fourth. 

Unlike typical towers with staircases, Rundetårn features a unique spiral corridor that winds 7.5 times around the central core. This design wasn't just for show - it allowed horses and carriages to transport heavy astronomical equipment to the observatory at the top.

The tower served three main purposes: as an astronomical observatory for the University of Copenhagen, a church tower for the Trinity Church below, and a university library. Today, you can still walk up the spiral corridor and enjoy one of the best panoramic views of Copenhagen from the observation deck.

On your way up, notice the golden inscription above the entrance, featuring Christian the Fourth's monogram and a Latin biblical quote. The tower represents the perfect blend of science, religion, and royal ambition that characterized 17th-century Denmark.`,

    'nyhavn': `You're at Nyhavn, Copenhagen's most iconic waterfront. The name simply means "New Harbor," built between 1670 and 1673 by Swedish prisoners of war. 

These colorful townhouses lining both sides of the canal weren't always the tourist attraction they are today. Historically, Nyhavn was a busy commercial port where ships from around the world would dock. It was also known for its sailors, pubs, and somewhat rough character.

The famous Danish author Hans Christian Andersen lived at Nyhavn for various periods of his life - in houses number 20, 67, and 18. He wrote his first fairy tales while living here, including "The Princess and the Pea" and "The Tinderbox."

Today, the old merchant ships moored along the quay are preserved as floating museums, and the area has transformed into one of Copenhagen's most beloved dining and entertainment districts. The north side, with its odd numbers, is particularly sunny and perfect for outdoor dining.`,

    'amalienborg': `You're standing near Amalienborg, the winter residence of the Danish royal family. This architectural complex consists of four identical rococo palace façades arranged around an octagonal courtyard.

Originally, these were mansions for four noble families, designed by architect Nicolai Eigtved in the 1750s. However, after the Christiansborg Palace burned down in 1794, the royal family acquired the palaces and moved in.

Today, Queen Margrethe II and other members of the royal family still reside here. You can tell when the Queen is home by looking for the royal standard flying above the palace.

At noon each day, you can witness the changing of the guard. The Royal Life Guards march from their barracks through the city streets to Amalienborg - a tradition that draws visitors from around the world.

The statue in the center of the courtyard depicts King Frederick the Fifth on horseback. It's considered one of the finest equestrian statues in Europe and took sculptor Jacques Saly 20 years to complete.`,

    'tivoli': `Welcome to Tivoli Gardens, one of the world's oldest operating amusement parks. Opened in 1843, Tivoli has been delighting visitors for over 180 years.

The park was created by Georg Carstensen, who convinced King Christian VIII with the famous phrase: "When the people are amusing themselves, they do not think about politics." The king granted him a five-year charter.

Tivoli is beautifully designed with exotic architecture, historic buildings, and lush gardens. It's said that Walt Disney visited Tivoli and drew inspiration for his own Disneyland from this magical place.

The park features both modern thrill rides and vintage attractions. The wooden roller coaster from 1914 is still operating and provides a wonderfully nostalgic experience.

During the evening, Tivoli transforms into an illuminated wonderland with over 100,000 colored lights. The Friday night rock concerts, the Christmas market, and the Halloween decorations make Tivoli a year-round destination beloved by Danes and tourists alike.`
  };

  // Check if the query mentions a known Copenhagen place
  if (userQuery) {
    const query = userQuery.toLowerCase();
    for (const [key, content] of Object.entries(copenhagenPlaces)) {
      if (query.includes(key)) {
        return content;
      }
    }
  }

  // Default response
  return `Thank you for sharing what you're looking at. This area has a rich history and unique character. 

The architecture you see around you reflects the cultural and historical influences that have shaped this place over the years. Each building, street, and landmark tells its own story.

As you explore, notice the details - the way the light falls on the facades, the mix of old and new, the rhythm of daily life happening around you. These are the elements that make every location unique.

Would you like to know more about a specific building or landmark? Feel free to ask about anything that catches your eye.`;
}
