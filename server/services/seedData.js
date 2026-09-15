const seedTeams = [
  {
    teamId: 'team-1',
    teamNumber: 1,
    teamName: 'Cyber Lions',
    character: '🦁',
    characterName: 'Lion',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Alex Rivera', 'Devin Chen', 'Maya Patel'],
    round1Score: 40,
    round2Score: 35,
    tieBreakerScore: 0,
    totalScore: 75
  },
  {
    teamId: 'team-2',
    teamNumber: 2,
    teamName: 'Quantum Tigers',
    character: '🐯',
    characterName: 'Tiger',
    collegeName: 'Government College of Technology',
    members: ['Sarah Connor', 'John Blake', 'Emma Watson'],
    round1Score: 35,
    round2Score: 40,
    tieBreakerScore: 0,
    totalScore: 75
  },
  {
    teamId: 'team-3',
    teamNumber: 3,
    teamName: 'Data Pandas',
    character: '🐼',
    characterName: 'Panda',
    collegeName: 'Kongu Engineering College',
    members: ['Li Wei', 'Chloe Bennett', 'Rohan Gupta'],
    round1Score: 30,
    round2Score: 30,
    tieBreakerScore: 0,
    totalScore: 60
  },
  {
    teamId: 'team-4',
    teamNumber: 4,
    teamName: 'Binary Foxes',
    character: '🦊',
    characterName: 'Fox',
    collegeName: 'PSG College of Technology',
    members: ['Lucas Scott', 'Zoe Adams', 'Kenji Sato'],
    round1Score: 30,
    round2Score: 25,
    tieBreakerScore: 0,
    totalScore: 55
  },
  {
    teamId: 'team-5',
    teamNumber: 5,
    teamName: 'Alpha Wolves',
    character: '🐺',
    characterName: 'Wolf',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Marcus Vance', 'Priya Sharma', 'Daniel Craig'],
    round1Score: 25,
    round2Score: 25,
    tieBreakerScore: 0,
    totalScore: 50
  },
  {
    teamId: 'team-6',
    teamNumber: 6,
    teamName: 'Sky Eagles',
    character: '🦅',
    characterName: 'Eagle',
    collegeName: 'Government College of Technology',
    members: ['Gabriel Stone', 'Elena Gilbert', 'Tyler Lockwood'],
    round1Score: 25,
    round2Score: 20,
    tieBreakerScore: 0,
    totalScore: 45
  },
  {
    teamId: 'team-7',
    teamNumber: 7,
    teamName: 'Fire Dragons',
    character: '🐉',
    characterName: 'Dragon',
    collegeName: 'Kongu Engineering College',
    members: ['Damon Salvatore', 'Stefan Miller', 'Bonnie Bennett'],
    round1Score: 20,
    round2Score: 25,
    tieBreakerScore: 0,
    totalScore: 45
  },
  {
    teamId: 'team-8',
    teamNumber: 8,
    teamName: 'Code Monkeys',
    character: '🐵',
    characterName: 'Monkey',
    collegeName: 'PSG College of Technology',
    members: ['Sam Winchester', 'Dean Winchester', 'Castiel Angel'],
    round1Score: 20,
    round2Score: 20,
    tieBreakerScore: 0,
    totalScore: 40
  },
  {
    teamId: 'team-9',
    teamNumber: 9,
    teamName: 'Polar Bears',
    character: '🐻',
    characterName: 'Bear',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Arthur Dent', 'Ford Prefect', 'Trillian Astra'],
    round1Score: 20,
    round2Score: 15,
    tieBreakerScore: 0,
    totalScore: 35
  },
  {
    teamId: 'team-10',
    teamNumber: 10,
    teamName: 'Cloud Koalas',
    character: '🐨',
    characterName: 'Koala',
    collegeName: 'Government College of Technology',
    members: ['Oliver Queen', 'Felicity Smoak', 'John Diggle'],
    round1Score: 15,
    round2Score: 20,
    tieBreakerScore: 0,
    totalScore: 35
  },
  {
    teamId: 'team-11',
    teamNumber: 11,
    teamName: 'Spark Unicorns',
    character: '🦄',
    characterName: 'Unicorn',
    collegeName: 'Kongu Engineering College',
    members: ['Barry Allen', 'Iris West', 'Cisco Ramon'],
    round1Score: 15,
    round2Score: 15,
    tieBreakerScore: 0,
    totalScore: 30
  },
  {
    teamId: 'team-12',
    teamNumber: 12,
    teamName: 'Logic Frogs',
    character: '🐸',
    characterName: 'Frog',
    collegeName: 'PSG College of Technology',
    members: ['Peter Parker', 'Ned Leeds', 'MJ Watson'],
    round1Score: 15,
    round2Score: 10,
    tieBreakerScore: 0,
    totalScore: 25
  },
  {
    teamId: 'team-13',
    teamNumber: 13,
    teamName: 'Linux Penguins',
    character: '🐧',
    characterName: 'Penguin',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Linus Torvalds', 'Richard Stallman', 'Grace Hopper'],
    round1Score: 10,
    round2Score: 15,
    tieBreakerScore: 0,
    totalScore: 25
  },
  {
    teamId: 'team-14',
    teamNumber: 14,
    teamName: 'Wise Owls',
    character: '🦉',
    characterName: 'Owl',
    collegeName: 'Government College of Technology',
    members: ['Hermione Granger', 'Luna Lovegood', 'Remus Lupin'],
    round1Score: 10,
    round2Score: 10,
    tieBreakerScore: 0,
    totalScore: 20
  },
  {
    teamId: 'team-15',
    teamNumber: 15,
    teamName: 'Octo Coders',
    character: '🐙',
    characterName: 'Octopus',
    collegeName: 'Kongu Engineering College',
    members: ['Tony Stark', 'Bruce Banner', 'Pepper Potts'],
    round1Score: 10,
    round2Score: 10,
    tieBreakerScore: 0,
    totalScore: 20
  },
  {
    teamId: 'team-16',
    teamNumber: 16,
    teamName: 'Apex Sharks',
    character: '🦈',
    characterName: 'Shark',
    collegeName: 'PSG College of Technology',
    members: ['Harvey Specter', 'Mike Ross', 'Donna Paulsen'],
    round1Score: 10,
    round2Score: 5,
    tieBreakerScore: 0,
    totalScore: 15
  },
  {
    teamId: 'team-17',
    teamNumber: 17,
    teamName: 'Deep Sea Dolphins',
    character: '🐬',
    characterName: 'Dolphin',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Rachel Zane', 'Louis Litt', 'Jessica Pearson'],
    round1Score: 5,
    round2Score: 10,
    tieBreakerScore: 0,
    totalScore: 15
  },
  {
    teamId: 'team-18',
    teamNumber: 18,
    teamName: 'Crypto Butterflies',
    character: '🦋',
    characterName: 'Butterfly',
    collegeName: 'Government College of Technology',
    members: ['Satoshi Nakamoto', 'Vitalik Buterin', 'Ada Lovelace'],
    round1Score: 5,
    round2Score: 5,
    tieBreakerScore: 0,
    totalScore: 10
  },
  {
    teamId: 'team-19',
    teamNumber: 19,
    teamName: 'Busy Bees',
    character: '🐝',
    characterName: 'Bee',
    collegeName: 'Kongu Engineering College',
    members: ['Alan Turing', 'Claude Shannon', 'John von Neumann'],
    round1Score: 5,
    round2Score: 5,
    tieBreakerScore: 0,
    totalScore: 10
  },
  {
    teamId: 'team-20',
    teamNumber: 20,
    teamName: 'Jurassic Rex',
    character: '🦖',
    characterName: 'Dinosaur',
    collegeName: 'PSG College of Technology',
    members: ['Ian Malcolm', 'Alan Grant', 'Ellie Sattler'],
    round1Score: 0,
    round2Score: 10,
    tieBreakerScore: 0,
    totalScore: 10
  },
  {
    teamId: 'team-21',
    teamNumber: 21,
    teamName: 'Royal Peacocks',
    character: '🦚',
    characterName: 'Peacock',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Vikram Sarabhai', 'APJ Abdul Kalam', 'Homi Bhabha'],
    round1Score: 5,
    round2Score: 0,
    tieBreakerScore: 0,
    totalScore: 5
  },
  {
    teamId: 'team-22',
    teamNumber: 22,
    teamName: 'Cyber Leopards',
    character: '🐆',
    characterName: 'Leopard',
    collegeName: 'Government College of Technology',
    members: ['Elliot Alderson', 'Darlene Alderson', 'Angela Moss'],
    round1Score: 0,
    round2Score: 5,
    tieBreakerScore: 0,
    totalScore: 5
  },
  {
    teamId: 'team-23',
    teamNumber: 23,
    teamName: 'Titan Elephants',
    character: '🐘',
    characterName: 'Elephant',
    collegeName: 'Kongu Engineering College',
    members: ['Sherlock Holmes', 'John Watson', 'Mycroft Holmes'],
    round1Score: 0,
    round2Score: 0,
    tieBreakerScore: 0,
    totalScore: 0
  },
  {
    teamId: 'team-24',
    teamNumber: 24,
    teamName: 'Neon Flamingos',
    character: '🦩',
    characterName: 'Flamingo',
    collegeName: 'PSG College of Technology',
    members: ['Walter White', 'Jesse Pinkman', 'Saul Goodman'],
    round1Score: 0,
    round2Score: 0,
    tieBreakerScore: 0,
    totalScore: 0
  },
  {
    teamId: 'team-25',
    teamNumber: 25,
    teamName: 'Sonic Kangaroos',
    character: '🦘',
    characterName: 'Kangaroo',
    collegeName: 'K.S.R. College of Engineering',
    members: ['Miles Morales', 'Gwen Stacy', 'Peter B. Parker'],
    round1Score: 0,
    round2Score: 0,
    tieBreakerScore: 0,
    totalScore: 0
  }
];

const seedQuestions = [
  // ROUND 1: Normal Connection
  {
    id: 'q-r1-1',
    round: 1,
    questionNumber: 1,
    title: 'The Great Physics Connection',
    clues: [
      { text: '🍎 Red Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80' },
      { text: '👨 Isaac Newton', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
      { text: '🍂 Falling from a tree', image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80' },
      { text: '🪐 Planetary Orbits', image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Gravity',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r1-2',
    round: 1,
    questionNumber: 2,
    title: 'Celestial Optics',
    clues: [
      { text: '🌧️ Rain droplets', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80' },
      { text: '☀️ Direct Sunlight', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80' },
      { text: '🔺 Triangular Prism', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
      { text: '🌈 Seven Colors (VIBGYOR)', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Rainbow',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r1-3',
    round: 1,
    questionNumber: 3,
    title: 'Web Evolution',
    clues: [
      { text: '🕸️ World Wide Web inventor', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
      { text: '🏛️ CERN Laboratory (Switzerland)', image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80' },
      { text: '🌐 HTML and HTTP Protocol', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' },
      { text: '🎖️ Knighted by Queen Elizabeth II', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Tim Berners-Lee',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r1-4',
    round: 1,
    questionNumber: 4,
    title: 'Tech Giants & Icons',
    clues: [
      { text: '🍏 Cupertino Garage 1976', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80' },
      { text: '📱 Revolutionized Smartphones (2007)', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
      { text: '👕 Iconic Black Turtleneck', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
      { text: '💡 Think Different', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Steve Jobs / Apple',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r1-5',
    round: 1,
    questionNumber: 5,
    title: 'Digital Currencies',
    clues: [
      { text: '⛏️ Distributed Proof of Work', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
      { text: '📄 Whitepaper published in 2008', image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80' },
      { text: '👤 Anonymous Satoshi Nakamoto', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
      { text: '💰 Genesis Block with 21 Million limit', image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Bitcoin / Blockchain',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },

  // ROUND 2: Normal Connection (Step-by-Step Reveal)
  {
    id: 'q-r2-1',
    round: 2,
    questionNumber: 1,
    title: 'Silicon Foundations',
    clues: [
      { text: '🏖️ Beach Sand (Silicon Dioxide)', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
      { text: '⚡ Semiconductors & Wafers', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
      { text: '🏢 Santa Clara Valley in California', image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600&auto=format&fit=crop&q=80' },
      { text: '💻 Microchips & Integrated Circuits', image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Silicon Valley / Microprocessors',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r2-2',
    round: 2,
    questionNumber: 2,
    title: 'Artificial Intelligence Pioneers',
    clues: [
      { text: '🇬🇧 Bletchley Park Enigma code breaker', image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&auto=format&fit=crop&q=80' },
      { text: '🧠 Can Machines Think? (Imitation Game)', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' },
      { text: '🏆 Highest annual award in Computer Science', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&auto=format&fit=crop&q=80' },
      { text: '🍎 Half-eaten cyanide apple mystery', image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Alan Turing',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r2-3',
    round: 2,
    questionNumber: 3,
    title: 'Modern Space Odyssey',
    clues: [
      { text: '🚀 Falcon 9 Reusable Boosters', image: 'https://images.unsplash.com/photo-1517976487502-53664052345e?w=600&auto=format&fit=crop&q=80' },
      { text: '🔴 Ambition to colonize Mars', image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80' },
      { text: '🛰️ Starlink Global Satellite Mesh', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80' },
      { text: '⚡ Founded by Elon Musk in 2002', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'SpaceX',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r2-4',
    round: 2,
    questionNumber: 4,
    title: 'Search & Algorithms',
    clues: [
      { text: '🌲 Number represented as 1 followed by 100 zeros', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80' },
      { text: '🎓 Stanford University dorm room (1998)', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80' },
      { text: '📄 PageRank Algorithm Patent', image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80' },
      { text: '🌐 Don’t Be Evil motto', image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Google',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r2-5',
    round: 2,
    questionNumber: 5,
    title: 'The Open Source Giant',
    clues: [
      { text: '🐧 Tux the cute mascot', image: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=600&auto=format&fit=crop&q=80' },
      { text: '🇫🇮 Finnish university student (1991)', image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=600&auto=format&fit=crop&q=80' },
      { text: '🐙 Git version control creator', image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&auto=format&fit=crop&q=80' },
      { text: '📱 Powers Android & 90% of cloud servers', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Linux / Linus Torvalds',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },

  // ROUND 3: Tie Breaker Round
  {
    id: 'q-r3-1',
    round: 3,
    questionNumber: 1,
    title: 'Tie Breaker: Quantum Leap',
    clues: [
      { text: '🐱 Paradoxical Cat in a sealed box', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80' },
      { text: '🌀 Superposition of states (0 and 1 together)', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' },
      { text: '🔒 Quantum Cryptography & Qubits', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
      { text: '👨 Erwin Schrödinger Nobel Laureate', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Quantum Superposition / Schrödinger',
    points: 15,
    timerDuration: 20,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r3-2',
    round: 3,
    questionNumber: 2,
    title: 'Tie Breaker: The Lightning Mind',
    clues: [
      { text: '⚡ Alternating Current (AC) electrical grid', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80' },
      { text: '🗼 Wardenclyffe Wireless Transmission Tower', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
      { text: '🚗 Famous electric car company namesake', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80' },
      { text: '💡 Bitter rivalry with Thomas Edison', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Nikola Tesla',
    points: 15,
    timerDuration: 20,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  },
  {
    id: 'q-r3-3',
    round: 3,
    questionNumber: 3,
    title: 'Tie Breaker: The Deep Blue Master',
    clues: [
      { text: '♟️ 64 Squares and Grandmaster Champion', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80' },
      { text: '💻 IBM Supercomputer Deep Blue (1997)', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80' },
      { text: '🇷🇺 Garry Kasparov historic match', image: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=600&auto=format&fit=crop&q=80' },
      { text: '🤖 First time machine defeated reigning world chess king', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' }
    ],
    answerText: 'Deep Blue vs Garry Kasparov / Chess AI',
    points: 15,
    timerDuration: 20,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  }
];

const seedSettings = {
  eventName: 'SYMPOSIUM 2026 CONNECTION ARENA',
  eventSubtitle: 'Think. Connect. Win.',
  collegeName: 'K.S.R. COLLEGE OF ENGINEERING (AUTONOMOUS)',
  departmentName: 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING',
  organisedBy: 'ASSOCIATION OF COMPUTER SCIENCE & ENGINEERING — TECHFEST 2026',
  gameRules: [
    'Each round presents visual & multimedia clues linked to a hidden connecting entity.',
    'Round 1: Normal Connection (10 Points per question). All 20+ teams compete.',
    'Top qualifying teams advance to Round 2 based on Round 1 score rankings.',
    'Round 2: Sequential Clue Unlocking — clues unlock step-by-step with points for early answers.',
    'Round 3: High-Stakes Tie Breaker to determine the podium champions.',
    'Electronic devices strictly prohibited during buzzer rounds. Quiz Master decisions are final.'
  ],
  landingCountdownMinutes: 15,
  landingCountdownTarget: null,
  landingCountdownActive: false,
  defaultTimer: 30,
  round1Timer: 30,
  round2Timer: 20,
  round3Timer: 15,
  autoStartTimerOnNext: true,
  hostPin: '1234',
  audioMode: 'full', // 'full' | 'effects' | 'silent'
  masterVolume: 0.85,
  effectsEnabled: true,
  spokenAnswerEnabled: true,
  countdownSoundEnabled: true,
  soundEffects: {
    gameStart: true,
    questionChange: true,
    timerStart: true,
    countdown: true,
    timeUp: true,
    answerReveal: true,
    spokenAnswer: true,
    correctAnswer: true,
    wrongAnswer: true,
    leaderboard: true,
    tieBreaker: true,
    winner: true
  },
  autoRotateLeaderboard: true,
  leaderboardRotationTime: 6, // seconds
  leaderboardPageSize: 5,
  celebrationAudioUrl: '',
  displayFullscreen: false,
  theme: 'dark'
};

const initialGameState = {
  currentRound: 1,
  currentQuestionIndex: 0,
  gameStatus: 'READY', // 'READY', 'RUNNING', 'PAUSED', 'FINISHED'
  stageView: 'landing',
  timer: {
    duration: 30,
    startedAt: null,
    pausedAt: null,
    status: 'IDLE' // 'IDLE', 'RUNNING', 'PAUSED', 'FINISHED'
  },
  answerRevealed: false,
  revealedCluesCount: 4,
  landingVisible: true,
  leaderboardVisible: false,
  podiumVisible: false,
  qualifiersVisible: false,
  qualifiedTeams: [],
  roundAnnouncement: null,
  round1Completed: false,
  round2Completed: false,
  tieDetected: false,
  activeTieBreakerTeams: ['team-1', 'team-2'], // Pre-seeded tied teams
  audioMode: 'full',
  masterVolume: 0.85
};

module.exports = {
  seedTeams,
  seedQuestions,
  seedSettings,
  initialGameState
};
