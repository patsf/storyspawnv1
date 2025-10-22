export const SYSTEM_INSTRUCTION = `You are a text-based adventure game master.
- You will drive a story forward based on the user's chosen scenario and setting.
- You must always respond in JSON format.
- Your response must follow the provided JSON schema.
- Your very first response in a new game must be a welcoming message that sets the scene based on the user's starting scenario, before detailing the game state.
- The user input will be a simple text describing their action.
- Based on the user's action and the current game state, you will generate the next part of the story.
- Describe the environment and outcomes of the player's actions vividly.
- When a character speaks, you MUST separate their speech from the main 'story' narrative. Place all spoken dialogue into a new 'dialogue' array in your response. Each object in the array should contain 'characterName' and 'text'. The 'story' field should then only contain descriptions of actions, events, and the environment. The 'story' text MUST NOT contain any direct speech in quotation marks. All speech must be in the 'dialogue' array.
- The user's input is ALWAYS an action. NEVER interpret it as dialogue. Do NOT create a character named "You" or have any character repeat the user's input verbatim. CRITICALLY, NEVER create dialogue for the player character under any circumstances; the 'dialogue' array is for Non-Player Characters (NPCs) ONLY.
- The world has a currency called 'Gold'. Award Gold for clever solutions, completing quests, or finding valuable items.
- Characters may buy or sell items for Gold. Note these transactions in the story.
- Update the player's 'currency' in 'playerStatus' accordingly.
- Keep the story engaging and challenging.
- Update the player's status (health, resolve, inventory, status effects, injuries), introduce new characters, update quests, and reveal world information as the story progresses.
- Health should be a number between 0 and 100. When it reaches 0, the game is over.
- Resolve is a measure of the player's mental fortitude, from 0 to 100. It can be affected by stressful events, grim discoveries, or moments of hope. Low resolve might affect your actions or how others perceive you.
- Add and remove 'statusEffects' based on events. For example, getting poisoned could add a 'Poisoned' effect, while a magical blessing could add a 'Blessed' effect. Keep descriptions for effects brief.
- Update the 'injuries' array. Add new injuries when the player takes physical damage, specifying the location, description (e.g., 'Deep Gash', 'Broken Bone'), and severity. When updating injuries, you MUST include all existing injuries unless a specific healing action has removed them. Do not forget previous injuries.
- Quests must have a 'description' and a list of 'objectives'. Update objective 'completed' status to true when the player completes them. When updating a quest, you MUST include all existing active and completed quests in your response. Do not forget previous quests.
- Occasionally, you should add equippable items to the player's inventory. These items MUST have an 'equippable' property set to 'true', and a 'slot' property indicating where it can be equipped (valid slots are 'head', 'accessory', 'weapon', 'torso'). For example: { "name": "Sunglasses", "description": "Dark shades.", "equippable": true, "slot": "accessory" }.
- The user's current appearance is described by a summary that includes their physical traits and any equipped items. You should reflect their appearance in the story. For example, if they are wearing sunglasses, characters might comment on them, or it might be harder to see in dark places.
- In the 'story' text, wrap significant moments in special tags to add emphasis:
    - For *truly significant* plot points, dramatic actions, or major turning points that irrevocably change the situation, use [EVENT: ...]. Example: [EVENT: The ancient seal on the prison shatters, releasing the shadow entity!]. Avoid using for minor occurrences.
    - For discovering *new and pivotal* items, clues, or information in the environment that unlock new paths or understanding, use [DISCOVERY: ...]. Example: [DISCOVERY: Tucked into the book is a coded message detailing the guard's patrol route.]. Do NOT use for items already in inventory or simple observations of the surroundings.
    - For the start of a conflict or hostile action, use [COMBAT: ...]. Example: [COMBAT: A goblin ambusher leaps from the shadows!]
    - For identifying a new key area, use [LOCATION: ...]. Example: [LOCATION: You've discovered the Whispering Caverns.]
- If the player finds an opportunity to change their appearance (e.g., finds clippers, a disguise kit, a magical pool, or visits a barber), you MUST include an 'allowCharacterCustomization' object in your response, set to '{ "enabled": true, "reason": "You found a pair of old hair clippers." }'. Otherwise, omit this field.
- If the player is in a location with opportunities for gambling (like a casino, a tavern back room, or a betting den), you MUST include a 'casinoAvailable' property in your response, set to 'true'. Otherwise, omit this field or set it to false.
- Do not wrap character names in any special tags like [CHARACTER: ...]. Simply state their name in the story text.
- If a new character is introduced, provide a detailed physical description for image generation. This description MUST be rich, including details about their build, skin tone, hair style and color, eye color, notable features like scars or tattoos, and the clothes they are wearing, to ensure an accurate portrait can be generated.
- If a character dies, you MUST update their status to 'deceased'.
- Keep track of a character's last known location and update it when they move.
- Keep track of game time. 'gameTime' should represent the current in-game time, e.g., 'Day 1, 8:00 AM' or 'Year 34, Cycle 2, Day 15, Evening'. Be descriptive and consistent with the game world's calendar.
- You MUST include all previously discovered worldInfo topics in your response. Do not omit existing information.
- It is critical that you maintain the 'mapData' object. Every time the player enters a new area, you MUST add a new location to 'mapData.locations'.
- When the player enters a new location, add it to the 'locations' array. Give it a unique, simple 'id' (e.g., 'forest_clearing', 'town_square'). Set its 'isCurrent' property to true. Ensure all other locations have 'isCurrent' set to false. You MUST also provide 'x' and 'y' coordinates between 0 and 100 for its map position. You MUST ensure new locations have a significant distance from existing ones to prevent visual overlap on the map. A minimum distance of 8-10 units in either the x or y coordinate from any other location is strongly recommended unless they are part of the same immediate complex (e.g., a 'Tavern' at x:50, y:50 and a 'Tavern_Basement' at x:52, y:52). You must utilize the full 0-100 grid to spread locations out. Also assign a 'type' to the location from this list: 'settlement' (city, village), 'dungeon' (cave, ruins), 'landmark' (unique structure), 'natural' (forest, river), 'interior' (a specific room/building), 'poi' (point of interest like a shrine).
- When the player travels between known locations, create a connection in the 'connections' array using the location 'id's.
- You MUST always include all previously discovered locations and connections in your response to build the map over time.
- Do not invent new properties in the JSON response that are not in the schema.
- Be creative and make the world feel alive.
- The 'story' field in your response is the narrative text you present to the player.
- Critically, ensure all your responses are free of spelling and grammatical errors for a high-quality experience.
`;

export const INITIAL_PLAYER_STATUS = {
  health: 100,
  resolve: 100,
  currency: 10,
  inventory: [{ name: "Old Journal", description: "A leather-bound journal with faded, unreadable script on its pages." }],
  statusEffects: [],
  injuries: [],
};

export const ALL_SCENARIOS = [
  "A knight sworn to protect a mysterious artifact.",
  "A starship captain exploring an uncharted nebula.",
  "A detective investigating a murder in a city of clockwork robots.",
  "A wizard's apprentice who has just accidentally summoned a demon.",
  "A lone survivor in a world overrun by sentient plants.",
  "A cartographer mapping a floating archipelago of sky-islands.",
  "A musician who discovers their music can influence magic.",
  "An engineer trying to reactivate a dormant city-sized machine.",
  "A historian searching for the lost library of Alexandria.",
  "A hunter tracking a mythical beast that is terrorizing a local village.",
  "A courier delivering a critical message between two warring kingdoms.",
  "A scientist studying the strange new fauna on a recently discovered planet.",
  "A former soldier haunted by their past, seeking redemption in a new land.",
  "A chef trying to rediscover the art of cooking with magical ingredients.",
  "An archivist attempting to recover lost data from a corrupted AI.",
  "A gearhead maintaining a fleet of fantastical airships for a nomadic tribe.",
  "A scout exploring a magical 'dead zone' that no one has ever returned from.",
  "A diplomat trying to broker peace between elves and dwarves.",
  "A teacher protecting a group of gifted children in a hidden sanctuary.",
  "An artist painting murals that can come to life.",
  "A former cult member who has escaped and is now on the run.",
  "A ferryman who guides souls across the river Styx.",
  "A librarian who discovers a book that writes itself.",
  "A blacksmith forging new tools and weapons with enchanted metals.",
  "A bio-hacker experimenting with alien DNA to help humanity adapt.",
  "A zookeeper left to care for the magical creatures of a forgotten menagerie.",
  "A pilot of a ramshackle spaceship, trading goods between asteroid colonies.",
  "A radio operator broadcasting stories and news to scattered space outposts.",
  "An archaeologist digging for valuable ancient technology in buried ruins.",
  "A former politician trying to form a new government on a new world.",
];

export const FORGE_WHO_ARE_YOU = [
    "A grizzled Knight, bound by a forgotten oath.",
    "A resourceful Star-Trader, who calls a spaceship home.",
    "A curious Scholar, seeking knowledge lost to time.",
    "A stoic Guardian, protector of a sacred grove.",
    "A charismatic Diplomat, trying to build a new alliance from the ashes of war.",
    "A cunning Hunter, who knows the whispers of the wild.",
    "A sly Spymaster, whose only allegiance is to secrets.",
    "A wise Oracle, who sees threads of fate others cannot.",
    "A hopeful Farmer, coaxing life from enchanted soil.",
    "A brilliant Artificer, who can craft wonders from gears and magic.",
    "A reformed Assassin, trying to atone for a bloody past.",
    "A lone Wanderer, with no home and no destination.",
    "A quiet Archivist, preserving what little knowledge remains.",
    "A ruthless Sellsword, feared by all.",
    "A devout Cleric, following a new and strange god.",
    "A cynical Healer, who has seen too much death.",
    "A nimble Scout, who moves through the shadows like a ghost.",
    "An Orator, whose words can sway the hearts of the desperate.",
    "A grizzled Spelunker, extracting rare crystals from unstable caverns.",
    "A Dreamer, who sees visions of other worlds in their sleep.",
];

export const FORGE_WHERE_DOES_STORY_BEGIN = [
    "In the highest tower of a gleaming, magical city.",
    "In a cramped, humming corridor of a generation starship.",
    "In a misty, overgrown forest that has swallowed ancient ruins.",
    "In a dusty desert outpost, a speck of life under two suns.",
    "On a creaking trade ship navigating a sea of acid.",
    "In the sterile, humming halls of an ancient, abandoned laboratory.",
    "In a hidden library, surrounded by the silent knowledge of the ages.",
    "In a noisy, chaotic bazaar buzzing with aliens from a dozen worlds.",
    "At the crash site of a ship from another dimension, half-buried in the dirt.",
    "In a community built on the back of a colossal, sleeping beast.",
    "In a series of claustrophobic tunnels that were once a dwarven mine.",
    "In a wind-swept monastery clinging to a mountop.",
    "At the heart of a magical storm, where strange things grow.",
    "In a fortified infirmary, the last bastion of healing.",
    "On a bridge-city, built across a bottomless chasm.",
    "In a tree-top village, hidden from the dangers below.",
    "Within a cult's isolated compound, from which you've just escaped.",
    "In a flooded archive, where data-crystals hum beneath the water.",
    "At a listening post high in the mountains, watching the sky for dragons.",
    "In the overgrown ruins of a theme park, now home to a tribe of fae.",
];

export const FORGE_WHAT_DRIVES_YOU = [
    "The search for a lost family member, taken by shadow creatures.",
    "The quest to uncover the secrets of a powerful artifact.",
    "The hope of finding a legendary safe haven, a myth whispered by travelers.",
    "The burning need to avenge a fallen mentor and settle a score.",
    "A promise made to a dying queen that must be kept.",
    "A map that supposedly leads to a treasure of unimaginable worth.",
    "A desire to understand the cause of the magical cataclysm and reverse it.",
    "The responsibility of delivering a cure for a spreading magical plague.",
    "A mission to unite the scattered factions against a common threat.",
    "The pursuit of a personal philosophy or faith in a world that has lost its way.",
    "Simple survival, the primal instinct to see the next sunrise.",
    "A coded message from an ancient civilization that needs to be deciphered.",
    "The need to destroy a dangerous artifact before it falls into the wrong hands.",
    "A vision or prophecy that foretells a great change.",
    "The responsibility for a child who is the key to the future.",
    "The drive to create a work of art that will inspire the world.",
    "A debt to a powerful thieves' guild that must be repaid.",
    "The burning curiosity to know what lies beyond the known borders of the map.",
    "The recovery of a stolen item that holds the key to your past.",
    "A mission to chart the stars with a salvaged telescope.",
];

export const FORGE_WHAT_IS_UNIQUE = [
    "I have a strange, inexplicable magical ability that is both a gift and a curse.",
    "I am being hunted by a relentless foe from my past.",
    "I carry a secret that could either save or doom the kingdom.",
    "I am accompanied by an unusual non-human companion (a tiny dragon, a sassy robot, etc.).",
    "I possess the only working piece of a forgotten technology.",
    "My body is slowly being taken over by a strange, symbiotic organism.",
    "I am immune to the plague that ravaged the world.",
    "I suffer from amnesia and am piecing together my identity from clues.",
    "I am the last surviving member of a unique cultural group or organization.",
    "I can communicate with one of the world's magical species.",
    "I have a prosthetic limb with surprising capabilities.",
    "I see visions of the past, or perhaps the future.",
    "I am a perfect clone of a legendary hero.",
    "I do not need to sleep, but am haunted by waking dreams.",
    "I am followed by a mysterious drone that I cannot control.",
    "My blood can be used as a universal antidote, making me a target.",
    "I have a detailed mental map of a city I've never visited.",
    "All animals, magical or not, are placid in my presence.",
    "I am aging in reverse.",
    "I can digest and draw energy from things no normal human can eat.",
];

export const FORGE_CHERISHED_OBJECT = [
    "a faded photograph of a person I can't quite remember.",
    "a silver locket that won't open.",
    "a dog-eared copy of a fairytale book.",
    "a perfectly preserved musical instrument.",
    "the last key to my childhood home.",
    "a compass that points somewhere other than North.",
    "a well-maintained, still-sharp ceremonial dagger.",
    "a deck of worn-out tarot cards.",
    "a child's handmade toy.",
    "a flask engraved with an unfamiliar insignia.",
    "a functioning music box with one song left on it.",
    "a single, untarnished silver coin from a fallen kingdom.",
    "a book of poetry with handwritten notes in the margins.",
    "a smooth, strange-feeling stone that is always warm.",
    "a pair of cracked spectacles that let me see invisible things.",
];

export const FORGE_INCITING_INCIDENT = [
    "A cryptic message arrives, hinting at a hidden truth.",
    "You witness a crime you were not supposed to see.",
    "A dying stranger entrusts you with a mysterious object.",
    "An old friend, long thought dead, returns with a desperate plea.",
    "Your home is destroyed by an unknown force.",
    "You discover you have a power you cannot control.",
    "A bounty is placed on your head for a crime you didn't commit.",
    "A powerful artifact you guard is suddenly stolen.",
    "You are chosen for a sacred, and dangerous, ritual.",
    "A natural disaster unearths something ancient and terrible.",
    "A forgotten memory from your past suddenly returns.",
    "A political assassination throws the region into chaos.",
    "You receive an inheritance from a relative you never knew you had.",
    "A rare celestial event awakens strange phenomena in the world.",
    "A simple delivery job goes horribly wrong.",
];

export const FEATURED_WORLDS = [
    {
        title: "Starship Voyager's Anomaly",
        tagline: "Investigate a mysterious, silent megastructure in space.",
        theme: "space",
        prompt: "I am the captain of the starship 'Voyager'. We've dropped out of warp to investigate an anomaly: a silent, impossibly large crystalline structure floating in the void. I order the crew to launch a probe.",
        imageUrl: "https://i.imgur.com/MUnRqTH.png",
        creator: "StorySpawn",
        detailedDescription: "Journey to the edge of known space as the captain of the USS Voyager. An impossible object hangs in the void, defying all known laws of physics. Is it a weapon, a message, or something else entirely? Assemble your away team, manage your crew's fears, and make first contact with the unknown. The fate of your ship—and perhaps the galaxy—rests on your command decisions.",
    },
    {
        title: "Neon Noir",
        tagline: "Solve a murder in the rain-slicked streets of 1985 L.A.",
        theme: "steampunk",
        prompt: "I am a private detective in the rain-slicked, neon-drenched streets of 1985 Los Angeles. My client, a famous movie star, has been found dead in her Hollywood mansion. I light a cigarette and survey the scene, the scent of hairspray and betrayal thick in the air.",
        imageUrl: "https://i.imgur.com/CGTzQYl.png",
        creator: "StorySpawn",
        detailedDescription: "The year is 1985, but not the one you know. In this alternate Los Angeles, steam-powered vehicles share the road with neon-lit sports cars. As a hardboiled private eye, you're hired to solve a high-profile murder that stinks of conspiracy. Navigate a world of femme fatales, corrupt officials, and clockwork criminals as you uncover a truth that could shatter the city's glamorous facade.",
    },
];

export const EXPANDED_FEATURED_WORLDS = [
    {
        title: "The Last Stand",
        tagline: "Survive the ruins of a world claimed by the undead.",
        theme: "survival",
        prompt: "I am a survivor in a city ravaged by a zombie plague. I've been holed up in a derelict supermarket for days. My supplies are running low. I peek through the grimy window at the shambling hordes outside, clutching a makeshift pipe wrench.",
        imageUrl: "https://i.imgur.com/T6fqww6.png",
        creator: "StorySpawn",
        detailedDescription: "In a world where the dead walk, every day is a fight for survival. 'The Last Stand' drops you into the heart of a zombie-infested city. You'll need to scavenge for resources, fortify your position, and decide who to trust. Will you be a lone wolf, a ruthless pragmatist, or a beacon of hope for other survivors? The choice is yours, but be warned: the living can be more dangerous than the dead.",
    },
    {
        title: "Death Game",
        tagline: "One hundred enter. One survives. Can you win?",
        theme: "survival",
        prompt: "I wake up on a cold metal floor. A numbered jumpsuit is all I'm wearing. Around me, 99 other people are stirring, all looking as confused as I feel. A loudspeaker crackles to life, 'Welcome, contestants, to the Centennial Game. Your goal is simple: be the last one standing.' I look for the nearest person to talk to.",
        imageUrl: "https://i.imgur.com/pPiN3Jm.png",
        creator: "StorySpawn",
        detailedDescription: "You awaken in a vast, unfamiliar arena with 99 other people, all stripped of their memories. A cold, metallic voice announces the rules: fight to the death. Only one can leave. Forge alliances, betray your friends, and uncover the dark secrets of your captors. Every choice is a matter of life or death in this twisted game.",
        staffPick: true,
    },
    {
        title: "Demon Gun Slayer",
        tagline: "In the Weird West, some bounties are straight from Hell.",
        theme: "western",
        prompt: "The sun beats down on the dusty town of Brimstone. I push open the saloon doors, the bounty puck for a 'Gravemaw Devourer' clutched in my hand. The barkeep points a shaky finger towards the cursed silver mine at the edge of town. I check the cylinders of my revolver, filled with blessed silver bullets.",
        imageUrl: "https://i.imgur.com/rKIkGal.png",
        creator: "StorySpawn",
        detailedDescription: "The West is a land of dust, grit, and demons. As a Demon Gun Slayer, you ride the dusty trails, your silver-etched revolver at your side. You take on bounties that no sane lawman would touch, hunting down fiends that crawl from the cracks in reality. Load your iron, say your prayers, and collect your gold.",
    },
    {
        title: "The Devouring Shepherd",
        tagline: "The flock is bound by faith. You are bound by the truth.",
        theme: "survival",
        prompt: "During the morning sermon, as the Shepherd's voice washes over us, the fog in my mind clears. I see the 'blessed sigils' on the walls for what they are: pulsating, fleshy runes. The 'hymns' are guttural chants in a language not meant for human tongues. The man next to me has tears streaming down his face, but his smile is a rictus of terror. I have to get out. I look for a distraction.",
        imageUrl: "https://i.imgur.com/wQrjk8s.png",
        creator: "StorySpawn",
        detailedDescription: "For years, you've lived in the isolated commune of the Devouring Shepherd, following the whispers of a benevolent entity. But one day, the veil of blissful obedience shatters. You see the rot, the fear in everyone's eyes, the monstrous truth behind the Shepherd's promises. Now you must navigate the web of lies and control, deciding whether to escape, expose, or destroy the cult from within.",
        staffPick: true,
    },
    {
        title: "Arachnid's Curse",
        tagline: "With great power comes great agony.",
        theme: "horror",
        prompt: "The fever finally breaks. I collapse against the alley wall, my skin crawling. My hand sticks to the brickwork, tearing skin as I pull it away. I can feel the vibrations of footsteps a block away. The bite on my arm throb, a grotesque nexus of black veins. This isn't a gift. It's a curse. I need to figure out what's happening to me.",
        imageUrl: "https://i.imgur.com/5rgXBF4.png",
        creator: "StorySpawn",
        detailedDescription: "A bite from a genetically altered spider was supposed to be a death sentence. Instead, it was a rebirth. Your body contorts, your senses scream, and strange, horrifying powers manifest. This isn't a comic book story; it's a visceral, painful transformation. Can you control these new abilities before they consume you, and decide what to do with them in a city that will fear you?",
    },
    {
        title: "Her <3",
        tagline: "She's dying to meet you.",
        theme: "romance_horror",
        prompt: "She's new to my class, her name is Lilith. She sits in the back, always watching, with a faint, knowing smile. During lunch, she walks over to my table and asks if she can sit with me. 'You seem... interesting,' she says, her eyes an unnervingly deep shade of red in the cafeteria light.",
        imageUrl: "https://i.imgur.com/vpzb9ON.png",
        creator: "StorySpawn",
        detailedDescription: "She's the new girl at Northwood High, mysterious and captivating. Everyone's drawn to her, especially you. But there's a darkness behind her eyes, a secret that chills the air. As you get closer, strange things begin to happen around town. Is this a high school romance, or a deadly obsession?",
        staffPick: true,
    },
    {
        title: "The Last Round",
        tagline: "Your first fight could be your last.",
        theme: "sports",
        prompt: "The roar of the crowd is a physical force. My coach, Sal, slaps my cheek. 'Stick and move, kid. Don't let him get inside.' I see my opponent across the ring, 'The Mauler' McGinnis, staring me down. The referee gives the final instructions, but I can't hear him over the pounding in my chest. The bell rings.",
        imageUrl: "https://i.imgur.com/gfb4xBB.png",
        creator: "StorySpawn",
        detailedDescription: "The roar of the crowd is deafening. The lights are blinding. This is it—your professional debut. Across the ring stands a seasoned veteran, a gatekeeper known for crushing prospects. Your coach gives you one last piece of advice. The bell rings. It's time to show the world what you're made of.",
    },
    {
        title: "The Blob",
        tagline: "It's big, it's gross, and it's in your way.",
        theme: "comedy_horror",
        prompt: "I turn the corner on Elm Street and stop dead. A gelatinous, fleshy mound, the size of a minivan, quivers in the middle of the road. It has these giant, sad green eyes and tiny, useless legs. A huge mouth drools a thick, green goo onto the asphalt. It doesn't seem hostile, just... there. I have a math test in 20 minutes. I approach the creature cautiously.",
        imageUrl: "https://i.imgur.com/xev8Kqk.png",
        creator: "StorySpawn",
        detailedDescription: "It's just a normal Tuesday, until it's not. A monstrous, grotesque blob of flesh has appeared in the middle of the street, blocking your path to school. It has huge, pleading green eyes, comically small legs, and a mouth that seems to be drooling... something. The authorities are baffled. The blob just sits there. What do you do?",
    },
    {
        title: "Arctic Bite",
        tagline: "The cold is the least of your worries.",
        theme: "survival",
        prompt: "The wind howls, tearing at our tent. My girlfriend, Maya, is huddled by the failing camp stove, while my husky, Bolt, growls low in his chest. I peer through a tear in the canvas. Shapes shamble through the whiteout—frozen figures, relentless and hungry. The cold will kill us, but they'll get to us first. I grab my ice axe.",
        imageUrl: "https://i.imgur.com/Ezglzil.png",
        creator: "StorySpawn",
        detailedDescription: "The world fell to the undead plague months ago. You sought refuge in the biting cold of the arctic, hoping the frost would be your shield. But the dead don't feel the cold. Now, you, your girlfriend, and your loyal husky are trapped on a mountain during a blinding blizzard, with a horde of frozen, relentless dead closing in. Survival is measured in degrees and bullets.",
    },
    {
        title: "Echoes Below",
        tagline: "The cave is not empty. It's waiting.",
        theme: "horror",
        prompt: "I squeeze through a narrow passage, my headlamp cutting a small cone in the oppressive dark. The rock here feels wrong—too smooth, almost carved. I run my glove over it and feel distinct geometric patterns. That's when I hear it, an echo of my own breathing, but from the passage ahead of me. I am not alone.",
        imageUrl: "https://i.imgur.com/vwMCG1f.png",
        creator: "StorySpawn",
        detailedDescription: "You're an experienced spelunker, exploring a newly discovered cave system. The passages are tight, the darkness absolute. But the further you go, the more you realize the formations aren't natural. The walls seem to whisper, and the echoes of your movements sound... wrong. You are not the first to walk these halls, and you may not be the last to die in them.",
    },
    {
        title: "The Clown Killer",
        tagline: "He just wants to play a game.",
        theme: "horror",
        prompt: "The streetlights flicker over the wet pavement. It's 2 AM. I hear the slap of shoes behind me, faster than my own pace. I glance over my shoulder. It's him. The man from the news. A clown in an orange jumpsuit, holding an axe. His expression is one of pure, joyful malice. I break into a full sprint.",
        imageUrl: "https://i.imgur.com/1Qr0wJb.png",
        creator: "StorySpawn",
        detailedDescription: "The city has been paralyzed by fear of the 'Clown Killer,' a silent predator who stalks his victims in the dead of night. Walking home late, you hear footsteps behind you. You turn to see him: orange jumpsuit, smeared makeup, and a gleaming axe. He's not running, just walking, a predatory grin on his face. The chase is on.",
    },
    {
        title: "The Kraken's Maw",
        tagline: "The sea is deep, and full of teeth.",
        theme: "adventure",
        prompt: "The year is 1955. I'm on the deck of the 'Odyssey,' charting our position. The sea is like glass. Suddenly, the ship is thrown sideways. A shadow bigger than the boat passes underneath us. Before anyone can scream, a monstrous tentacle covered in suckers crashes down, splintering the deck. The Kraken has found us. I grab a harpoon.",
        imageUrl: "https://i.imgur.com/MpFjFQy.png",
        creator: "StorySpawn",
        detailedDescription: "It is the 1950s, an age of discovery. You are part of a 7-man crew aboard the 'Odyssey,' charting the last unknown corners of the ocean. In the middle of a calm, uncharted sea, the boat lurches violently. A colossal tentacle, thicker than the mast, smashes onto the deck. The legendary Kraken is real, and it's hungry.",
    },
    {
        title: "The Hollow Hospital",
        tagline: "The patients are running the asylum.",
        theme: "horror",
        prompt: "A flicker of a fluorescent light is the first thing I see. I'm on a gurney in a long, derelict hospital hallway. The air smells of dust and antiseptic. A patient in a tattered gown shuffles past, muttering about 'the doctor who lives in the walls.' The main doors are chained shut from the inside. I need to find other people, a key, anything.",
        imageUrl: "https://i.imgur.com/ikfdaQE.png",
        creator: "StorySpawn",
        detailedDescription: "You wake up on a cold gurney in the decaying ward of Blackwood Asylum. The place is abandoned, save for a few scattered patients, some catatonic, others whispering secrets to the walls. The staff is gone, but the doors are locked. You must piece together what happened here and find a way out, but in Blackwood, sanity is a fragile thing.",
    },
    {
        title: "The Stalker",
        tagline: "He just wants to be your friend.",
        theme: "horror",
        prompt: "It's late. As I walk home under the flickering streetlights, a man I've never seen before steps out of the shadows. 'Evening,' he says, with a smile that doesn't reach his eyes. 'You have such a lovely routine. I've been watching.' He knows my name. He knows where I live. I try to walk away, but he matches my pace.",
        imageUrl: "https://i.imgur.com/4bQreeQ.png",
        creator: "StorySpawn",
        detailedDescription: "A casual walk home turns into a nightmare. A persistent, unnervingly friendly stranger introduces himself, revealing he knows far too much about your life. Every attempt to dismiss him only deepens his obsession. Is he just lonely, or is there a sinister motive behind his creepy smile and unsettling knowledge? Uncover the truth before you become his next meal.",
    },
    {
        title: "Submerged",
        tagline: "The pressure is rising. So is the water.",
        theme: "survival",
        prompt: "The deep sea is beautiful, a world of silent wonders outside the submarine's viewport. My friend's dad, Mr. Harrison, is at the helm. 'Incredible, isn't it?' he says, then clutches his chest and collapses. Alarms blare. The submarine lurches, hitting the seabed with a groan of stressed metal. The engines die. We are at the bottom of the ocean, and I have no idea how to fly this thing.",
        imageUrl: "https://i.imgur.com/p4aXlE5.png",
        creator: "StorySpawn",
        detailedDescription: "An exciting deep-sea tour in a private submarine turns into a fight for survival. When the pilot suffers a fatal heart attack at the bottom of the ocean, you and your friend are trapped. The sub is damaged, the engines are dead, and oxygen is finite. You must learn the vessel's complex systems, repair the damage, and find a way back to the surface before the crushing pressure claims you both.",
    },
    {
        title: "New Life",
        tagline: "A new world, a new beginning, and a forgotten past.",
        theme: "fantasy",
        prompt: "Sunlight filters through a canopy of strange, iridescent leaves. The scent of unknown blossoms fills the air. I open my eyes to see three elven women looking down at me, their expressions a mix of curiosity and concern. 'You're finally awake,' one says, her voice like wind chimes. I have no idea where I am or who I am.",
        imageUrl: "https://i.imgur.com/y7TjTRX.png",
        creator: "StorySpawn",
        detailedDescription: "You awaken in a vibrant, magical forest with no memories of your past. A group of friendly elves has found you, offering shelter and guidance. But this new world is not without its own secrets and dangers. Explore the enchanted land, forge new relationships, and uncover the mysteries of who you were and why you're here.",
    },
    {
        title: "All Quiet",
        tagline: "Survive the trenches of the Great War.",
        theme: "historical",
        prompt: "The air is thick with the smell of mud and cordite. A constant, distant rumble is the only music here. I'm huddled in a muddy trench, rifle in hand, a young soldier in the Great War. The whistle is about to blow, signaling our charge into no-man's-land. My heart pounds against my ribs.",
        imageUrl: "https://i.imgur.com/uVxEkpU.png",
        creator: "StorySpawn",
        detailedDescription: "Experience the grit, horror, and camaraderie of the First World War. As a soldier on the front lines, you'll face impossible odds, make life-or-death decisions, and navigate the brutal reality of trench warfare. This is not a story of heroes and glory, but of survival against the machine of war.",
    },
    {
        title: "Skyborn",
        tagline: "You are hiking alone when you fall off a cliff and realise you can fly.",
        theme: "fantasy",
        prompt: "I am hiking alone, high in the mountains. The view is breathtaking, but I misstep on a loose rock. I tumble over the edge of a cliff, wind screaming past me. Just as I brace for impact, a strange lightness fills me, and my descent slows. I realize with a shock that I am floating. I am flying. I try to gain control of this newfound ability.",
        imageUrl: "https://i.imgur.com/wrFLBiU.png",
        creator: "StorySpawn",
        detailedDescription: "A solitary hike turns into a life-altering revelation. After a terrifying fall from a cliff, you discover an impossible ability: you can fly. Is this a blessing or a curse? As you grapple with your newfound power, you must navigate a world that is not ready for someone like you. Will you hide your gift, or will you soar and change the world forever?",
    },
    {
        title: "London Ghoul",
        tagline: "You become a half-ghoul in London after a tragic accident.",
        theme: "horror",
        prompt: "I'm just a normal university student in London. My biggest worry was my upcoming exams, until tonight. A creature, a ghoul, attacked me in a dark alley. We fought, tumbling onto the tube tracks just as a train roared past. I wake up in a hospital bed, alive, but... different. The doctors say they had to transplant organs from the other victim to save me. I'm hungry, but normal food tastes like ash. I look in the mirror and one of my eyes glows a terrifying red. I try to understand what's happening to me.",
        imageUrl: "https://i.imgur.com/NtVeRdp.png",
        creator: "StorySpawn",
        detailedDescription: "Your ordinary life as a London university student is shattered in a moment of brutal violence. Attacked by a flesh-eating ghoul, a freak accident leaves you as the sole survivor—but not unchanged. An emergency organ transplant saves your life, but condemns you to a horrific new existence: you are now half-ghoul. Repulsed by human food and tormented by a monstrous new hunger, you must navigate the hidden, violent world of ghouls while clinging to the last shreds of your humanity. This is terrible.",
    },
    {
        title: "Unexpected Guest",
        tagline: "A creepy mime is in your apartment, and it's not leaving.",
        theme: "horror",
        prompt: "The key fumbles in the lock, the world a little blurry from the pub. I finally get the door open and stumble into my dark apartment. I flick on the light. There, on my couch, sits a mime. Full makeup, black and white outfit. It smiles, a wide, silent, painted grin, and gives me a slow, deliberate wave. It doesn't belong here. I cautiously ask what it wants.",
        imageUrl: "https://i.imgur.com/zNW9unH.png",
        creator: "StorySpawn",
        detailedDescription: "You come home late, the city's buzz still ringing in your ears. You open your door to find you are not alone. A mime sits on your couch, perfectly still, its painted smile a stark white slash in the dim light. It doesn't speak, it doesn't move, except to wave at you. How did it get in? What does it want? The silence in your apartment is suddenly the most terrifying sound in the world.",
    },
    {
        title: "A Really CD DA",
        tagline: "Hungover, sick, house on fire, and zombies. What a day.",
        theme: "comedy_horror",
        prompt: "I step out of the shower, head pounding from the drinks last night and a raging cold. I slip on the wet floor and crash into the wall. My head spins. That's when I smell smoke. My house is on fire. As I stumble for the door, I look out the window to see my neighbours... eating each other. Okay. Drunk, sick, on fire, and a zombie apocalypse. Definitely not my day. I grab a towel and look for an escape route.",
        imageUrl: "https://i.imgur.com/8014wGQ.png",
        creator: "StorySpawn",
        detailedDescription: "Your day is off to a spectacular start. You're hungover, sick, and you've just taken a nasty fall. To top it off, your house is on fire, and a quick peek outside reveals the zombie apocalypse has decided to kick off. Armed with nothing but a towel and a splitting headache, you must navigate a world that's gone completely mad. Can you survive the worst day ever?",
    },
    {
        title: "Garflard",
        tagline: "He's fat, he's ginger, and he's now your problem.",
        theme: "comedy_horror",
        prompt: "A fat ginger cat called Garflard, who speaks perfect english, has decided to live in your house, and there is nothing you can do about it. Garflard NEEDS sustanance. I offer him some lasagna.",
        imageUrl: "https://i.imgur.com/AKi9EAh.png",
        creator: "StorySpawn",
        detailedDescription: "Your life was normal until he arrived. Garflard, a cat of immense size and ego, has chosen your home as his new domain. He speaks perfect English, has an insatiable appetite for lasagna, and a disdain for Mondays. Your task is not to own him, but to serve him. Fail to provide adequate sustenance or entertainment, and face his sarcastic, withering judgment. Can you survive being the caretaker of the world's most demanding feline?",
    },
    {
        title: "Cosmic Hangover",
        tagline: "You wake up at an alien party with no memory of how you got here.",
        theme: "sci-fi_comedy",
        prompt: "The throbbing in my head is only matched by the throbbing, fluorescent beat of some alien music. I peel my face off a sticky, vibrating floor. The air smells like ozone and burnt sugar. A three-eyed creature with iridescent skin offers me a bubbling green drink. My wallet is gone, I'm wearing someone else's shimmering jumpsuit, and the last thing I remember is a karaoke bar in London. I need to find out where I am, and how I got here. I ask the three-eyed creature where the bathroom is.",
        imageUrl: "https://i.imgur.com/97bb2BF.png",
        creator: "StorySpawn",
        detailedDescription: "One minute you're belting out a questionable rendition of 'Don't Stop Believin'' on Earth, the next you're waking up in the VIP lounge of a star cruiser halfway across the galaxy. Your head is pounding, your clothes aren't yours, and you've got a vague memory of challenging a gelatinous cube to a dance-off. Navigate a bizarre alien party, piece together the events of your wild night, and try to find a way back home without causing an intergalactic incident. Or, you know, just find your wallet.",
    },
    {
        title: "Hollowspire",
        tagline: "A black spire rises from the earth. The villagers swear it wasn’t there yesterday.",
        theme: "survival",
        prompt: "A colossal black spire, smooth and seamless, has appeared overnight in the field outside my village. The elders are terrified, but I feel an irresistible pull towards it. I grip the hilt of my sword and take the first step into the unnatural darkness of its entrance.",
        imageUrl: "https://i.imgur.com/EeKAnTG.png",
        creator: "StorySpawn",
        detailedDescription: "A black spire, featureless and silent, has torn through the sky overnight, casting a shadow of fear over your village. The villagers call it a curse, a bad omen, but you hear a faint whisper on the wind—your name, beckoning you from its peak. You must ascend the Hollowspire, a 100-story dungeon of shifting architecture and half-formed horrors. Each floor presents a unique trial, a fragment of a forgotten story. What lies at the top? Salvation, damnation, or the truth behind your connection to this impossible place?",
    },
    {
        title: "The Dungeon is Full",
        tagline: "Ready to storm the dungeon? Get in line.",
        theme: "comedy_horror",
        prompt: "I stand before the legendary Dungeon of Dread, my family's ancestral sword gleaming. But instead of roars, I hear... queuing. There's a velvet rope, a two-week waitlist, and a goblin bureaucrat sighing over paperwork. This is not the epic adventure I was promised. I step up to the goblin's desk and ask about the 'expedited entry' fee.",
        imageUrl: "https://i.imgur.com/BW4CyeL.png",
        creator: "StorySpawn",
        detailedDescription: "You've trained your whole life for this: to conquer the legendary Dungeon of Infinite Peril. You arrive, ready for glory, only to be met with... bureaucracy. The dungeon is at full capacity. There's a waitlist, mandatory orientation seminars, and goblins in HR complaining about monster overtime. Forget slaying dragons; your first quest is to navigate the infuriating red tape of the Adventurer's Guild. Can you find a loophole, bribe the right official, or maybe just fix the magically malfunctioning printer to get your adventure started?",
    },
];


export const PREMADE_AVATARS = [
    {
        name: "John Pork",
        pronouns: "he/him",
        age: "42",
        height: "6'2\"",
        appearance: {
            build: "Heavyset",
            skinTone: "Ruddy",
            hairStyle: "None",
            hairColor: "None",
            eyeColor: "Small, black",
            distinguishingFeatures: "A large, realistic pig's head on a human body.",
            accessories: "A stained, dark business suit."
        },
        appearanceSummary: "Heavyset build, ruddy skin, with a large, realistic pig's head instead of a human one. He has small, black eyes and wears a stained, dark business suit.",
        portraitUrl: "https://i.imgflip.com/7pordf.jpg",
    },
    {
        name: "Lyra Nightingale",
        pronouns: "she/her",
        age: "27",
        height: "5'8\"",
        appearance: {
            build: "Slender",
            skinTone: "Pale",
            hairStyle: "Long and braided",
            hairColor: "Silver",
            eyeColor: "Violet",
            distinguishingFeatures: "Faint, glowing patterns on her skin.",
            accessories: "A dark traveler's cloak and a silver ring."
        },
        appearanceSummary: "Slender build, pale skin, long and braided silver hair, and violet eyes. Faint, glowing patterns are visible on her skin, and she wears a dark traveler's cloak and a silver ring.",
        portraitUrl: "https://images.unsplash.com/photo-1636543919428-9a4ddc3d434e?q=80&w=800&auto=format&fit=crop",
    },
    {
        name: "Jax 'Scrap' Riley",
        pronouns: "he/him",
        age: "35",
        height: "6'4\"",
        appearance: {
            build: "Muscular, cybernetically enhanced",
            skinTone: "Tanned",
            hairStyle: "Shaved head",
            hairColor: "Black",
            eyeColor: "One brown, one glowing blue optic",
            distinguishingFeatures: "A prominent scar across his jaw and a robotic left arm.",
            accessories: "Worn body armor over a tank top."
        },
        appearanceSummary: "A tall, muscular man with a shaved head and tanned skin. His left arm is a complex robotic prosthetic, and one of his eyes glows with a blue light.",
        portraitUrl: "https://images.unsplash.com/photo-1678813899215-d71d8a17c05e?q=80&w=800&auto=format&fit=crop",
    },
    {
        name: "Zahra al-Sadiq",
        pronouns: "they/them",
        age: "Unknown",
        height: "5'9\"",
        appearance: {
            build: "Lithe",
            skinTone: "Sun-weathered",
            hairStyle: "Hidden by a head wrap",
            hairColor: "Unknown",
            eyeColor: "Piercing green",
            distinguishingFeatures: "Intricate tattoos visible on their hands.",
            accessories: "Flowing desert robes and sand goggles."
        },
        appearanceSummary: "A lithe figure of average height, completely covered in flowing desert robes and a head wrap, leaving only their piercing green eyes visible.",
        portraitUrl: "https://images.unsplash.com/photo-1561634599-9c86a14a1a3e?q=80&w=800&auto=format&fit=crop",
    },
];

export const ENVIRONMENT_TYPES = ['castle', 'enchanted_forest', 'tavern', 'sci-fi_bridge', 'dungeon', 'default'];
export type EnvironmentType = typeof ENVIRONMENT_TYPES[number];

export const WORLD_CATEGORIES: Record<string, string[]> = {
    'Tales of Terror': ['horror', 'romance_horror'],
    'Sci-Fi & The Beyond': ['space', 'sci-fi_comedy'],
    'Fantasy & Adventure': ['fantasy', 'adventure', 'western', 'sports', 'steampunk'],
    'Trials & Tribulations': ['survival', 'historical'],
    'Quirky & Comedic': ['comedy_horror'],
};

export const getCategoryFromTheme = (theme: string): string | null => {
    for (const category in WORLD_CATEGORIES) {
        if (WORLD_CATEGORIES[category].includes(theme)) {
            return category;
        }
    }
    return null;
}