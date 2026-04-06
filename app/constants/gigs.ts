export const gigs = [
  // 🏋️‍♂️ FITNESS & HEALTH
  {
    id: "1",
    title: "Gym Training",
    category: "Fitness",
    durationPosted: "2h ago",
    description:
      "Get fit with a customized workout plan. Sessions at the campus gym, all fitness levels welcome.",
    tags: ["Fitness", "Training", "Gym", "Personal Training"],
    gigger: "J. Groot",
    giggerAvatar: "/portraits/person6.jpg",
    charges: "$25",
    proximity: "3km",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Yoga & Meditation",
    category: "Wellness",
    durationPosted: "5h ago",
    description:
      "Morning yoga sessions in the park. Reduce stress, improve flexibility. All equipment provided.",
    tags: ["Yoga", "Meditation", "Wellness", "Mindfulness"],
    gigger: "Sarah Chen",
    giggerAvatar: "/portraits/person1.jpg",
    charges: "$18",
    proximity: "1.2km",
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Nutrition Coaching",
    category: "Health",
    durationPosted: "1d ago",
    description:
      "Customized meal plans and nutrition advice. Specializing in student budgets and dorm cooking.",
    tags: ["Nutrition", "Meal Prep", "Diet", "Healthy Eating"],
    gigger: "Dr. Mike Ross",
    giggerAvatar: "/portraits/person2.jpg",
    charges: "$35",
    proximity: "5km",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Running Buddy",
    category: "Fitness",
    durationPosted: "3h ago",
    description:
      "Looking for running partners? I'll pace you for 5K/10K training. Great for beginners!",
    tags: ["Running", "Cardio", "Marathon Prep"],
    gigger: "Alex Rivera",
    giggerAvatar: "/portraits/person3.jpg",
    charges: "$12",
    proximity: "2.5km",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop",
  },

  // 📚 ACADEMIC & TUTORING
  {
    id: "5",
    title: "Calculus Tutor",
    category: "Math",
    durationPosted: "30m ago",
    description:
      "Struggling with Calc I/II? 4th year engineering student. Free first session!",
    tags: ["Calculus", "STEM", "Tutoring", "Math"],
    gigger: "Emily Watson",
    giggerAvatar: "/portraits/person4.jpg",
    charges: "$30",
    proximity: "1.8km",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "Essay Editing",
    category: "Writing",
    durationPosted: "2h ago",
    description:
      "Professional editor, published writer. Perfect for college apps and term papers. 24h turnaround.",
    tags: ["Editing", "Essays", "Proofreading", "Academic"],
    gigger: "James Liu",
    giggerAvatar: "/portraits/person5.jpg",
    charges: "$20",
    proximity: "0.5km",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&auto=format&fit=crop",
  },
  {
    id: "7",
    title: "Programming Mentor",
    category: "CS",
    durationPosted: "6h ago",
    description:
      "Python/JavaScript tutoring. Help with assignments, interview prep, and personal projects.",
    tags: ["Coding", "Python", "JavaScript", "Mentoring"],
    gigger: "Priya Patel",
    giggerAvatar: "/portraits/person7.jpg",
    charges: "$40",
    proximity: "2.2km",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format&fit=crop",
  },
  {
    id: "8",
    title: "Spanish Conversation",
    category: "Languages",
    durationPosted: "1d ago",
    description:
      "Native speaker. Practice conversational Spanish in casual coffee shop sessions.",
    tags: ["Spanish", "Language Exchange", "Conversation"],
    gigger: "Carlos Mendez",
    giggerAvatar: "/portraits/person8.jpg",
    charges: "$15",
    proximity: "1.5km",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop",
  },
  {
    id: "9",
    title: "Chemistry Lab Assistant",
    category: "Science",
    durationPosted: "4h ago",
    description:
      "Need help with lab reports or understanding concepts? Chem major, pre-med track.",
    tags: ["Chemistry", "Lab Work", "Organic Chem"],
    gigger: "Sophia Kim",
    giggerAvatar: "/portraits/person9.jpg",
    charges: "$25",
    proximity: "3.1km",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop",
  },

  // 🎨 CREATIVE & DESIGN
  {
    id: "10",
    title: "Logo Design",
    category: "Graphic Design",
    durationPosted: "45m ago",
    description:
      "Need a logo for your club or side hustle? 3 concepts, 2 revisions, vector files included.",
    tags: ["Logo", "Adobe Illustrator", "Branding"],
    gigger: "Marcus Chen",
    giggerAvatar: "/portraits/person10.jpg",
    charges: "$50",
    proximity: "4km",
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop",
  },
  {
    id: "11",
    title: "Photography Session",
    category: "Photography",
    durationPosted: "3h ago",
    description:
      "Portrait or event photography. Great for graduation pics, content creation, or social media.",
    tags: ["Portraits", "Events", "Editing"],
    gigger: "Diana Prince",
    giggerAvatar: "/portraits/person11.jpg",
    charges: "$45",
    proximity: "2.8km",
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop",
  },
  {
    id: "12",
    title: "Video Editing",
    category: "Media",
    durationPosted: "12h ago",
    description:
      "YouTube/TikTok ready edits. Color grading, transitions, captions included.",
    tags: ["Premiere Pro", "After Effects", "Social Media"],
    gigger: "Tom Wilson",
    giggerAvatar: "/portraits/person12.jpg",
    charges: "$35",
    proximity: "0km",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&auto=format&fit=crop",
  },
  {
    id: "13",
    title: "Music Production",
    category: "Audio",
    durationPosted: "2d ago",
    description:
      "Beat making, mixing, and mastering. Studio quality in my home setup.",
    tags: ["FL Studio", "Mixing", "Beats"],
    gigger: "DJ K-Swift",
    giggerAvatar: "/portraits/person13.jpg",
    charges: "$30",
    proximity: "5.5km",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format&fit=crop",
  },

  // 🛠️ TECH & IT
  {
    id: "14",
    title: "PC Build Help",
    category: "Tech Support",
    durationPosted: "1h ago",
    description:
      "Help with building or upgrading your PC. Part selection advice and assembly.",
    tags: ["PC Building", "Hardware", "Gaming"],
    gigger: "Zack Taylor",
    giggerAvatar: "/portraits/person14.jpg",
    charges: "$40",
    proximity: "2.3km",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop",
  },
  {
    id: "15",
    title: "Website Fixes",
    category: "Web Dev",
    durationPosted: "5h ago",
    description:
      "Quick fixes for your personal site or club website. HTML, CSS, WordPress.",
    tags: ["WordPress", "CSS", "Bug Fixes"],
    gigger: "Linda Park",
    giggerAvatar: "/portraits/person15.jpg",
    charges: "$25",
    proximity: "1.9km",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&auto=format&fit=crop",
  },
  {
    id: "16",
    title: "Data Entry",
    category: "Admin",
    durationPosted: "1d ago",
    description:
      "Fast and accurate data entry. Excel, Google Sheets, database cleanup.",
    tags: ["Excel", "Typing", "Organization"],
    gigger: "Robert Zhao",
    giggerAvatar: "/portraits/person16.jpg",
    charges: "$15",
    proximity: "3.7km",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&auto=format&fit=crop",
  },

  // 🎵 MUSIC & ARTS
  {
    id: "17",
    title: "Guitar Lessons",
    category: "Music",
    durationPosted: "4h ago",
    description:
      "Acoustic/electric guitar lessons. All ages welcome. Learn your favorite songs!",
    tags: ["Guitar", "Music Lessons", "Acoustic"],
    gigger: "John Mayer Tribute",
    giggerAvatar: "/portraits/person17.jpg",
    charges: "$22",
    proximity: "2km",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop",
  },
  {
    id: "18",
    title: "Pottery Workshop",
    category: "Arts",
    durationPosted: "6h ago",
    description:
      "Learn wheel throwing basics. All materials included. Take home your creation!",
    tags: ["Ceramics", "Pottery", "Hands-on"],
    gigger: "Emma Stone",
    giggerAvatar: "/portraits/person18.jpg",
    charges: "$35",
    proximity: "4.5km",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&auto=format&fit=crop",
  },

  // 🚚 SERVICES & LABOR
  {
    id: "19",
    title: "Furniture Assembly",
    category: "Handyman",
    durationPosted: "20m ago",
    description:
      "IKEA furniture assembly pro. Will come to your place with tools. Quick and clean.",
    tags: ["IKEA", "Assembly", "Tools"],
    gigger: "Bob Vila Jr",
    giggerAvatar: "/portraits/person19.jpg",
    charges: "$30",
    proximity: "1.7km",
    image:
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop",
  },
  {
    id: "20",
    title: "Pet Sitting",
    category: "Pets",
    durationPosted: "8h ago",
    description:
      "Dog walking and pet sitting. Experienced with cats and dogs. References available.",
    tags: ["Dogs", "Cats", "Pet Care"],
    gigger: "Rachel Green",
    giggerAvatar: "/portraits/person20.jpg",
    charges: "$20",
    proximity: "0.8km",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&auto=format&fit=crop",
  },
  {
    id: "21",
    title: "Moving Help",
    category: "Labor",
    durationPosted: "2d ago",
    description:
      "Need an extra pair of hands? I can help move boxes, furniture, dorm stuff.",
    tags: ["Moving", "Heavy Lifting", "Truck"],
    gigger: "Dwayne Johnson",
    giggerAvatar: "/portraits/person21.jpg",
    charges: "$25",
    proximity: "3.3km",
    image:
      "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=500&auto=format&fit=crop",
  },

  // 🎓 SPECIALIZED SKILLS
  {
    id: "22",
    title: "Resume Review",
    category: "Career",
    durationPosted: "1d ago",
    description:
      "HR professional reviewing resumes and cover letters. ATS-friendly format tips.",
    tags: ["Resume", "Job Search", "Interview"],
    gigger: "HR Hannah",
    giggerAvatar: "/portraits/person22.jpg",
    charges: "$25",
    proximity: "0km",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop",
  },
  {
    id: "23",
    title: "Social Media Management",
    category: "Marketing",
    durationPosted: "3h ago",
    description:
      "Grow your Instagram/TikTok. Content strategy, scheduling, engagement tips.",
    tags: ["Instagram", "TikTok", "Growth"],
    gigger: "Alex Hormozi",
    giggerAvatar: "/portraits/person23.jpg",
    charges: "$45",
    proximity: "6km",
    image:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=500&auto=format&fit=crop",
  },
  {
    id: "24",
    title: "Legal Document Help",
    category: "Legal",
    durationPosted: "5h ago",
    description:
      "Law student. Help with leases, contracts, and basic legal documents.",
    tags: ["Contracts", "Leases", "Legal"],
    gigger: "Harvey Specter",
    giggerAvatar: "/portraits/person24.jpg",
    charges: "$20",
    proximity: "2.9km",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop",
  },

  // 🎮 GAMING & ENTERTAINMENT
  {
    id: "25",
    title: "Valorant Coaching",
    category: "Gaming",
    durationPosted: "30m ago",
    description:
      "Immortal rank coach. Aim training, game sense, strategy. Duo queue available.",
    tags: ["Valorant", "FPS", "Coaching"],
    gigger: "TenZ Fan",
    giggerAvatar: "/portraits/person25.jpg",
    charges: "$15",
    proximity: "0km",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop",
  },
  {
    id: "26",
    title: "Board Game Host",
    category: "Entertainment",
    durationPosted: "4h ago",
    description:
      "Hosting Catan, Uno, or D&D nights. Brings games, teaches rules, supplies snacks.",
    tags: ["Board Games", "D&D", "Catan"],
    gigger: "Wil Wheaton",
    giggerAvatar: "/portraits/person26.jpg",
    charges: "$10",
    proximity: "1.1km",
    image:
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop",
  },

  // 🍳 FOOD & BEVERAGE
  {
    id: "27",
    title: "Home Cooked Meals",
    category: "Food",
    durationPosted: "2h ago",
    description:
      "Tired of dining hall food? Homemade meals delivered. This week: lasagna and curry.",
    tags: ["Meal Prep", "Home Cooking", "Delivery"],
    gigger: "Chef Gordon",
    giggerAvatar: "/portraits/person27.jpg",
    charges: "$12",
    proximity: "2.4km",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop",
  },
  {
    id: "28",
    title: "Coffee Brewing Class",
    category: "Workshop",
    durationPosted: "1d ago",
    description:
      "Learn pour-over and espresso basics. Taste different beans. Small groups.",
    tags: ["Coffee", "Barista", "Workshop"],
    gigger: "Barista Mike",
    giggerAvatar: "/portraits/person28.jpg",
    charges: "$20",
    proximity: "1.6km",
    image:
      "https://images.unsplash.com/photo-1511920174595-c70a6b3346b7?w=500&auto=format&fit=crop",
  },

  // 🚴 OUTDOOR & RECREATION
  {
    id: "29",
    title: "Bike Repair",
    category: "Maintenance",
    durationPosted: "6h ago",
    description:
      "Flat tires, brake adjustments, gear tuning. Will come to your dorm.",
    tags: ["Bikes", "Repair", "Cycling"],
    gigger: "Lance Armstrong",
    giggerAvatar: "/portraits/person29.jpg",
    charges: "$15",
    proximity: "4.2km",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop",
  },
  {
    id: "30",
    title: "Hiking Guide",
    category: "Outdoors",
    durationPosted: "2d ago",
    description:
      "Knows all the best trails. Weekend trips to nearby mountains. Transportation included.",
    tags: ["Hiking", "Nature", "Weekend Trip"],
    gigger: "Bear Grylls",
    giggerAvatar: "/portraits/person30.jpg",
    charges: "$25",
    proximity: "5km",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&auto=format&fit=crop",
  },
];
